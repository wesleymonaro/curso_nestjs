import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { CommentRequestDTO } from './comments.dto'

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  findAllByTask(taskId: string) {
    return this.prisma.comment.findMany({
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
    return this.prisma.comment.create({
      data: {
        content: data.content,
        taskId,
        authorId: '123', // TODO - Change User ID
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
    const existingComment = await this.prisma.comment.findFirst({
      where: {
        id: commentId,
        taskId,
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
    const existingComment = await this.findById(taskId, commentId)

    if (!existingComment) {
      throw new NotFoundException('Comment not found')
    }

    await this.prisma.comment.delete({
      where: { id: commentId },
    })
  }
}
