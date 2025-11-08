import { ApiProperty } from '@nestjs/swagger'
import { Role } from '@prisma/client'
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator'

export class SignUpDTO {
  @ApiProperty({ description: 'User name' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ description: 'User e-mail', uniqueItems: true })
  @IsEmail()
  @IsNotEmpty()
  email: string

  @ApiProperty({ description: 'User password', minLength: 6 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string

  @ApiProperty({
    description: 'User role',
    enum: Role,
    default: Role.ADMIN,
    required: false,
  })
  @IsEnum(Role)
  @IsOptional()
  role?: Role = Role.ADMIN
}

export class SignInDTO {
  @ApiProperty({ description: 'User e-mail' })
  @IsEmail()
  @IsNotEmpty()
  email: string

  @ApiProperty({ description: 'User password' })
  @IsString()
  @IsNotEmpty()
  password: string
}

export class ForgotPasswordDTO {
  @ApiProperty({ description: 'User e-mail' })
  @IsEmail()
  @IsNotEmpty()
  email: string
}

export class ResetPasswordDTO {
  @ApiProperty({ description: 'Reset token' })
  @IsString()
  @IsNotEmpty()
  token: string

  @ApiProperty({ description: 'New password', minLength: 6 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string
}

export class ChangePasswordDTO {
  @ApiProperty({ description: 'Current Password' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string

  @ApiProperty({ description: 'New password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string
}
