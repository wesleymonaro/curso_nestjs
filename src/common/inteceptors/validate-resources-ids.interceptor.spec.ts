import { ExecutionContext, NotFoundException } from '@nestjs/common'
import { HttpArgumentsHost } from '@nestjs/common/interfaces'
import { Reflector } from '@nestjs/core'
import { Test, TestingModule } from '@nestjs/testing'
import { of } from 'rxjs'
import { VALIDATE_RESOURCES_IDS_KEY } from 'src/consts'
import { PrismaService } from 'src/prisma.service'
import { ValidateResourcesIdsInterceptor } from './validate-resources-ids.interceptor'

describe('ValidateResourcesIdsInterceptor', () => {
  let interceptor: ValidateResourcesIdsInterceptor
  let reflector: Reflector
  let prisma: PrismaService

  const mockExecutionContext = {
    switchToHttp: jest.fn().mockReturnThis(),
    getRequest: jest.fn(),
    getHandler: jest.fn(),
  } as unknown as ExecutionContext

  const mockCallHandler = {
    handle: jest.fn(() => of({})),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValidateResourcesIdsInterceptor,
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            project: {
              findFirst: jest.fn(),
            },
            task: {
              findFirst: jest.fn(),
            },
          },
        },
      ],
    }).compile()

    interceptor = module.get<ValidateResourcesIdsInterceptor>(ValidateResourcesIdsInterceptor)
    reflector = module.get<Reflector>(Reflector)
    prisma = module.get<PrismaService>(PrismaService)
  })

  it('should skip validation if decorator is not present', async () => {
    jest.spyOn(reflector, 'get').mockReturnValue(false)

    const result = await interceptor.intercept(mockExecutionContext, mockCallHandler)

    expect(reflector.get).toHaveBeenCalledWith(
      VALIDATE_RESOURCES_IDS_KEY,
      mockExecutionContext.getHandler(),
    )
    expect(result).toBeDefined()
    expect(prisma.project.findFirst).not.toHaveBeenCalled()
  })

  it('should validate project id and throw if project is not found', async () => {
    const mockRequest = {
      params: {
        projectId: 'project-1',
      },
    }

    jest.spyOn(reflector, 'get').mockReturnValue(true)
    jest.spyOn(mockExecutionContext, 'switchToHttp').mockReturnValue({
      getRequest: () => mockRequest,
    } as HttpArgumentsHost)
    jest.spyOn(prisma.project, 'findFirst').mockResolvedValue(null)

    await expect(interceptor.intercept(mockExecutionContext, mockCallHandler)).rejects.toThrow(
      NotFoundException,
    )
    expect(prisma.project.findFirst).toHaveBeenCalledWith({
      where: { id: 'project-1' },
    })
  })

  it('should validate project and continue if project exists', async () => {
    const mockRequest = {
      params: {
        projectId: 'project-1',
      },
    }

    jest.spyOn(reflector, 'get').mockReturnValue(true)
    jest.spyOn(mockExecutionContext, 'switchToHttp').mockReturnValue({
      getRequest: () => mockRequest,
    } as HttpArgumentsHost)
    jest.spyOn(prisma.project, 'findFirst').mockResolvedValue({ id: 'project-1' } as any)

    const result = await interceptor.intercept(mockExecutionContext, mockCallHandler)

    expect(result).toBeDefined()
    expect(prisma.project.findFirst).toHaveBeenCalledWith({
      where: { id: 'project-1' },
    })
  })

  it('should validate task id and throw if task is not found', async () => {
    const mockRequest = {
      params: {
        projectId: 'project-1',
        taskId: 'task-1',
      },
    }
    jest.spyOn(reflector, 'get').mockReturnValue(true)
    jest.spyOn(mockExecutionContext, 'switchToHttp').mockReturnValue({
      getRequest: () => mockRequest,
    } as HttpArgumentsHost)
    jest.spyOn(prisma.project, 'findFirst').mockResolvedValue({ id: 'project-1' } as any)
    jest.spyOn(prisma.task, 'findFirst').mockResolvedValue(null)

    await expect(interceptor.intercept(mockExecutionContext, mockCallHandler)).rejects.toThrow(
      NotFoundException,
    )

    expect(prisma.task.findFirst).toHaveBeenCalledWith({
      where: { projectId: 'project-1', id: 'task-1' },
    })
  })

  it('should validate both project and task and continue if both exists', async () => {
    const mockRequest = {
      params: {
        projectId: 'project-1',
        taskId: 'task-1',
      },
    }

    jest.spyOn(reflector, 'get').mockReturnValue(true)
    jest.spyOn(mockExecutionContext, 'switchToHttp').mockReturnValue({
      getRequest: () => mockRequest,
    } as HttpArgumentsHost)
    jest.spyOn(prisma.project, 'findFirst').mockResolvedValue({ id: 'project-1' } as any)
    jest.spyOn(prisma.task, 'findFirst').mockResolvedValue({ id: 'task-1' } as any)

    const result = await interceptor.intercept(mockExecutionContext, mockCallHandler)

    expect(result).toBeDefined()
    expect(prisma.project.findFirst).toHaveBeenCalledWith({
      where: { id: 'project-1' },
    })
    expect(prisma.task.findFirst).toHaveBeenCalledWith({
      where: { projectId: 'project-1', id: 'task-1' },
    })
  })
})
