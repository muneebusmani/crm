import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCompanyUserDto, UpdateCompanyUserDto } from '@crm/types';
import { CompanyUser } from './entities/company-user.entity';
import { Dealer } from 'src/user/entities';

@Injectable()
export class CompanyUserService {
  constructor(
    @InjectRepository(CompanyUser)
    private readonly companyUserRepo: Repository<CompanyUser>,
    @InjectRepository(Dealer)
    private readonly dealerRepo: Repository<Dealer>,
  ) {}

  async create(dto: CreateCompanyUserDto, dealerId: number): Promise<CompanyUser> {
        const dealer = await this.dealerRepo.findOne({
        where: { user: { id: dealerId } },
        relations: ['user'],
        });
    if (!dealer) throw new BadRequestException('Dealer not found');

    // Ensure dealer doesn’t already have a linked company user
    const existing = await this.companyUserRepo.findOne({ where: { dealer_id: dealerId } });
    if (existing) throw new BadRequestException('Dealer already has a company user');

    const user = this.companyUserRepo.create({ ...dto, dealer });
    return this.companyUserRepo.save(user);
  }

  async findAll(): Promise<CompanyUser[]> {
    return this.companyUserRepo.find({ relations: ['dealer'] });
  }

  async findOne(id: number): Promise<CompanyUser> {
    const user = await this.companyUserRepo.findOne({
      where: { id },
      relations: ['dealer'],
    });
    if (!user) throw new NotFoundException('Company user not found');
    return user;
  }

 async findByDealerId(dealerId: number) {
  const users = await this.companyUserRepo.find({
    where: { dealer: { user: { id: dealerId } } },
    relations: ['dealer', 'dealer.user'],
  });

  if (!users.length) {
    throw new NotFoundException('No company users found for this dealer');
  }

  return users;
}


  async update(id: number, dto: UpdateCompanyUserDto): Promise<CompanyUser> {
    const user = await this.findOne(id);
    Object.assign(user, dto);
    return this.companyUserRepo.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.companyUserRepo.remove(user);
  }
}
