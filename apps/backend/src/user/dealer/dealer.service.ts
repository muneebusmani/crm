/** biome-ignore-all lint/suspicious/noExplicitAny: <idk> */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Dealer } from '../entities/dealer.entity';
import { DealerTier } from '../entities/dealer-tier.entity';
import { User } from '../entities/user.entity';
import { CreateDealerDto } from './dto/create-dealer.dto';
import { UpdateDealerDto } from './dto/update-dealer.dto';

@Injectable()
export class DealerService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Dealer)
    private dealerRepository: Repository<Dealer>,
    @InjectRepository(DealerTier)
    private dealerTierRepository: Repository<DealerTier>,
  ) {}

  async createDealer(dto: CreateDealerDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create user first
    const user = this.userRepository.create({
      name: dto.name,
      email: dto.email,
      username: dto.username,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    // Create dealer record
    let dealerTier: DealerTier | null = null;
    if (dto.tierId) {
      dealerTier = await this.dealerTierRepository.findOne({
        where: { id: dto.tierId },
      });
    }

    const dealer = this.dealerRepository.create({
      name: dto.name,
      owner: dto.owner,
      location: dto.location,
      logo: dto.logo,
      website: dto.website,
      contactEmail: dto.contactEmail,
      tierId: dto.tierId,
      user: savedUser,
      tier: dealerTier || undefined,
    });

    await this.dealerRepository.save(dealer);

    // Return user with dealer relationship
    return await this.userRepository.findOne({
      where: { id: savedUser.id },
      relations: ['dealer', 'dealer.tier'],
    });
  }

  async getAllDealers() {
    return await this.userRepository.find({
      where: {
        dealer: {
          id: undefined, // Find users who have a dealer relationship
        },
      },
      relations: ['dealer', 'dealer.tier'],
    });
  }

  async getDealerById(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['dealer', 'dealer.tier'],
    });

    if (!user || !user.dealer) {
      throw new NotFoundException('Dealer not found');
    }

    return user;
  }

  async updateDealer(id: number, dto: UpdateDealerDto) {
    // Check if user exists and is dealer
    const existingUser = await this.userRepository.findOne({
      where: { id },
      relations: ['dealer'],
    });

    if (!existingUser || !existingUser.dealer) {
      throw new NotFoundException('Dealer not found');
    }

    // Update user fields
    const updateUser: any = {};
    if (dto.name !== undefined) updateUser.name = dto.name;
    if (dto.email !== undefined) updateUser.email = dto.email;
    if (dto.username !== undefined) updateUser.username = dto.username;

    if (dto.password && dto.password.trim() !== '') {
      updateUser.password = await bcrypt.hash(dto.password, 10);
    }

    if (Object.keys(updateUser).length > 0) {
      await this.userRepository.update(id, updateUser);
    }

    // Update dealer fields
    const updateDealer: any = {};
    if (dto.name !== undefined) updateDealer.name = dto.name;
    if (dto.owner !== undefined) updateDealer.owner = dto.owner;
    if (dto.location !== undefined) updateDealer.location = dto.location;
    if (dto.logo !== undefined) updateDealer.logo = dto.logo;
    if (dto.website !== undefined) updateDealer.website = dto.website;
    if (dto.contactEmail !== undefined)
      updateDealer.contactEmail = dto.contactEmail;
    if (dto.tierId !== undefined) updateDealer.tierId = dto.tierId;

    if (Object.keys(updateDealer).length > 0) {
      await this.dealerRepository.update(existingUser.dealer.id, updateDealer);
    }

    // Return updated user with dealer relationship
    return await this.userRepository.findOne({
      where: { id },
      relations: ['dealer', 'dealer.tier'],
    });
  }

  async deleteDealer(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['dealer'],
    });

    if (!user || !user.dealer) {
      throw new NotFoundException('Dealer not found');
    }

    // Delete dealer record first (due to foreign key constraint)
    await this.dealerRepository.delete(user.dealer.id);

    // Then delete user
    return await this.userRepository.delete(id);
  }
}
