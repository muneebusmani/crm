// src/leads/dto/create-lead.dto.ts
import {
  IsOptional,
  IsString,
  IsEmail,
  IsPhoneNumber,
  IsDateString,
  IsBoolean,
} from 'class-validator';

export class CreateLeadDto {
  @IsOptional()
  @IsString()
  vehicle_model?: string;

  @IsOptional()
  @IsString()
  vehicle_reg?: string;

  @IsOptional()
  @IsString()
  customer_name?: string;

  @IsOptional()
  @IsEmail()
  customer_email?: string;

  @IsOptional()
  @IsPhoneNumber() // null allows any region
  customer_phone?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  assigned_to?: string;

  @IsOptional()
  @IsDateString()
  follow_up_date?: string; // Use string in DTO, convert to Date in service

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  isHqLead?: boolean;
}
