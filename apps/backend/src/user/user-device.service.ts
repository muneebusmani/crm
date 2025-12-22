import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDevice } from './entities/user_device.entity';
import { User } from './entities/user.entity';
import { DeviceLimitReachedException } from 'src/common/auth-exceptions';

export interface DeviceInfo {
  userAgent?: string;
  ipAddress?: string;
  platform?: 'web' | 'android' | 'ios';
}

@Injectable()
export class UserDeviceService {
  private readonly logger = new Logger(UserDeviceService.name);

  constructor(
    @InjectRepository(UserDevice)
    private readonly deviceRepository: Repository<UserDevice>,
  ) {}

  /**
   * Check device limit and register device for login.
   * Throws DeviceLimitReachedException if limit is reached.
   *
   * @param user - User entity with allowedDevices field
   * @param fingerprint - Device fingerprint from client
   * @param deviceInfo - Additional device metadata
   */
  async checkAndRegisterDevice(
    user: User,
    fingerprint: string,
    deviceInfo: DeviceInfo = {},
  ): Promise<void> {
    // If unlimited (NULL), just upsert device and return
    if (user.allowedDevices === null) {
      this.logger.debug(
        `User ${user.id} has unlimited devices, skipping limit check`,
      );
      await this.upsertDevice(user.id, fingerprint, deviceInfo);
      return;
    }

    // Check for existing active device with same fingerprint
    const existingDevice = await this.deviceRepository.findOne({
      where: {
        userId: user.id,
        deviceFingerprint: fingerprint,
        isActive: true,
      },
    });

    if (existingDevice) {
      // Same device re-login - just update timestamp
      this.logger.debug(
        `User ${user.id} re-login from existing device ${existingDevice.id}`,
      );
      existingDevice.lastLoginAt = new Date();
      existingDevice.ipAddress =
        deviceInfo.ipAddress || existingDevice.ipAddress;
      await this.deviceRepository.save(existingDevice);
      return;
    }

    // Count current active devices
    const activeCount = await this.deviceRepository.count({
      where: { userId: user.id, isActive: true },
    });

    this.logger.debug(
      `User ${user.id} has ${activeCount}/${user.allowedDevices} active devices`,
    );

    // STRICT BLOCKING - reject if limit reached
    if (activeCount >= user.allowedDevices) {
      this.logger.warn(
        `User ${user.id} blocked: device limit reached (${activeCount}/${user.allowedDevices})`,
      );
      throw new DeviceLimitReachedException();
    }

    // Under limit - register new device
    await this.upsertDevice(user.id, fingerprint, deviceInfo);
    this.logger.log(
      `User ${user.id} registered new device, count: ${activeCount + 1}`,
    );
  }

  /**
   * Upsert a device record (insert or update if exists).
   */
  private async upsertDevice(
    userId: number,
    fingerprint: string,
    deviceInfo: DeviceInfo,
  ): Promise<UserDevice> {
    // Try to find existing device (may be inactive)
    let device = await this.deviceRepository.findOne({
      where: { userId, deviceFingerprint: fingerprint },
    });

    if (device) {
      // Update existing device
      device.isActive = true;
      device.lastLoginAt = new Date();
      device.ipAddress = deviceInfo.ipAddress || device.ipAddress;
      device.deviceName = deviceInfo.userAgent || device.deviceName;
      device.platform = deviceInfo.platform || device.platform;
    } else {
      // Create new device
      device = this.deviceRepository.create({
        userId,
        deviceFingerprint: fingerprint,
        isActive: true,
        lastLoginAt: new Date(),
        ipAddress: deviceInfo.ipAddress || null,
        deviceName: deviceInfo.userAgent || null,
        platform: deviceInfo.platform || 'web',
      });
    }

    return await this.deviceRepository.save(device);
  }

  /**
   * Get all active devices for a user.
   */
  async getActiveDevices(userId: number): Promise<UserDevice[]> {
    return await this.deviceRepository.find({
      where: { userId, isActive: true },
      order: { lastLoginAt: 'DESC' },
    });
  }

  /**
   * Get all devices for a user (including inactive).
   */
  async getAllDevices(userId: number): Promise<UserDevice[]> {
    return await this.deviceRepository.find({
      where: { userId },
      order: { lastLoginAt: 'DESC' },
    });
  }

  /**
   * Deactivate a specific device.
   */
  async deactivateDevice(deviceId: number, userId?: number): Promise<void> {
    const whereClause: { id: number; userId?: number } = { id: deviceId };
    if (userId) {
      whereClause.userId = userId;
    }

    await this.deviceRepository.update(whereClause, { isActive: false });
    this.logger.log(`Device ${deviceId} deactivated`);
  }

  /**
   * Deactivate all devices for a user (logout from all devices).
   */
  async deactivateAllDevices(userId: number): Promise<void> {
    await this.deviceRepository.update({ userId }, { isActive: false });
    this.logger.log(`All devices deactivated for user ${userId}`);
  }

  /**
   * Deactivate a device by fingerprint (used during logout).
   */
  async deactivateByFingerprint(
    userId: number,
    fingerprint: string,
  ): Promise<void> {
    await this.deviceRepository.update(
      { userId, deviceFingerprint: fingerprint },
      { isActive: false },
    );
  }

  /**
   * Check if a device is active (for token refresh validation).
   */
  async isDeviceActive(userId: number, fingerprint: string): Promise<boolean> {
    const device = await this.deviceRepository.findOne({
      where: { userId, deviceFingerprint: fingerprint, isActive: true },
    });
    return !!device;
  }

  /**
   * Get count of active devices for a user.
   */
  async getActiveDeviceCount(userId: number): Promise<number> {
    return await this.deviceRepository.count({
      where: { userId, isActive: true },
    });
  }
}
