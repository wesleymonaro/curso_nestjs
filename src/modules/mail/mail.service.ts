import { Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { EMAIL_SERVICE, SEND_PASSWORD_RESET } from 'src/consts'

@Injectable()
export class MailService {
  constructor(@Inject(EMAIL_SERVICE) private client: ClientProxy) {}

  async sendPasswordRequest(email: string, token: string) {
    const url = `http://localhost:3000/v1/auth/reset-password?token=${token}`

    this.client.emit(SEND_PASSWORD_RESET, { email, url })
  }
}
