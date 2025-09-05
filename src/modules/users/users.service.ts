import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.user.findFirst({
      where: {
        id,
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

  findAll() {
    return this.prisma.user.findMany()
  }

  create(data: any) {
    return this.prisma.user.create({
      data,
    })
  }

  update(id: string, data: any) {
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
