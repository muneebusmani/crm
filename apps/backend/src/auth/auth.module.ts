import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, UserDevice } from 'src/user/entities';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UserDeviceService } from 'src/user/user-device.service';
import { DeviceGateway } from './device.gateway';
import { DeviceCheckGuard } from './guards/device-check.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserDevice]),
    ConfigModule, // needed if you use ConfigService
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: '3d' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    UserDeviceService,
    DeviceGateway,
    DeviceCheckGuard,
  ],
  controllers: [AuthController],
  exports: [AuthService, UserDeviceService, DeviceGateway, DeviceCheckGuard],
})
export class AuthModule { }
