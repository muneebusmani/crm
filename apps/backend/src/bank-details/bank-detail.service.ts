import type { ApiResponse,  CreateBankDetailsDto, UpdateBankDetailsDto } from '@crm/types'
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BankDetails } from './entities/bank-details.entity'
import { CustomError } from '../common/custom-error'
import { AppLogger } from '../common/logger.service'
import { User } from 'src/user/entities'

@Injectable()
export class BankDetailService {
  constructor(
    @InjectRepository(BankDetails)
    private readonly bankDetailRepository: Repository<BankDetails>,
    @InjectRepository(User)
    private readonly dealerRepository: Repository<User>
  ) {}

    async create(dto: CreateBankDetailsDto, dealerId: number): Promise<BankDetails> {
       const user = await this.dealerRepository.findOne({ where: { id : dealerId}});
        if(!user){
            throw new CustomError("Dealer not found");
        }
      const bankDetail = this.bankDetailRepository.create({
        accountHolderName : dto.accountHolderName,
        accountNumber : dto.accountNumber,
        bankName : dto.bankName,
        branchName : dto.branchName,
        ifscCode : dto.ifscCode,
        iban : dto.iban,
        swiftCode : dto.swiftCode,
        user : user
      });
      const saved = await this.bankDetailRepository.save(bankDetail)
      return saved;
    }

  async findAll(): Promise<BankDetails[]> {
      const details = await this.bankDetailRepository.find({
        relations: ['user'], // if you have relation with User
      })
      return details;
  }

  async findOne(id: number): Promise<BankDetails> {
      const detail = await this.bankDetailRepository.findOne({
        where: { id },
        relations: ['user'],
      })
      if(!detail){
         throw new CustomError("Bank details not found");
      }
      return detail;
  }

  async update(id: number, dto: UpdateBankDetailsDto): Promise<BankDetails> {
      const existing = await this.bankDetailRepository.findOne({ where: { id } })
      if (!existing) {
        throw new NotFoundException(`Bank detail with id ${id} not found`)
      }
      const updated = await this.bankDetailRepository.save({ ...existing, ...dto })
      return updated;
  }

  async remove(id: number): Promise<BankDetails> {
      const existing = await this.bankDetailRepository.findOne({ where: { id } })
      if (!existing) {
        throw new NotFoundException(`Bank detail with id ${id} not found`)
      }
      await this.bankDetailRepository.delete(id);
      return existing;
    }
}
