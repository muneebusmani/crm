// import {
//   ConflictException,
//   Injectable,
//   InternalServerErrorException,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { JwtService } from '@nestjs/jwt';
// import * as bcrypt from 'bcrypt';
// import { PrismaService } from 'src/prisma/prisma.service';
// import { LoginDto } from './dto/login.dto';
// import { RegisterDto } from './dto/register.dto';
//
// @Injectable()
// export class AuthService {
//   private readonly saltRounds: number;
//   constructor(
//     private readonly prismaService: PrismaService,
//     private readonly jwtService: JwtService,
//     private readonly configService: ConfigService,
//   ) {
//     this.saltRounds = parseInt(
//       this.configService.get<string>('SALT_ROUNDS') || '10',
//       10,
//     );
//   }
//
//   private async generateToken(user: { id: number; email: string }) {
//     const payload = { sub: user.id, email: user.email };
//     return await this.jwtService.signAsync(payload);
//   }
//
//   async login(dto: LoginDto) {
//     const user = await this.prismaService.user.findUnique({
//       where: { email: dto.email },
//     });
//
//     if (!user) {
//       throw new UnauthorizedException('Invalid credentials');
//     }
//
//     const passwordMatches = await bcrypt.compare(dto.password, user.password);
//
//     if (!passwordMatches) {
//       throw new UnauthorizedException('Invalid credentials');
//     }
//
//     const access_token = await this.generateToken(user);
//
//     return {
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         username: user.username,
//       },
//       access_token,
//     };
//   }
//
//   async register(dto: RegisterDto) {
//     const { name, email, username, password } = dto;
//
//     try {
//       const hashedPassword = await bcrypt.hash(password, this.saltRounds);
//
//       const user = await this.prismaService.user.create({
//         data: {
//           name,
//           email,
//           username,
//           password: hashedPassword,
//         },
//       });
//
//       const access_token = await this.generateToken(user);
//
//       return {
//         user: {
//           id: user.id,
//           name: user.name,
//           email: user.email,
//           username: user.username,
//         },
//         access_token,
//       };
//     } catch (error) {
//       if (error.code === 'P2002') {
//         throw new ConflictException(
//           'User with this email or username already exists',
//         );
//       }
//       throw new InternalServerErrorException('Registration failed');
//     }
//   }
// }

import { User } from '@crm/types/User';
import {
  ConflictException,
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
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

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
      this.configService.get<string>('SALT_ROUNDS') || '10',
      10,
    );
  }

  private async generateToken(user: {
    id: number;
    email: string;
  }): Promise<string> {
    const payload = { sub: user.id, email: user.email };
    return await this.jwtService.signAsync(payload);
  }

  async login(dto: LoginDto): Promise<{ user: User; accessToken: string }> {
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

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        type: user.type,
      },
      accessToken,
    };
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

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          type: user.type,
        },
        accessToken,
      };
    } catch (error) {
      if (error.code === '23505' || error.detail?.includes('already exists')) {
        throw new ConflictException(
          'User with this email or username already exists',
        );
      }
      throw new InternalServerErrorException('Registration failed');
    }
  }
}
