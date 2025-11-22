// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config'; // optional but better
// import { PassportStrategy } from '@nestjs/passport';
// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { PrismaService } from 'src/prisma/prisma.service';
//
// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor(
//     private prisma: PrismaService,
//     config: ConfigService,
//   ) {
//     const secret = config.get('JWT_SECRET');
//
//     if (!secret) {
//       throw new Error('JWT_SECRET is not defined in environment variables');
//     }
//
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       ignoreExpiration: false,
//       secretOrKey: secret,
//     });
//   }
//
//   async validate(payload: { sub: number; email: string }) {
//     // payload.sub is the user ID
//     const user = await this.prisma.user.findUnique({
//       where: {
//         id: payload.sub,
//       },
//     });
//
//     if (!user) {
//       throw new Error('User not found');
//     }
//
//     return user; // This becomes `req.user` in controllers
//   }
// }
// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from 'src/user/entities';
import { Repository } from 'typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
    this.configService = configService;
  }

  async validate(payload: { sub: number; email: string; role: string }) {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
      relations: ['dealer'], // Load dealer relationship
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Return minimal data needed for authentication and authorization
    // Maintain backward compatibility with existing code that expects id, email, role
    return {
      id: user.id,
      email: user.email,
      role: user.type, // Backward compatible: role field
      dealer: user.dealer ? { id: user.dealer.id } : null, // Only include dealer ID, not the entire object
    };
  }
}
