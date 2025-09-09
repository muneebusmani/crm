import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateDealerDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  @MaxLength(30)
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  owner: string;

  @IsString()
  location: string;

  @IsString()
  logo: string;

  @IsString()
  website: string;

  @IsEmail()
  contactEmail: string;

  @IsNumber()
  @IsOptional()
  tierId?: number;
}
