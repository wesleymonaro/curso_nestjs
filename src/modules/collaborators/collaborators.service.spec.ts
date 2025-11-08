import { Test, TestingModule } from '@nestjs/testing'
import { RequestContextService } from 'src/common/services/request-context/request-context.service'
import { PrismaService } from 'src/prisma.service'
import { paginateOutput } from 'src/utils/pagination.utils'
import { mockedCollaborators, mockPaginationQuery } from './collaborators.mock'
import { CollaboratorsService } from './collaborators.service'

describe('CollaboratorsService', () => {
  let service: CollaboratorsService
  let prisma: PrismaService
  const projectId = 'project-1'

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollaboratorsService,
        {
          provide: PrismaService,
          useValue: {
            projectCollaborator: {
              findMany: jest.fn(),
              count: jest.fn(),
              findFirst: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            user: {
              findUnique: jest.fn(),
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

    service = module.get<CollaboratorsService>(CollaboratorsService)
    prisma = module.get<PrismaService>(PrismaService)
  })

  it('should return a paginated list of collaborators by project', async () => {
    jest.spyOn(prisma.projectCollaborator, 'findMany').mockResolvedValue(mockedCollaborators as any)
    jest.spyOn(prisma.projectCollaborator, 'count').mockResolvedValue(mockedCollaborators.length)

    const result = await service.findAllByProject(projectId, mockPaginationQuery)

    expect(result).toEqual(
      paginateOutput(mockedCollaborators, mockedCollaborators.length, mockPaginationQuery),
    )
    expect(prisma.projectCollaborator.findMany).toHaveBeenCalledTimes(1)
    expect(prisma.projectCollaborator.count).toHaveBeenCalledTimes(1)
  })

  it('should create a new collaborator', async () => {
    const collaborator = mockedCollaborators[0]
    jest.spyOn(prisma.projectCollaborator, 'create').mockResolvedValue(collaborator)
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ id: 'user-1' } as any)

    const result = await service.create(projectId, {
      userId: 'user-1',
      role: 'EDITOR',
    })

    expect(result).toEqual(collaborator)
    expect(prisma.projectCollaborator.create).toHaveBeenCalledTimes(1)
  })

  it('should update a collaborator', async () => {
    const collaborator = mockedCollaborators[0]
    jest.spyOn(prisma.projectCollaborator, 'update').mockResolvedValue(collaborator)
    jest.spyOn(prisma.projectCollaborator, 'findUnique').mockResolvedValue(collaborator)

    const result = await service.update(projectId, collaborator.id, collaborator)

    expect(result).toEqual(collaborator)
    expect(prisma.projectCollaborator.update).toHaveBeenCalledTimes(1)
  })

  it('should delete a collaborator', async () => {
    const collaborator = mockedCollaborators[0]

    jest.spyOn(prisma.projectCollaborator, 'delete').mockResolvedValue(collaborator)
    jest.spyOn(prisma.projectCollaborator, 'findUnique').mockResolvedValue(collaborator)
    await service.remove(projectId, 'collaborator-1')

    expect(prisma.projectCollaborator.delete).toHaveBeenCalledTimes(1)
  })
})
