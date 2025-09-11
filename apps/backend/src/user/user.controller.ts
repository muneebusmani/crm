import {
  Controller,
  Get,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('user')
export class UserController {
  // biome-ignore lint/suspicious/useAwait: <any>
  @UseGuards(AuthGuard('jwt'))
  @Get('/me')
  // biome-ignore lint/suspicious/noExplicitAny: <idk>
  async getUser(@CurrentUser() user: any) {
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }
    return user;
  }
}
