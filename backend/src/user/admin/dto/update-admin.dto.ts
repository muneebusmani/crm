// import {
//   IsEmail,
//   IsOptional,
//   IsString,
//   MaxLength,
//   MinLength,
// } from 'class-validator'
//
// export class UpdateUserDto {
//   @IsOptional()
//   @IsString()
//   @MinLength(2)
//   @MaxLength(50)
//   name?: string
//
//   @IsOptional()
//   @IsEmail()
//   email?: string
//
//   @IsOptional()
//   @IsString()
//   @MinLength(3)
//   @MaxLength(30)
//   username?: string
//
//   @IsOptional()
//   @IsString()
//   @MinLength(6)
//   password?: string
// }
// import {
//   IsEmail,
//   IsEnum,
//   IsNumber,
//   IsOptional,
//   IsString,
//   MaxLength,
//   MinLength,
// } from 'class-validator';
// import { main_role } from 'prisma/generated/prisma';
//
// export class UpdateUserDto {
//   @IsOptional()
//   @IsString()
//   @MinLength(2)
//   @MaxLength(50)
//   name?: string;
//
//   @IsOptional()
//   @IsEmail()
//   email?: string;
//
//   @IsOptional()
//   @IsString()
//   @MinLength(3)
//   @MaxLength(30)
//   username?: string;
//
//   @IsOptional()
//   @IsString()
//   @MinLength(6)
//   password?: string;
//
//   @IsOptional()
//   @IsEnum(main_role)
//   role?: main_role;
//
//   @IsOptional()
//   @IsNumber()
//   dealerTierId?: number;
//
//   @IsOptional()
//   @IsNumber()
//   adminRoleId?: number;
// }
import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateAdminDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsNumber()
  adminRoleId?: number;
}
