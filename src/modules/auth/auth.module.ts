import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { PrismaService } from 'src/prisma.service'
import { MailModule } from '../mail/mail.module'
import { MailService } from '../mail/mail.service'
import { UsersService } from '../users/users.service'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtStrategy } from './jwt.strategy'

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.SECRET_KEY,
      signOptions: { expiresIn: '1d' },
    }),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService, PrismaService, JwtStrategy, MailService],
})
export class AuthModule {}
