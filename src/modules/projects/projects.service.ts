import { Injectable } from '@nestjs/common'
import { CollaboratorRole } from '@prisma/client'
import { RequestContextService } from 'src/common/services/request-context/request-context.service'
import { PrismaService } from 'src/prisma.service'
import { ProjectRequestDTO } from './projects.dto'

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly requestContext: RequestContextService,
  ) {}

  findAll() {
    const userId = this.requestContext.getUserId()

    return this.prisma.project.findMany({
      where: {
        createdById: userId,
      },
    })
  }

  findById(id: string) {
    const userId = this.requestContext.getUserId()

    return this.prisma.project.findFirst({
      where: {
        id,
        createdById: userId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updateAt: true,
        tasks: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            priority: true,
            dueDate: true,
            createdAt: true,
            updateAt: true,
          },
        },
      },
    })
  }

  async create(data: ProjectRequestDTO) {
    const userId = this.requestContext.getUserId()

    const project = await this.prisma.project.create({
      data: {
        ...data,
        createdById: userId,
      },
    })

    // add the user as owner to the created project
    await this.prisma.projectCollaborator.create({
      data: {
        projectId: project.id,
        userId: userId,
        role: CollaboratorRole.OWNER,
      },
    })

    return project
  }

  update(id: string, data: ProjectRequestDTO) {
    const userId = this.requestContext.getUserId()

    return this.prisma.project.update({
      where: {
        id,
        createdById: userId,
      },
      data,
    })
  }

  async remove(id: string) {
    const userId = this.requestContext.getUserId()

    await this.prisma.task.deleteMany({
      where: {
        projectId: id,
      },
    })

    return this.prisma.project.delete({
      where: {
        id,
        createdById: userId,
      },
    })
  }
}
