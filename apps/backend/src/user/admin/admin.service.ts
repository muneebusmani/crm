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
import { CustomError } from 'src/common/custom-error';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(AdminRole)
    private adminRoleRepository: Repository<AdminRole>,
  ) {}

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

  async DealerStatus(userId: number) {
    const user = await this.findDealer(userId);
    try {
      if (user.status === UserStatus.ACTIVE) {
        console.log(UserStatus.IN_ACTIVE);
        user.status = UserStatus.IN_ACTIVE;
      } else {
        user.status = UserStatus.ACTIVE;
      }
      return await this.userRepository.save(user);
    } catch (error: unknown) {
      throw new CustomError('Unable to update dealer status');
    }
  }

  async suspendDealer(userId: number) {
    try {
      const user = await this.findDealer(userId);
      user.status =
        user.status === UserStatus.SUSPENDED
          ? UserStatus.ACTIVE
          : UserStatus.SUSPENDED;

      return await this.userRepository.save(user);
    } catch (error: unknown) {
      throw new CustomError('Unable to suspend leads');
    }
  }
}
