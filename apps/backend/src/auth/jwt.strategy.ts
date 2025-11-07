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
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    configService: ConfigService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // First try to extract from cookies
        (request: Request) => {
          console.log('🔍 [JWT Strategy] Extracting token from request...');
          console.log(
            '🍪 [JWT Strategy] Cookies available:',
            request?.cookies ? Object.keys(request.cookies) : 'No cookies',
          );
          console.log('🍪 [JWT Strategy] All cookies:', request?.cookies);

          let token = null;
          if (request?.cookies) {
            token = request.cookies['access_token'];
            if (token) {
              console.log(
                '✅ [JWT Strategy] Token found in cookies:',
                String(token).substring(0, 20) + '...',
              );
            } else {
              console.log('❌ [JWT Strategy] No access_token cookie found');
            }
          } else {
            console.log('❌ [JWT Strategy] No cookies object on request');
          }
          return token;
        },
        // Fallback to Authorization header
        (request: Request) => {
          const authHeader = request?.headers?.authorization;
          console.log(
            '🔑 [JWT Strategy] Authorization header:',
            authHeader ? authHeader.substring(0, 30) + '...' : 'Not present',
          );
          return ExtractJwt.fromAuthHeaderAsBearerToken()(request);
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: { sub: number; email: string; role: string }) {
    console.log('✅ [JWT Strategy] Token validated successfully. Payload:', {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    });

    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      console.log(
        '❌ [JWT Strategy] User not found in database for ID:',
        payload.sub,
      );
      throw new Error('User not found');
    }

    console.log('✅ [JWT Strategy] User found:', {
      id: user.id,
      email: user.email,
      type: user.type,
    });

    // Attach role also from DB if you want stronger trust
    return {
      id: user.id,
      email: user.email,
      role: user.type,
    };
  }
}
