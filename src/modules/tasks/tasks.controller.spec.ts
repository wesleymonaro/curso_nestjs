import { Test, TestingModule } from '@nestjs/testing'
import { Task } from '@prisma-generated/client'
import { RequestContextService } from 'src/common/services/request-context/request-context.service'
import { PrismaService } from 'src/prisma.service'
import { paginateOutput } from 'src/utils/pagination.utils'
import { TasksController } from './tasks.controller'
import { mockedTasks, mockPaginationQuery } from './tasks.mock'
import { TasksModule } from './tasks.module'
import { TasksService } from './tasks.service'

describe('TasksController', () => {
  let controller: TasksController
  let service: TasksService
  const projectId = 'project-1'

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TasksModule],
    })
      .overrideProvider(TasksService)
      .useValue(service)
      .overrideProvider(PrismaService)
      .useValue({ $connect: jest.fn() })
      .overrideProvider(RequestContextService)
      .useValue({ getUserId: jest.fn().mockReturnValue('user-1') })
      .compile()

    controller = module.get<TasksController>(TasksController)
    service = module.get<TasksService>(TasksService)
  })

  describe('findAll', () => {
    it('should return a paginated list of tasks', async () => {
      const mockedResponse = paginateOutput<Task>(
        mockedTasks,
        mockedTasks.length,
        mockPaginationQuery,
      )

      jest.spyOn(service, 'findAllByProject').mockResolvedValue(mockedResponse)

      const response = await controller.findAllByProject('project-1', mockPaginationQuery)

      expect(response).toEqual(mockedResponse)
      expect(service.findAllByProject).toHaveBeenCalledTimes(1)
    })
  })

  describe('findOne', () => {
    it('should be able to return a single task by Id', async () => {
      const task = mockedTasks[0]
      const taskId = task.id

      jest.spyOn(service, 'findById').mockResolvedValue(task as any)
      const response = await controller.findOne(projectId, taskId)

      expect(response).toEqual(task)
      expect(service.findById).toHaveBeenCalledWith(projectId, taskId)
      expect(service.findById).toHaveBeenCalledTimes(1)
    })
  })

  describe('create', () => {
    it('should be able to create a new task', async () => {
      const task = mockedTasks[0]

      jest.spyOn(service, 'create').mockResolvedValue(task as any)

      const response = await controller.create(projectId, {
        title: task.title,
        description: task.description as string,
      })

      expect(response).toEqual(task)
      expect(service.create).toHaveBeenCalledTimes(1)
    })

    it('should be able to handle validation errors', async () => {
      const error = new Error('Title is required')

      jest.spyOn(service, 'create').mockRejectedValue(error)

      await expect(controller.create(projectId, { title: '', description: '' })).rejects.toThrow(
        'Title is required',
      )
    })
  })

  describe('update', () => {
    it('should be able to update a task', async () => {
      const task = { ...mockedTasks[0], tasks: [] }

      jest.spyOn(service, 'update').mockResolvedValue(task as any)

      const response = await controller.update(projectId, task.id, {
        title: task.title,
        description: task.description as string,
      })

      expect(response).toEqual(task)
      expect(service.update).toHaveBeenCalledTimes(1)
    })
  })

  describe('remove', () => {
    it('should be able to remove a task', async () => {
      jest.spyOn(service, 'delete').mockImplementation()
      await controller.remove(projectId, mockedTasks[0].id)
      expect(service.delete).toHaveBeenCalledTimes(1)
    })
  })
})
