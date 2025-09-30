import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { PrismaService } from 'src/prisma.service'
import { UsersService } from '../users/users.service'
import { SignInDTO, SignUpDTO } from './auth.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
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
}
