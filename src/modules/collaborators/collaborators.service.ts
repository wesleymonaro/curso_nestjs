import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { CollaboratorRole } from '@prisma-generated/client'
import { QueryPaginationDTO } from 'src/common/dtos/query-pagination.dto'
import { PrismaService } from 'src/prisma.service'
import { paginate, paginateOutput } from 'src/utils/pagination.utils'
import {
  AddCollaboratorDTO,
  CollaboratorListItemDTO,
  UpdateCollaboratorDTO,
} from './collaborators.dto'

@Injectable()
export class CollaboratorsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByProject(projectId: string, query?: QueryPaginationDTO) {
    const collaborators = await this.prisma.projectCollaborator.findMany({
      ...paginate(query),
      where: {
        projectId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    })

    const total = await this.prisma.projectCollaborator.count({
      where: { projectId },
    })

    return paginateOutput<CollaboratorListItemDTO>(collaborators, total, query)
  }

  async create(projectId: string, data: AddCollaboratorDTO) {
    const user = await this.prisma.user.findUnique({
      where: { id: data.userId },
    })

    if (!user) {
      throw new NotFoundException('User specified not found')
    }

    return this.prisma.projectCollaborator.create({
      data: {
        userId: data.userId,
        role: data.role,
        projectId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    })
  }

  async update(projectId: string, userId: string, data: UpdateCollaboratorDTO) {
    const collaborator = await this.prisma.projectCollaborator.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    })

    if (!collaborator) {
      throw new NotFoundException('Collaborator not found in this project')
    }

    return this.prisma.projectCollaborator.update({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
      data: {
        role: data.role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    })
  }

  async remove(projectId: string, userId: string) {
    const collaborator = await this.prisma.projectCollaborator.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    })

    if (!collaborator) {
      throw new NotFoundException('Collaborator not found in this project')
    }

    if (collaborator.role === CollaboratorRole.OWNER) {
      throw new BadRequestException("The project owner can't be removed")
    }

    await this.prisma.projectCollaborator.delete({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    })
  }
}
