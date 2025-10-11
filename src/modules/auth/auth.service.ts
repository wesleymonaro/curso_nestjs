import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { PrismaService } from 'src/prisma.service'
import { MailService } from '../mail/mail.service'
import { UsersService } from '../users/users.service'
import { SignInDTO, SignUpDTO } from './auth.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly mailSerivice: MailService,
  ) {}

  async signup(data: SignUpDTO) {
    const hash = await bcrypt.hash(data.password, 12)

    const newUser = await this.usersService.create({
      ...data,
      password: hash,
    })

    return {
      token: this.jwtService.sign({
        sub: newUser.id,
      }),
    }
  }

  async signin(data: SignInDTO) {
    const user = await this.usersService.findByEmail(data.email)

    if (user && (await bcrypt.compare(data.password, user.password))) {
      return {
        token: this.jwtService.sign({
          sub: user.id,
        }),
      }
    }

    throw new UnauthorizedException()
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email)

    if (!user) {
      throw new NotFoundException('User not found')
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      purpose: 'password_reset',
    })

    await this.mailSerivice.sendPasswordRequest(user.email, token)

    return {
      message: 'Password request email sent',
    }
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = this.jwtService.verify(token)

      if (payload.purpose !== 'password_reset') {
        throw new BadRequestException('Invalid token')
      }

      const user = await this.usersService.findById(payload.sub)

      if (!user) {
        throw new BadRequestException('Invalid token')
      }

      const hash = await bcrypt.hash(newPassword, 12)

      return this.prisma.user.update({
        where: { id: user.id },
        data: { password: hash },
      })
    } catch (error) {
      console.log(error)
      throw new BadRequestException('Invalid or expired token')
    }
  }
}
