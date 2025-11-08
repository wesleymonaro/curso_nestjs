import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from 'src/prisma.service'
import { paginateOutput } from 'src/utils/pagination.utils'
import { TaskRequestDTO } from './tasks.dto'
import { mockedTasks, mockPaginationQuery } from './tasks.mock'
import { TasksService } from './tasks.service'

describe('TasksService', () => {
  let service: TasksService
  let prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: {
            task: {
              findMany: jest.fn(),
              count: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile()

    service = module.get<TasksService>(TasksService)
    prisma = module.get<PrismaService>(PrismaService)
  })

  it('should return a paginated list of tasks by project', async () => {
    jest.spyOn(prisma.task, 'findMany').mockResolvedValue(mockedTasks)
    jest.spyOn(prisma.task, 'count').mockResolvedValue(mockedTasks.length)

    const result = await service.findAllByProject('project-1', mockPaginationQuery)

    expect(result).toEqual(paginateOutput(mockedTasks, mockedTasks.length, mockPaginationQuery))
    expect(prisma.task.findMany).toHaveBeenCalledTimes(1)
    expect(prisma.task.count).toHaveBeenCalledTimes(1)
  })

  it('should return a task by id', async () => {
    const task = mockedTasks[0]
    jest.spyOn(prisma.task, 'findFirst').mockResolvedValue(task)

    const result = await service.findById('project-1', task.id)

    expect(result).toEqual(task)
    expect(prisma.task.findFirst).toHaveBeenCalledTimes(1)
  })

  it('should create a new task', async () => {
    const task = mockedTasks[0]
    jest.spyOn(prisma.task, 'create').mockResolvedValue(task)

    const data: TaskRequestDTO = {
      title: task.title,
      description: task.description ?? '',
      status: task.status,
      priority: task.priority,
      dueDate: typeof task.dueDate === 'string' ? task.dueDate : undefined,
      assigneeId: 'user-1',
    }

    const result = await service.create('project-1', data)

    expect(result).toEqual(task)
    expect(prisma.task.create).toHaveBeenCalledTimes(1)
  })

  it('should update a task', async () => {
    const task = mockedTasks[0]
    jest.spyOn(prisma.task, 'update').mockResolvedValue(task)

    const data: TaskRequestDTO = {
      title: task.title,
      description: task.description ?? '',
      status: task.status,
      priority: task.priority,
      dueDate: typeof task.dueDate === 'string' ? task.dueDate : undefined,
      assigneeId: 'user-1',
    }

    const result = await service.update('project-1', task.id, data)

    expect(result).toEqual(task)
    expect(prisma.task.update).toHaveBeenCalledTimes(1)
  })

  it('should delete a task', async () => {
    jest.spyOn(prisma.task, 'delete').mockResolvedValue(mockedTasks[0])

    await service.delete('project-1', 'task-1')

    expect(prisma.task.delete).toHaveBeenCalledTimes(1)
  })
})
