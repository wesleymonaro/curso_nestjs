import { Body, Controller, Post } from '@nestjs/common'
import { UsersService } from '../users/users.service'
import { SignUpDTO } from './auth.dto'
import { AuthService } from './auth.service'

@Controller({
  version: '1',
  path: 'auth',
})
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  signup(@Body() data: SignUpDTO) {
    return this.authService.signup(data)
  }
}
