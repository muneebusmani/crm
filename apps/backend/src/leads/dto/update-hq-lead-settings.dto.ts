import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class UpdateHqLeadSettingsDto {
  @IsString()
  packageTier!: string;

  @IsNumber()
  dailyLimit!: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}