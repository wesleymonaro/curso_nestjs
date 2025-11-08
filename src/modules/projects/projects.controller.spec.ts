import { Test, TestingModule } from '@nestjs/testing'
import { Project } from '@prisma/client'
import { RequestContextService } from 'src/common/services/request-context/request-context.service'
import { PrismaService } from 'src/prisma.service'
import { paginateOutput } from 'src/utils/pagination.utils'
import { ProjectsController } from './projects.controller'
import { mockedProjects, mockPaginationQuery } from './projects.mocks'
import { ProjectsModule } from './projects.module'
import { ProjectsService } from './projects.service'

describe('ProjectsController', () => {
  let controller: ProjectsController
  let service: ProjectsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ProjectsModule],
    })
      .overrideProvider(ProjectsService)
      .useValue(service)
      .overrideProvider(PrismaService)
      .useValue({ $connect: jest.fn() })
      .overrideProvider(RequestContextService)
      .useValue({ getUserId: jest.fn().mockReturnValue('user-1') })
      .compile()

    controller = module.get<ProjectsController>(ProjectsController)
    service = module.get<ProjectsService>(ProjectsService)
  })

  describe('findAll', () => {
    it('should return a paginated list of projects', async () => {
      const mockedResponse = paginateOutput<Project>(
        mockedProjects,
        mockedProjects.length,
        mockPaginationQuery,
      )

      jest.spyOn(service, 'findAll').mockResolvedValue(mockedResponse)

      const response = await controller.findAll()

      expect(response).toEqual(mockedResponse)
      expect(service.findAll).toHaveBeenCalledTimes(1)
    })
  })
})
