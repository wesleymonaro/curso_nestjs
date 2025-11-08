import { Test, TestingModule } from '@nestjs/testing'
import { RequestContextService } from 'src/common/services/request-context/request-context.service'
import { PrismaService } from 'src/prisma.service'
import { paginateOutput } from 'src/utils/pagination.utils'
import { mockedComments, mockPaginationQuery } from './comments.mock'
import { CommentsService } from './comments.service'

describe('CommentsService', () => {
  let service: CommentsService
  let prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: PrismaService,
          useValue: {
            comment: {
              findMany: jest.fn(),
              count: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: RequestContextService,
          useValue: {
            getUserId: jest.fn().mockReturnValue('user-1'),
          },
        },
      ],
    }).compile()

    service = module.get<CommentsService>(CommentsService)
    prisma = module.get<PrismaService>(PrismaService)
  })

  it('should return a paginated list of comments by task', async () => {
    jest.spyOn(prisma.comment, 'findMany').mockResolvedValue(mockedComments)
    jest.spyOn(prisma.comment, 'count').mockResolvedValue(mockedComments.length)

    const result = await service.findAllByTask('task-1', mockPaginationQuery)

    expect(result).toEqual(
      paginateOutput(mockedComments, mockedComments.length, mockPaginationQuery),
    )
    expect(prisma.comment.findMany).toHaveBeenCalledTimes(1)
    expect(prisma.comment.count).toHaveBeenCalledTimes(1)
  })

  it('should return a comment by id', async () => {
    const comment = mockedComments[0]
    jest.spyOn(prisma.comment, 'findFirst').mockResolvedValue(comment)

    const result = await service.findById('task-1', comment.id)

    expect(result).toEqual(comment)
    expect(prisma.comment.findFirst).toHaveBeenCalledTimes(1)
  })

  it('should create a new comment', async () => {
    const comment = mockedComments[0]
    jest.spyOn(prisma.comment, 'create').mockResolvedValue(comment)

    const result = await service.create('task-1', {
      content: comment.content,
    })

    expect(result).toEqual(comment)
    expect(prisma.comment.create).toHaveBeenCalledTimes(1)
  })

  it('should update a comment', async () => {
    const comment = mockedComments[0]
    jest.spyOn(prisma.comment, 'update').mockResolvedValue(comment)
    jest.spyOn(prisma.comment, 'findFirst').mockResolvedValue(comment)

    const result = await service.update('task-1', comment.id, comment)

    expect(result).toEqual(comment)
    expect(prisma.comment.update).toHaveBeenCalledTimes(1)
  })

  it('should delete a comment', async () => {
    const comment = mockedComments[0]

    jest.spyOn(prisma.comment, 'delete').mockResolvedValue(comment)
    jest.spyOn(prisma.comment, 'findFirst').mockResolvedValue(comment)
    await service.remove('task-1', 'comment-1')

    expect(prisma.comment.delete).toHaveBeenCalledTimes(1)
  })
})
