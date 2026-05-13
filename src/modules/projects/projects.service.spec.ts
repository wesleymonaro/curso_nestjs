import { Test, TestingModule } from '@nestjs/testing'
import { Project } from '@prisma-generated/client'
import { RequestContextService } from 'src/common/services/request-context/request-context.service'
import { PrismaService } from 'src/prisma.service'
import { paginateOutput } from 'src/utils/pagination.utils'
import { mockedProjects, mockPaginationQuery } from './projects.mocks'
import { ProjectsService } from './projects.service'

describe('ProjectsService', () => {
  let service: ProjectsService
  let prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: PrismaService,
          useValue: {
            project: {
              findMany: jest.fn(),
              count: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            projectCollaborator: {
              create: jest.fn(),
              deleteMany: jest.fn(),
            },
            task: {
              deleteMany: jest.fn(),
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

    service = module.get<ProjectsService>(ProjectsService)
    prisma = module.get<PrismaService>(PrismaService)
  })

  it('should be able to return a paginated list of projects', async () => {
    // criando o mock e especificando o retorno das funções
    jest.spyOn(prisma.project, 'findMany').mockResolvedValue(mockedProjects)
    jest.spyOn(prisma.project, 'count').mockResolvedValue(mockedProjects.length)

    // chamada da função
    const result = await service.findAll(mockPaginationQuery)

    // comparações
    expect(result).toEqual(
      paginateOutput<Project>(mockedProjects, mockedProjects.length, mockPaginationQuery),
    )
    expect(prisma.project.findMany).toHaveBeenCalledTimes(1)
  })

  it('should be able to return a project by Id', async () => {
    const project = mockedProjects[0]

    jest.spyOn(prisma.project, 'findFirst').mockResolvedValue(project)

    const result = await service.findById(project.id)

    expect(result).toEqual(project)
    expect(prisma.project.findFirst).toHaveBeenCalledTimes(1)
  })

  it('should be able to create a new project', async () => {
    const project = mockedProjects[0]
    jest.spyOn(prisma.project, 'create').mockResolvedValue(project)

    const result = await service.create({
      name: project.name,
      description: project.description as string,
    })

    expect(result).toEqual(project)
    expect(prisma.project.create).toHaveBeenCalledTimes(1)
  })

  it('should be able to update a project', async () => {
    const project = mockedProjects[0]
    jest.spyOn(prisma.project, 'update').mockResolvedValue(project)

    const result = await service.update(project.id, {
      name: project.name,
      description: project.description as string,
    })

    expect(result).toEqual(project)
    expect(prisma.project.update).toHaveBeenCalledTimes(1)
  })

  it('should be able to remove a project', async () => {
    const project = mockedProjects[0]

    await service.remove(project.id)

    expect(prisma.task.deleteMany).toHaveBeenCalledTimes(1)
    expect(prisma.project.delete).toHaveBeenCalledTimes(1)
  })
})
