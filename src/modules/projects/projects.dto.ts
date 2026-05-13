import { ApiProperty } from '@nestjs/swagger'
import { TaskPriority, TaskStatus } from '@prisma-generated/client'
import { IsNotEmpty, IsString } from 'class-validator'

export class ProjectRequestDTO {
  @ApiProperty({ description: 'Project name' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ description: 'Project description', required: false })
  @IsString()
  description: string
}

export class ProjectListItemDTO {
  @ApiProperty() id: string
  @ApiProperty() name: string
  @ApiProperty() description: string
  @ApiProperty({ format: 'date-time' }) createdAt: string
  @ApiProperty({ format: 'date-time' }) updatedAt: string
  @ApiProperty() createdById: string
}

export class ProjectTaskDTO {
  @ApiProperty() id: string
  @ApiProperty() title: string
  @ApiProperty({ nullable: true, required: false }) description?: string
  @ApiProperty({
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  status: string
  @ApiProperty({
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority: string
  @ApiProperty({ nullable: true, required: false, format: 'date-time' }) dueDate?: string
  @ApiProperty({ format: 'date-time' }) createdAt: string
  @ApiProperty({ format: 'date-time' }) updatedAt: string
}

export class ProjectFullDTO extends ProjectListItemDTO {
  @ApiProperty({ type: [ProjectTaskDTO] }) tasks: ProjectTaskDTO[]
}
