import { Injectable } from '@nestjs/common'
import { MailerService } from '@nestjs-modules/mailer'

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendPasswordRequest(email: string, token: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Redefinição de senha',
      template: 'forgot-password.hbs',
      context: {
        url: `http://localhost:3000/v1/auth/reset-password?token=${token}`,
      },
    })
  }
}
