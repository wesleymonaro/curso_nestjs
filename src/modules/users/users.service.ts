import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { CreateUserDTO, UpdateUserDTO } from './users.dto'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        createdAt: true,
        updateAt: true,
      },
    })
  }

  findById(id: string) {
    return this.prisma.user.findFirst({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        createdAt: true,
        updateAt: true,
        createdProjects: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    })
  }

  findByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: {
        email,
      },
    })
  }

  create(data: CreateUserDTO) {
    return this.prisma.user.create({
      data,
    })
  }

  update(id: string, data: UpdateUserDTO) {
    return this.prisma.user.update({
      where: {
        id,
      },
      data,
    })
  }

  async remove(id: string) {
    await this.prisma.user.delete({
      where: {
        id,
      },
    })
  }
}
