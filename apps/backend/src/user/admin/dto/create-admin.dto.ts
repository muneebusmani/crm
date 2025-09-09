// import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator'
//
// export class CreateUserDto {
//   @IsString()
//   @MinLength(2)
//   @MaxLength(50)
//   name: string
//
//   @IsEmail()
//   email: string
//
//   @IsString()
//   @MinLength(3)
//   @MaxLength(30)
//   username: string
//
//   @IsString()
//   @MinLength(6)
//   password: string
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
// export class CreateUserDto {
//   @IsString()
//   @MinLength(2)
//   @MaxLength(50)
//   name: string;
//
//   @IsEmail()
//   email: string;
//
//   @IsString()
//   @MinLength(3)
//   @MaxLength(30)
//   username: string;
//
//   @IsString()
//   @MinLength(6)
//   password: string;
//
//   @IsEnum(main_role)
//   role: main_role;
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
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAdminDto {
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
  role: string;

  @IsString()
  @IsOptional()
  adminRoleId?: number;
}
