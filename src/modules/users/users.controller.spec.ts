import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { CloudinaryService } from 'src/common/services/cloudinary/cloudinary.service'
import { RequestContextService } from 'src/common/services/request-context/request-context.service'
import { PrismaService } from 'src/prisma.service'
import { paginateOutput } from 'src/utils/pagination.utils'
import { UsersController } from './users.controller'
import { mockedUsers, mockPaginationQuery } from './users.mocks'
import { UsersModule } from './users.module'
import { UsersService } from './users.service'

describe('UsersController', () => {
  let controller: UsersController
  let service: UsersService
  let cloudinaryService: CloudinaryService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
    })
      .overrideProvider(UsersService)
      .useValue({
        findAll: jest.fn(),
        findById: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
      })
      .overrideProvider(PrismaService)
      .useValue({ $connect: jest.fn() })
      .overrideProvider(RequestContextService)
      .useValue({ getUser: jest.fn().mockReturnValue(mockedUsers[0]) })
      .overrideProvider(CloudinaryService)
      .useValue({ upload: jest.fn() })
      .compile()

    controller = module.get<UsersController>(UsersController)
    service = module.get<UsersService>(UsersService)
    cloudinaryService = module.get<CloudinaryService>(CloudinaryService)
  })

  describe('findAll', () => {
    it('should return a paginated list of users', async () => {
      const mockedResponse = paginateOutput(mockedUsers, mockedUsers.length, mockPaginationQuery)

      jest.spyOn(service, 'findAll').mockResolvedValue(mockedResponse)
      const response = await controller.findAll(mockPaginationQuery)
      expect(response).toEqual(mockedResponse)
      expect(service.findAll).toHaveBeenCalledWith(mockPaginationQuery)
    })
  })

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const user = mockedUsers[0]
      jest.spyOn(service, 'findById').mockResolvedValue(user as any)
      const response = await controller.findOne(user.id)
      expect(response).toEqual(user)
      expect(service.findById).toHaveBeenCalledWith(user.id)
    })

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(null)
      await expect(controller.findOne('non-existent-id')).rejects.toThrow(NotFoundException)
    })
  })

  describe('create', () => {
    it('should create a new user', async () => {
      const user = mockedUsers[0]
      jest.spyOn(service, 'create').mockResolvedValue(user)
      const response = await controller.create({
        name: user.name,
        email: user.email,
        password: user.password,
      })
      expect(response).toEqual(user)
      expect(service.create).toHaveBeenCalledTimes(1)
    })

    it('should handle validation errors', async () => {
      const error = new Error('Name is required')
      jest.spyOn(service, 'create').mockRejectedValue(error)
      await expect(controller.create({ name: '', email: '', password: '' })).rejects.toThrow(
        'Name is required',
      )
    })
  })

  describe('update', () => {
    it('should update a user', async () => {
      const user = mockedUsers[0]
      jest.spyOn(service, 'update').mockResolvedValue(user)
      const response = await controller.update(user.id, { name: user.name })
      expect(response).toEqual(user)
      expect(service.update).toHaveBeenCalledWith(user.id, { name: user.name })
    })
  })

  describe('remove', () => {
    it('should remove a user', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined)
      await controller.remove(mockedUsers[0].id)
      expect(service.remove).toHaveBeenCalledWith(mockedUsers[0].id)
    })
  })

  describe('uploadAvatar', () => {
    it('should upload avatar and update user', async () => {
      const user = mockedUsers[0]
      const file = { originalname: 'avatar.png' } as Express.Multer.File
      const avatarUrl = 'http://cloudinary.com/avatar.png'
      jest.spyOn(cloudinaryService, 'upload').mockResolvedValue({ url: avatarUrl })
      jest.spyOn(service, 'update').mockResolvedValue({ ...user, avatar: avatarUrl })
      jest.spyOn(service, 'findById').mockResolvedValue({ ...user, avatar: avatarUrl } as any)

      const response = await controller.uploadAvatar(file)
      expect(cloudinaryService.upload).toHaveBeenCalledWith(file, user.id)
      expect(service.update).toHaveBeenCalledWith(user.id, { ...user, avatar: avatarUrl })
      expect(response).toEqual({ ...user, avatar: avatarUrl })
    })
  })
})
