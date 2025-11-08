import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from 'src/prisma.service'
import { paginateOutput } from 'src/utils/pagination.utils'
import { mockedUsers, mockPaginationQuery } from './users.mocks'
import { UsersService } from './users.service'

describe('UsersService', () => {
  let service: UsersService
  let prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
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

    service = module.get<UsersService>(UsersService)
    prisma = module.get<PrismaService>(PrismaService)
  })

  it('should be able to return a paginated list of users', async () => {
    jest.spyOn(prisma.user, 'findMany').mockResolvedValue(mockedUsers)
    jest.spyOn(prisma.user, 'count').mockResolvedValue(mockedUsers.length)

    const result = await service.findAll(mockPaginationQuery)

    expect(result).toEqual(paginateOutput(mockedUsers, mockedUsers.length, mockPaginationQuery))
    expect(prisma.user.findMany).toHaveBeenCalledTimes(1)
  })

  it('should be able to return a user by Id', async () => {
    const user = mockedUsers[0]

    jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(user)

    const result = await service.findById(user.id)

    expect(result).toEqual(user)
    expect(prisma.user.findFirst).toHaveBeenCalledTimes(1)
  })

  it('should be able to return a user by email', async () => {
    const user = mockedUsers[1]

    jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(user)

    const result = await service.findByEmail(user.email)

    expect(result).toEqual(user)
    expect(prisma.user.findFirst).toHaveBeenCalledTimes(1)
  })

  it('should be able to create a new user', async () => {
    const user = mockedUsers[0]
    jest.spyOn(prisma.user, 'create').mockResolvedValue(user)

    const result = await service.create({
      name: user.name,
      email: user.email,
      password: 'plain',
    })

    expect(result).toEqual(user)
    expect(prisma.user.create).toHaveBeenCalledTimes(1)
  })

  it('should be able to update a user', async () => {
    const user = mockedUsers[0]
    jest.spyOn(prisma.user, 'update').mockResolvedValue(user)

    const result = await service.update(user.id, { name: user.name })

    expect(result).toEqual(user)
    expect(prisma.user.update).toHaveBeenCalledTimes(1)
  })

  it('should be able to remove a user', async () => {
    const user = mockedUsers[0]

    await service.remove(user.id)

    expect(prisma.user.delete).toHaveBeenCalledTimes(1)
  })
})
