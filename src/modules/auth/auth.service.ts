import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { PrismaService } from 'src/prisma.service'
import { UsersService } from '../users/users.service'
import { SignUpDTO } from './auth.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async signup(data: SignUpDTO) {
    // Criptografar a senha
    const hash = await bcrypt.hash(data.password, 12)

    // Salvar o usuário no banco de dados
    const newUser = await this.usersService.create({
      ...data,
      password: hash,
    })

    // retornar o token JWT de acesso
  }
}
