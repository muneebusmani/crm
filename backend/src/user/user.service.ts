import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  private readonly saltRounds = 10

  async createUser(dto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(dto.password, this.saltRounds) // 10 = salt rounds

    return this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        username: dto.username,
        password: hashedPassword,
      },
    })
  }

  async getAllUsers() {
    return await this.prisma.user.findMany()
  }

  async getUserById(id: number) {
    return await this.prisma.user.findUnique({ where: { id } })
  }

  async updateUser(id: number, dto: UpdateUserDto) {
    // Only hash password if it's provided
    let hashedPassword: string | undefined
    if (dto.password) {
      hashedPassword = await bcrypt.hash(dto.password, this.saltRounds)
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name,
        email: dto.email,
        username: dto.username,
        password: hashedPassword, // Prisma will ignore if undefined
      },
    })
  }

  async deleteUser(id: number) {
    return await this.prisma.user.delete({ where: { id } })
  }
}
