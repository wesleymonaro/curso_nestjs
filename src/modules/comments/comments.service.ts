import { Injectable, NotFoundException } from '@nestjs/common'
import { QueryPaginationDTO } from 'src/common/dtos/query-pagination.dto'
import { RequestContextService } from 'src/common/services/request-context/request-context.service'
import { PrismaService } from 'src/prisma.service'
import { paginate, paginateOutput } from 'src/utils/pagination.utils'
import { CommentListItemDTO, CommentRequestDTO } from './comments.dto'

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly requestContext: RequestContextService,
  ) {}

  async findAllByTask(taskId: string, query?: QueryPaginationDTO) {
    const comments = await this.prisma.comment.findMany({
      ...paginate(query),
      where: { taskId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    })

    const total = await this.prisma.comment.count({
      where: { taskId },
    })

    return paginateOutput<CommentListItemDTO>(comments, total, query)
  }

  findById(taskId: string, commentId: string) {
    return this.prisma.comment.findFirst({
      where: {
        id: commentId,
        taskId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            projectId: true,
          },
        },
      },
    })
  }

  create(taskId: string, data: CommentRequestDTO) {
    const userId = this.requestContext.getUserId()

    return this.prisma.comment.create({
      data: {
        content: data.content,
        taskId,
        authorId: userId,
      },
      include: {
        author: {
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

  async update(taskId: string, commentId: string, data: CommentRequestDTO) {
    const userId = this.requestContext.getUserId()

    const existingComment = await this.prisma.comment.findFirst({
      where: {
        id: commentId,
        taskId,
        authorId: userId,
      },
    })

    if (!existingComment) {
      throw new NotFoundException('Comment not found')
    }

    return this.prisma.comment.update({
      where: { id: commentId },
      data,
      include: {
        author: {
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

  async remove(taskId: string, commentId: string) {
    const userId = this.requestContext.getUserId()

    const existingComment = await this.prisma.comment.findFirst({
      where: {
        id: commentId,
        taskId,
        authorId: userId,
      },
    })

    if (!existingComment) {
      throw new NotFoundException('Comment not found')
    }

    await this.prisma.comment.delete({
      where: { id: commentId },
    })
  }
}
