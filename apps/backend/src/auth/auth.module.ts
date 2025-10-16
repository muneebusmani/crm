import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UserDevice } from 'src/user/entities/user_device.entity';
import { LeadsGateway } from 'src/leads/leads.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserDevice]),
    ConfigModule, // needed if you use ConfigService
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: '7h' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy, LeadsGateway],
  controllers: [AuthController],
})
export class AuthModule {}
