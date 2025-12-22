import {
  type Login,
  type LoginDto,
  LoginSchema,
  type Register,
  type RegisterDto,
  RegisterSchema,
} from '@crm/types';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UsePipes,
} from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { AuthService, type LoginDeviceInfo } from './auth.service';
import { Public } from './decorators/public.decorator';
import type { Request } from 'express';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(LoginSchema))
  async login(
    @Body() dto: LoginDto & { deviceFingerprint?: string },
    @Req() req: Request,
  ): Promise<Login> {
    // Extract device info from request
    const deviceInfo: LoginDeviceInfo = {
      fingerprint: dto.deviceFingerprint,
      userAgent: req.headers['user-agent'] as string,
      ipAddress: (req.ip ||
        req.headers['x-forwarded-for'] ||
        req.socket?.remoteAddress) as string,
    };

    // Log for debugging
    console.log('[AuthController] Login attempt:', {
      email: dto.email,
      hasFingerprint: !!dto.deviceFingerprint,
      fingerprintPreview: dto.deviceFingerprint
        ? dto.deviceFingerprint.substring(0, 16) + '...'
        : 'NONE',
      userAgent: deviceInfo.userAgent?.substring(0, 50) + '...',
      ipAddress: deviceInfo.ipAddress,
    });

    const { user, accessToken, refreshToken } = await this.authService.login(
      dto,
      deviceInfo,
    );

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refresh(body.refreshToken);
  }

  @Public()
  @Post('/register')
  @UsePipes(new ZodValidationPipe(RegisterSchema))
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto): Promise<Register> {
    const { user, accessToken, refreshToken } =
      await this.authService.register(dto);
    return {
      user,
      accessToken,
      refreshToken,
    };
  }
}
