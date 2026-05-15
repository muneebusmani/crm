/** biome-ignore-all lint/suspicious/noExplicitAny: <idk> */
import {
  UserStatus,
  UserType,
  type CreateAdminDto,
  type UpdateAdminDto,
  type UpdateUserDto,
} from '@crm/types';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Admin, AdminRole, User } from '../entities';
import { UserDevice } from '../entities/user_device.entity';
import { CustomError } from 'src/common/custom-error';
import { LeadsService } from 'src/leads/leads.service';
import { DeviceGateway } from 'src/auth/device.gateway';
import { DeviceCheckGuard } from 'src/auth/guards/device-check.guard';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(AdminRole)
    private adminRoleRepository: Repository<AdminRole>,
    @InjectRepository(UserDevice)
    private deviceRepository: Repository<UserDevice>,
    private leadsService: LeadsService,
    private deviceGateway: DeviceGateway,
    private authService: AuthService,
  ) { }

  async createAdmin(dto: CreateAdminDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create user first
    const user = this.userRepository.create({
      name: dto.name,
      email: dto.email,
      username: dto.username,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    // Create admin record
    let adminRole: AdminRole | null = null;
    if (dto.adminRoleId) {
      adminRole = await this.adminRoleRepository.findOne({
        where: { id: dto.adminRoleId },
      });
    }

    const admin = this.adminRepository.create({
      role: dto.role,
      roleId: dto.adminRoleId,
      user: savedUser,
      adminRole: adminRole || undefined, // Handle null case
    });

    await this.adminRepository.save(admin);

    // Return user with admin relationship
    return await this.userRepository.findOne({
      where: { id: savedUser.id },
      relations: ['admin', 'admin.adminRole'],
    });
  }

  async getAllAdmins() {
    return await this.userRepository.find({
      where: {
        admin: {
          id: undefined, // This will find users who have an admin relationship
        },
      },
      relations: ['admin', 'admin.adminRole'],
    });
  }

  async getAdminById(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['admin', 'admin.adminRole'],
    });

    if (!user || !user.admin) {
      throw new NotFoundException('Admin not found');
    }

    return user;
  }

  async updateAdmin(id: number, dto: UpdateAdminDto) {
    // Check if user exists and is admin
    const existingUser = await this.userRepository.findOne({
      where: { id },
      relations: ['admin'],
    });

    if (!existingUser || !existingUser.admin) {
      throw new NotFoundException('Admin not found');
    }

    // Update user fields
    const updateUser = {} as UpdateUserDto;
    if (dto.name !== undefined) updateUser.name = dto.name;
    if (dto.email !== undefined) updateUser.email = dto.email;
    if (dto.username !== undefined) updateUser.username = dto.username;

    if (dto.password) {
      updateUser.password = await bcrypt.hash(dto.password, 10);
    }

    if (Object.keys(updateUser).length > 0) {
      await this.userRepository.update(id, updateUser);
    }

    // Update admin fields
    const updateAdmin: any = {};
    if (dto.role !== undefined) updateAdmin.role = dto.role;
    if (dto.adminRoleId !== undefined) updateAdmin.roleId = dto.adminRoleId;

    if (Object.keys(updateAdmin).length > 0) {
      await this.adminRepository.update(existingUser.admin.id, updateAdmin);
    }

    // Return updated user with admin relationship
    return await this.userRepository.findOne({
      where: { id },
      relations: ['admin', 'admin.adminRole'],
    });
  }

  async deleteAdmin(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['admin'],
    });

    if (!user || !user.admin) {
      throw new NotFoundException('Admin not found');
    }

    // Delete admin record first (due to foreign key constraint)
    await this.adminRepository.delete(user.admin.id);

    // Then delete user
    return await this.userRepository.delete(id);
  }

  private async findDealer(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User ${userId} not found`);

    if (user.type !== UserType.DEALER) {
      throw new BadRequestException(`User ${userId} is not a dealer`);
    }
    return user;
  }

  async updateDealerStatus(userId: number, status: UserStatus): Promise<User> {
    const user = await this.findDealer(userId);
    try {
      user.status = status;
      return await this.userRepository.save(user);
    } catch (error: unknown) {
      throw new CustomError('Unable to update dealer status');
    }
  }

  async getDealersWithQuota() {
    const dealers = await this.userRepository.find({
      where: { type: UserType.DEALER },
    });

    const dealerStatuses = await Promise.all(
      dealers.map(async (dealer) => {
        try {
          const packageTier = await this.leadsService.getDealerPackageTier(
            dealer.id,
          );
          const quota = await this.leadsService.checkHqLeadQuota(dealer.id);
          return {
            id: dealer.id,
            name: dealer.name,
            email: dealer.email,
            status: dealer.status,
            packageTier,
            assignedCount: quota.assignedCount,
            dailyLimit: quota.dailyLimit,
          };
        } catch (error) {
          // If a dealer has an issue (e.g., no tier), return basic info
          return {
            id: dealer.id,
            name: dealer.name,
            email: dealer.email,
            status: dealer.status,
            packageTier: 'N/A',
            assignedCount: 'N/A',
            dailyLimit: 'N/A',
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      }),
    );

    return dealerStatuses;
  }

  /**
   * Update the device limit for a dealer.
   * @param userId - Dealer user ID
   * @param limit - Number of allowed devices (null = unlimited)
   */
  async updateDeviceLimit(
    userId: number,
    limit: number | null,
  ): Promise<{ userId: number; allowedDevices: number | null }> {
    const user = await this.findDealer(userId);
    user.allowedDevices = limit;
    await this.userRepository.save(user);
    return { userId, allowedDevices: limit };
  }

  /**
   * Get all devices for a dealer.
   * @param userId - Dealer user ID
   */
  async getDealerDevices(userId: number) {
    await this.findDealer(userId); // Verify dealer exists
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['devices'],
    });
    return user?.devices || [];
  }

  /**
   * Deactivate (revoke) a specific device for a dealer.
   * This triggers real-time logout via WebSocket.
   * @param dealerId - Dealer user ID
   * @param deviceId - Device ID to deactivate
   */
  async deactivateDevice(dealerId: number, deviceId: number): Promise<void> {
    await this.findDealer(dealerId); // Verify dealer exists

    const device = await this.deviceRepository.findOne({
      where: { id: deviceId, userId: dealerId },
    });

    if (!device) {
      throw new NotFoundException(
        `Device ${deviceId} not found for dealer ${dealerId}`,
      );
    }

    // Update device status
    device.isActive = false;
    await this.deviceRepository.save(device);

    // Invalidate cache so DeviceCheckGuard blocks immediately
    DeviceCheckGuard.invalidateCache(dealerId, device.deviceFingerprint);

    // Emit WebSocket event for instant logout
    this.deviceGateway.emitDeviceRevocation(dealerId, device.deviceFingerprint);
  }

  /**
   * Reactivate a previously revoked device.
   * @param dealerId - Dealer user ID
   * @param deviceId - Device ID to reactivate
   */
  async reactivateDevice(dealerId: number, deviceId: number): Promise<void> {
    await this.findDealer(dealerId);

    const device = await this.deviceRepository.findOne({
      where: { id: deviceId, userId: dealerId },
    });

    if (!device) {
      throw new NotFoundException(
        `Device ${deviceId} not found for dealer ${dealerId}`,
      );
    }

    device.isActive = true;
    await this.deviceRepository.save(device);

    // Invalidate cache to allow login on next attempt
    DeviceCheckGuard.invalidateCache(dealerId, device.deviceFingerprint);
  }

  /**
   * Permanently remove a device record.
   * This frees up a device slot for the dealer.
   * @param dealerId - Dealer user ID
   * @param deviceId - Device ID to remove
   */
  async removeDevice(dealerId: number, deviceId: number): Promise<void> {
    await this.findDealer(dealerId);

    const device = await this.deviceRepository.findOne({
      where: { id: deviceId, userId: dealerId },
    });

    if (!device) {
      throw new NotFoundException(
        `Device ${deviceId} not found for dealer ${dealerId}`,
      );
    }

    const fingerprint = device.deviceFingerprint;

    // Delete the device record
    await this.deviceRepository.remove(device);

    // Invalidate cache
    DeviceCheckGuard.invalidateCache(dealerId, fingerprint);

    // Emit WebSocket event for instant logout (if device was active)
    this.deviceGateway.emitDeviceRevocation(dealerId, fingerprint);
  }

  /**
   * Deactivate all devices for a dealer.
   */
  async deactivateAllDevices(dealerId: number): Promise<void> {
    await this.findDealer(dealerId);

    await this.deviceRepository.update(
      { userId: dealerId },
      { isActive: false },
    );

    // Invalidate all cached entries for this user
    DeviceCheckGuard.invalidateUserCache(dealerId);

    // Emit WebSocket event to all devices
    this.deviceGateway.emitLogoutAllDevices(dealerId);
  }

  async impersonateDealer(adminUserId: number, dealerUserId: number) {
    const admin = await this.userRepository.findOne({ where: { id: adminUserId } });
    if (!admin || admin.type !== UserType.ADMIN) {
      throw new BadRequestException('Only admin can impersonate dealer accounts');
    }

    const dealer = await this.findDealer(dealerUserId);
    return this.authService.createSessionForUser(dealer);
  }
}
