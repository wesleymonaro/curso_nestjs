import { Test, TestingModule } from '@nestjs/testing'
import { Project } from '@prisma-generated/client'
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

  describe('findOne', () => {
    it('should be able to return a single project by Id', async () => {
      const project = mockedProjects[0]
      const projectId = project.id
      const expectedResult = {
        ...project,
        tasks: [],
      }

      jest.spyOn(service, 'findById').mockResolvedValue(expectedResult)
      const response = await controller.findOne(projectId)

      expect(response).toEqual(expectedResult)
      expect(service.findById).toHaveBeenCalledWith(projectId)
      expect(service.findById).toHaveBeenCalledTimes(1)
    })
  })

  describe('create', () => {
    it('should be able to create a new project', async () => {
      const project = mockedProjects[0]

      jest.spyOn(service, 'create').mockResolvedValue(project)

      const response = await controller.create({
        name: project.name,
        description: project.description as string,
      })

      expect(response).toEqual(project)
      expect(service.create).toHaveBeenCalledTimes(1)
    })

    it('should be able to handle validation errors', async () => {
      const error = new Error('Name is required')

      jest.spyOn(service, 'create').mockRejectedValue(error)

      await expect(controller.create({ name: '', description: '' })).rejects.toThrow(
        'Name is required',
      )
    })
  })

  describe('update', () => {
    it('should be able to update a project', async () => {
      const project = { ...mockedProjects[0], tasks: [] }

      jest.spyOn(service, 'update').mockResolvedValue(project)

      const response = await controller.update(project.id, {
        name: project.name,
        description: project.description as string,
      })

      expect(response).toEqual(project)
      expect(service.update).toHaveBeenCalledTimes(1)
    })
  })

  describe('remove', () => {
    it('should be able to remove a project', async () => {
      jest.spyOn(service, 'remove').mockImplementation()
      await controller.remove(mockedProjects[0].id)
      expect(service.remove).toHaveBeenCalledTimes(1)
    })
  })
})
