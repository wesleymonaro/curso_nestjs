import { Module } from '@nestjs/common'
import { RequestContextService } from 'src/common/services/request-context/request-context.service'
import { PrismaService } from 'src/prisma.service'
import { CollaboratorsController } from './collaborators.controller'
import { CollaboratorsService } from './collaborators.service'

@Module({
  controllers: [CollaboratorsController],
  providers: [CollaboratorsService, PrismaService, RequestContextService],
})
export class CollaboratorsModule {}
