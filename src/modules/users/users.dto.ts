import { ApiProperty } from '@nestjs/swagger'
import { Role } from '@prisma/client'
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateUserDTO {
  @ApiProperty({ description: 'User name' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ description: 'User email', uniqueItems: true })
  @IsEmail()
  @IsNotEmpty()
  email: string

  @ApiProperty({ description: 'User Password', minLength: 6 })
  @IsString()
  @IsNotEmpty()
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

export class UpdateUserDTO {
  @ApiProperty({ description: 'User name', required: false })
  @IsString()
  @IsOptional()
  name?: string

  @ApiProperty({
    description: 'User role',
    enum: Role,
    default: Role.ADMIN,
    required: false,
  })
  @IsEnum(Role)
  @IsOptional()
  role?: Role
}

export class UserListItemDTO {
  @ApiProperty() id: string
  @ApiProperty() name: string
  @ApiProperty() email: string
  @ApiProperty() avatar: string
  @ApiProperty() role: Role
  @ApiProperty() createdAt: string
  @ApiProperty() updatedAt: string
}

class UserProjectDTO {
  @ApiProperty() id: string
  @ApiProperty() name: string
  @ApiProperty({ nullable: true, required: false }) description: string
}

export class UserFullDTO extends UserListItemDTO {
  @ApiProperty({ type: [UserProjectDTO] })
  createdProjects: UserProjectDTO[]
}
