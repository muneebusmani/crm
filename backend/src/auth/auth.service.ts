import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
  async Login(dto: LoginDto) {
    const user = await this.prismaService.user.findFirst({
      where: {
        email: dto.email, // or any other unique/non-unique field
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user?.password as string,
    );
    const payload = { sub: user.id, email: user.email }; // You can add roles, etc.
    const accessToken = await this.jwtService.signAsync(payload);

    if (passwordMatches === true) {
      return {
        access_token: accessToken,
      };
    } else {
      return new UnauthorizedException("Email or Password Doesn't match");
    }
  }
}
