import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import * as bcrypt from 'bcrypt'
import { PrismaService } from 'src/prisma.service'
import { MailModule } from '../mail/mail.module'
import { MailService } from '../mail/mail.service'
import { mockedUsers } from '../users/users.mocks'
import { UsersService } from '../users/users.service'
import { AuthService } from './auth.service'

jest.mock('bcrypt')

describe('AuthService', () => {
  let service: AuthService
  let userService: UsersService
  let mailService: MailService
  let prisma: PrismaService
  let jwtService: JwtService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [MailModule],
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              update: jest.fn(),
              create: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('123'),
            verify: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findByEmail: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendPasswordRequest: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
    userService = module.get<UsersService>(UsersService)
    prisma = module.get<PrismaService>(PrismaService)
    mailService = module.get<MailService>(MailService)
    jwtService = module.get<JwtService>(JwtService)
  })

  it('should be able to sign up a new user', async () => {
    const user = mockedUsers[0]

    jest.spyOn(prisma.user, 'create').mockResolvedValue(user)
    jest.spyOn(userService, 'create').mockResolvedValue(user)

    const result = await service.signup(user)

    expect(result).toEqual({ token: '123' })
    expect(userService.create).toHaveBeenCalledTimes(1)
  })

  describe('signIn', () => {
    it('should be able to login with the correct credentials', async () => {
      const user = mockedUsers[0]
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(user)

      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      const result = await service.signin({
        email: user.email,
        password: '123',
      })

      expect(result).toEqual({ token: '123' })
      expect(userService.findByEmail).toHaveBeenCalledTimes(1)
    })

    it('should return an exception if credentials are wrong', async () => {
      const user = mockedUsers[0]
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(user)

      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

      await expect(
        service.signin({
          email: user.email,
          password: '123',
        }),
      ).rejects.toThrow(UnauthorizedException)

      expect(userService.findByEmail).toHaveBeenCalledTimes(1)
    })
  })

  describe('forgotPassword', () => {
    it('should be able to request the e-mail to reset the password', async () => {
      const user = mockedUsers[0]
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(user)
      jest.spyOn(mailService, 'sendPasswordRequest').mockImplementation()

      const result = await service.forgotPassword(user.email)

      expect(result).toEqual({
        message: 'Password request email sent',
      })
      expect(userService.findByEmail).toHaveBeenCalledTimes(1)
    })

    it('should return NotFoundException if user not exists', async () => {
      const user = mockedUsers[0]
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(null)

      await expect(service.forgotPassword(user.email)).rejects.toThrow(NotFoundException)
    })

    it('should be able to reset the password from e-mail link', async () => {
      const user = mockedUsers[0]
      jest.spyOn(userService, 'findById').mockResolvedValue(user as any)
      jest.spyOn(prisma.user, 'update').mockResolvedValue(user as any)
      jest.spyOn(jwtService, 'verify').mockReturnValue({
        purpose: 'password_reset',
      })
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      const result = await service.resetPassword('123', '123')

      expect(result).toEqual(user)
      expect(userService.findById).toHaveBeenCalledTimes(1)
      expect(prisma.user.update).toHaveBeenCalledTimes(1)
    })

    it('should throw an error if the token is invalid', async () => {
      jest.spyOn(jwtService, 'verify').mockReturnValue({
        purpose: 'test',
      })

      await expect(service.resetPassword('123', '123')).rejects.toThrow(BadRequestException)
    })

    it('should throw an error if user not exists', async () => {
      jest.spyOn(userService, 'findById').mockResolvedValue(null)
      jest.spyOn(jwtService, 'verify').mockReturnValue({
        purpose: 'password_reset',
      })

      await expect(service.resetPassword('123', '123')).rejects.toThrow(BadRequestException)
    })
  })
})
