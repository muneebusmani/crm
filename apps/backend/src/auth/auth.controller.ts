import {
  type LoginDto,
  type LoginResponse,
  LoginSchema,
  type RegisterDto,
  RegisterSchema,
  User,
  UserType,
} from '@crm/types';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UsePipes,
} from '@nestjs/common';
import type { Response } from 'express';
import { ZodValidationPipe } from 'nestjs-zod';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setAuthCookie(res: Response, token: string, userType?: UserType) {
    const expiryMap: Record<UserType | 'DEFAULT', number> = {
      [UserType.ADMIN]: 24 * 60 * 60 * 1000, // 24 hrs
      [UserType.DEALER]: 7 * 24 * 60 * 60 * 1000, // 7 days
      DEFAULT: 8 * 60 * 60 * 1000, // 8 hrs
    };
    const expiry = userType
      ? (expiryMap[userType] ?? expiryMap.DEFAULT)
      : expiryMap.DEFAULT;

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: expiry,
      sameSite: 'strict',
      path: '/',
    });
  }

  @Public()
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(LoginSchema))
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): LoginResponse<User> {
    const { user, accessToken } = await this.authService.login(dto);
    this.setAuthCookie(res, accessToken, user.type);
    return {
      success: true,
      data: {
        data: user,
        accessToken,
      },
    };
  }

  @Public()
  @Post('/register')
  @UsePipes(new ZodValidationPipe(RegisterSchema))
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken } = await this.authService.register(dto);
    this.setAuthCookie(res, accessToken, user.type);
    return {
      success: true,
      data: {
        user,
        accessToken,
      },
    };
  }
}
