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
  UsePipes,
} from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(LoginSchema))
  async login(@Body() dto: LoginDto): Promise<Login> {
    const { user, accessToken, refreshToken } = await this.authService.login(dto);
    return {
      data: user,
      accessToken,
      refreshToken
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
    const { user, accessToken, refreshToken } = await this.authService.register(dto);
    return {
      data : user,
      accessToken,
      refreshToken
    };
  }
}
