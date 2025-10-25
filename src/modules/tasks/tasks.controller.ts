import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { ApiBearerAuth } from '@nestjs/swagger'
import { ValidateResourcesIds } from 'src/common/decorators/validate-resources-ids.decorator'
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard'
import { ValidateResourcesIdsInterceptor } from 'src/common/inteceptors/validate-resources-ids.interceptor'
import { TaskDTO } from './tasks.dto'
import { TasksService } from './tasks.service'

@Controller({
  version: '1',
  path: 'projects/:projectId/tasks',
})
@UseInterceptors(ValidateResourcesIdsInterceptor)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('jwt')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ValidateResourcesIds()
  findAllByProject(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.tasksService.findAllByProject(projectId)
  }

  @Post()
  @ValidateResourcesIds()
  create(@Param('projectId', ParseUUIDPipe) projectId: string, @Body() data: TaskDTO) {
    return this.tasksService.create(projectId, data)
  }

  @Get(':taskId')
  @ValidateResourcesIds()
  findOne(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
  ) {
    return this.tasksService.findById(projectId, taskId)
  }

  @Put(':taskId')
  @ValidateResourcesIds()
  update(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() data: TaskDTO,
  ) {
    return this.tasksService.update(projectId, taskId, data)
  }

  @Delete(':taskId')
  @ValidateResourcesIds()
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
  ) {
    return this.tasksService.delete(projectId, taskId)
  }
}
