import { Module } from '@nestjs/common'
import { CloudinaryService } from 'src/common/services/cloudinary/cloudinary.service'
import { RequestContextService } from 'src/common/services/request-context/request-context.service'
import { PrismaService } from 'src/prisma.service'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, CloudinaryService, RequestContextService],
})
export class UsersModule {}
