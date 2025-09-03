import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class CreateClientDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string

  @IsEmail()
  email: string

  @IsString()
  @MinLength(3)
  @MaxLength(30)
  username: string

  @IsString()
  @MinLength(6)
  password: string

  @IsString()
  owner: string

  @IsString()
  industry: string

  @IsString()
  location: string

  @IsString()
  employees: string

  @IsString()
  website: string

  @IsString()
  description: string

  @IsOptional()
  @IsString()
  logo?: string
}
