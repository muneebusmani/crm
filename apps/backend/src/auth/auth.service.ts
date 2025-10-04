/** biome-ignore-all lint/style/noNonNullAssertion: <idk> */
import { LoginDto, RegisterDto, User } from '@crm/types';
import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User as UserEntity } from 'src/user/entities';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  private readonly saltRounds: number;

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.saltRounds = parseInt(
      this.configService.get<string>('SALT_ROUNDS')!,
      10,
    );
  }


  async generateRefreshToken( user :{  id: number; email: string;type: string}) :Promise<string> {
      const payload = { sub: user.id, email: user.email, type: user.type };
      return await this.jwtService.signAsync(payload, {
        expiresIn: '7d'
      });
  }
  private async generateToken(user: {
    id: number;
    email: string;
    type: string;
  }): Promise<string> {
    const payload = { sub: user.id, email: user.email, type: user.type };
    return await this.jwtService.signAsync(payload);
  }

  async login(dto: LoginDto): Promise<{ user: User; accessToken: string, refreshToken : string }> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });


    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.generateToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    const hashedRefresh = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.update(user.id, { refreshToken: hashedRefresh });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        status: user.status,
        type: user.type,
      },
      accessToken,
      refreshToken
    };
  }

   async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Access Denied');
      }

      const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!isValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const accessToken = await this.generateToken(user);
      const newRefreshToken = await this.generateRefreshToken(user);

      // rotate refresh token
      const hashedRefresh = await bcrypt.hash(newRefreshToken, 10);
      await this.userRepository.update(user.id, { refreshToken: hashedRefresh });

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async register(dto: RegisterDto) {
    const { name, email, username, password } = dto;

    try {
      const hashedPassword = await bcrypt.hash(password, this.saltRounds);

      const user = this.userRepository.create({
        name,
        email,
        username,
        password: hashedPassword,
      });

      const savedUser = await this.userRepository.save(user);

      const accessToken = await this.generateToken(savedUser);
      const refreshToken =  await this.generateRefreshToken(savedUser);

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          status: user.status,
          type: user.type,
        },
        accessToken,
        refreshToken
      };
      // biome-ignore lint/suspicious/noExplicitAny: <idk>
    } catch (error: any) {
      throw new InternalServerErrorException('Registration failed:', error);
    }
  }
}
