/** biome-ignore-all lint/style/noNonNullAssertion: <idk> */
import { LoginDto, RegisterDto, User, UserStatus } from '@crm/types';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User as UserEntity } from 'src/user/entities';
import { Repository } from 'typeorm';
import {
  InvalidCredentialsException,
  AccountSuspendedException,
  AccountInactiveException,
} from 'src/common/auth-exceptions';
import {
  UserDeviceService,
  type DeviceInfo,
} from 'src/user/user-device.service';

export interface LoginDeviceInfo {
  fingerprint?: string;
  userAgent?: string;
  ipAddress?: string;
}

@Injectable()
export class AuthService {
  private readonly saltRounds: number;

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userDeviceService: UserDeviceService,
  ) {
    this.saltRounds = parseInt(
      this.configService.get<string>('SALT_ROUNDS')!,
      10,
    );
  }

  async generateRefreshToken(user: {
    id: number;
    email: string;
    type: string;
  }): Promise<string> {
    const payload = { sub: user.id, email: user.email, type: user.type };
    return await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });
  }

  private async generateToken(user: {
    id: number;
    email: string;
    type: string;
  }): Promise<string> {
    const payload = { sub: user.id, email: user.email, type: user.type };
    return await this.jwtService.signAsync(payload);
  }

  /**
   * Login with device bound enforcement.
   *
   * Order of checks:
   * 1. Find user by email
   * 2. Check account status (BEFORE password validation)
   * 3. Validate password
   * 4. Check device limit (strict blocking)
   * 5. Generate tokens
   */
  async login(
    dto: LoginDto,
    deviceInfo?: LoginDeviceInfo,
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    console.log('[AuthService] Step 1: Finding user by email:', dto.email);

    // STEP 1: Find user by email
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      console.log('[AuthService] Step 1 FAILED: User not found');
      throw new InvalidCredentialsException();
    }

    console.log(
      '[AuthService] Step 1 OK: User found, id:',
      user.id,
      'allowedDevices:',
      user.allowedDevices,
    );

    // STEP 2: Check account status BEFORE password validation
    console.log('[AuthService] Step 2: Checking account status:', user.status);

    if (user.status === UserStatus.SUSPENDED) {
      console.log('[AuthService] Step 2 FAILED: Account suspended');
      throw new AccountSuspendedException();
    }

    if (user.status === UserStatus.IN_ACTIVE) {
      console.log('[AuthService] Step 2 FAILED: Account inactive');
      throw new AccountInactiveException();
    }

    console.log('[AuthService] Step 2 OK: Account status is active');

    // STEP 3: Validate password
    console.log('[AuthService] Step 3: Validating password...');
    const passwordMatches = await bcrypt.compare(dto.password, user.password);

    if (!passwordMatches) {
      console.log('[AuthService] Step 3 FAILED: Password does not match');
      throw new InvalidCredentialsException();
    }

    console.log('[AuthService] Step 3 OK: Password validated');

    // STEP 4: Check device limit
    // Log device info for debugging
    console.log('[AuthService] Step 4: Checking device limit...', {
      fingerprint: deviceInfo?.fingerprint
        ? deviceInfo.fingerprint.substring(0, 16) + '...'
        : 'NONE',
      hasUserAgent: !!deviceInfo?.userAgent,
      hasIpAddress: !!deviceInfo?.ipAddress,
      userAllowedDevices: user.allowedDevices,
    });

    // ALWAYS check device limit if user has a limit set (not unlimited/null)
    // Use a fallback fingerprint based on IP if no fingerprint provided
    const effectiveFingerprint =
      deviceInfo?.fingerprint ||
      (deviceInfo?.ipAddress ? `ip-${deviceInfo.ipAddress}` : null) ||
      (deviceInfo?.userAgent
        ? `ua-${Buffer.from(deviceInfo.userAgent).toString('base64').substring(0, 32)}`
        : null);

    if (effectiveFingerprint) {
      const deviceData: DeviceInfo = {
        userAgent: deviceInfo?.userAgent,
        ipAddress: deviceInfo?.ipAddress,
      };
      console.log(
        '[AuthService] Calling checkAndRegisterDevice with fingerprint:',
        effectiveFingerprint.substring(0, 20) + '...',
      );
      await this.userDeviceService.checkAndRegisterDevice(
        user,
        effectiveFingerprint,
        deviceData,
      );
    } else {
      console.warn(
        '[AuthService] No fingerprint available, skipping device registration',
      );
    }

    // STEP 5: Generate tokens
    const accessToken = await this.generateToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    const hashedRefresh = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.update(user.id, { refreshToken: hashedRefresh });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        status: user.status,
        type: user.type,
      },
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.refreshToken) {
        throw new InvalidCredentialsException();
      }

      const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!isValid) {
        throw new InvalidCredentialsException();
      }

      const accessToken = await this.generateToken(user);
      const newRefreshToken = await this.generateRefreshToken(user);

      // rotate refresh token
      const hashedRefresh = await bcrypt.hash(newRefreshToken, 10);
      await this.userRepository.update(user.id, {
        refreshToken: hashedRefresh,
      });

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch {
      throw new InvalidCredentialsException();
    }
  }

  async createSessionForUser(
    user: UserEntity,
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const accessToken = await this.generateToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    const hashedRefresh = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.update(user.id, { refreshToken: hashedRefresh });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        status: user.status,
        type: user.type,
      },
      accessToken,
      refreshToken,
    };
  }

  async register(dto: RegisterDto) {
    const { name, email, username, password, type } = dto;

    try {
      const hashedPassword = await bcrypt.hash(password, this.saltRounds);

      const user = this.userRepository.create({
        name,
        email,
        username,
        password: hashedPassword,
        type,
      });

      const savedUser = await this.userRepository.save(user);

      const accessToken = await this.generateToken(savedUser);
      const refreshToken = await this.generateRefreshToken(savedUser);

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          status: user.status,
          type: user.type,
        },
        accessToken,
        refreshToken,
      };
    } catch (error: unknown) {
      console.log('Error:', error);
      throw new InternalServerErrorException(
        'Registration failed:',
        JSON.stringify(error),
      );
    }
  }
}
