import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator'

export class CreateUserDto {
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
}