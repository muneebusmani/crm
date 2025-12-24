import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDevice } from 'src/user/entities/user_device.entity';
import { DeviceRevokedException } from 'src/common/auth-exceptions';

/**
 * Simple in-memory cache for device status.
 * For multi-instance deployments, replace with Redis.
 */
interface CacheEntry {
  isActive: boolean;
  expiresAt: number;
}

const deviceCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 30 * 1000; // 30 seconds

/**
 * Guard that checks if the device making the request is still active.
 * This enables real-time device revocation - when an admin revokes a device,
 * the next API call from that device will be blocked.
 *
 * The device fingerprint is expected in the X-Device-Fingerprint header.
 * If no fingerprint is provided, the request is allowed (backward compatibility).
 */
@Injectable()
export class DeviceCheckGuard implements CanActivate {
  private readonly logger = new Logger(DeviceCheckGuard.name);

  constructor(
    private reflector: Reflector,
    @InjectRepository(UserDevice)
    private readonly deviceRepository: Repository<UserDevice>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const fingerprint = request.headers['x-device-fingerprint'];

    // If no user (not authenticated) or no fingerprint, skip check
    // This maintains backward compatibility with clients that don't send fingerprint
    if (!user?.id || !fingerprint) {
      return true;
    }

    const cacheKey = `${user.id}:${fingerprint}`;

    // Check cache first
    const cached = deviceCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      if (!cached.isActive) {
        this.logger.warn(
          `Device revoked (cached): user=${user.id}, fingerprint=${fingerprint.substring(0, 16)}...`,
        );
        throw new DeviceRevokedException();
      }
      return true;
    }

    // Query database
    const device = await this.deviceRepository.findOne({
      where: {
        userId: user.id,
        deviceFingerprint: fingerprint,
      },
    });

    const isActive = device?.isActive ?? false;

    // Update cache
    deviceCache.set(cacheKey, {
      isActive,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    if (!isActive) {
      this.logger.warn(
        `Device revoked: user=${user.id}, fingerprint=${fingerprint.substring(0, 16)}...`,
      );
      throw new DeviceRevokedException();
    }

    return true;
  }

  /**
   * Invalidate cache for a specific device.
   * Call this when a device is revoked to ensure immediate effect.
   */
  static invalidateCache(userId: number, fingerprint: string): void {
    const cacheKey = `${userId}:${fingerprint}`;
    deviceCache.delete(cacheKey);
  }

  /**
   * Invalidate all cached entries for a user.
   * Call this when all devices are revoked.
   */
  static invalidateUserCache(userId: number): void {
    for (const key of deviceCache.keys()) {
      if (key.startsWith(`${userId}:`)) {
        deviceCache.delete(key);
      }
    }
  }
}
