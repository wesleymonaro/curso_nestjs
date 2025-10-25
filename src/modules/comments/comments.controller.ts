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
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
} from '@nestjs/swagger'
import { ValidateResourcesIds } from 'src/common/decorators/validate-resources-ids.decorator'
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard'
import { ValidateResourcesIdsInterceptor } from 'src/common/inteceptors/validate-resources-ids.interceptor'
import { CommentFullDTO, CommentListItemDTO, CommentRequestDTO } from './comments.dto'
import { CommentsService } from './comments.service'

@Controller({
  version: '1',
  path: 'projects/:projectId/tasks/:taskId/comments',
})
@UseInterceptors(ValidateResourcesIdsInterceptor)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('jwt')
export class CommentsController {
  constructor(private readonly commentSerivce: CommentsService) {}

  @Get()
  @ValidateResourcesIds()
  @ApiOkResponse({ type: [CommentListItemDTO], description: 'Get all comments by task' })
  findAllByTask(@Param('taskId', ParseUUIDPipe) taskId: string) {
    return this.commentSerivce.findAllByTask(taskId)
  }

  @Get(':commentId')
  @ValidateResourcesIds()
  @ApiOkResponse({ type: CommentFullDTO, description: 'Get comment by Id' })
  findOne(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
  ) {
    return this.commentSerivce.findById(taskId, commentId)
  }

  @Post()
  @ValidateResourcesIds()
  @ApiCreatedResponse({ type: CommentListItemDTO, description: 'Create a new comment' })
  @HttpCode(HttpStatus.CREATED)
  create(@Param('taskId', ParseUUIDPipe) taskId: string, @Body() data: CommentRequestDTO) {
    return this.commentSerivce.create(taskId, data)
  }

  @Put(':commentId')
  @ValidateResourcesIds()
  @ApiOkResponse({ type: CommentListItemDTO, description: 'Update a comment' })
  @HttpCode(HttpStatus.OK)
  update(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Body() data: CommentRequestDTO,
  ) {
    return this.commentSerivce.update(taskId, commentId, data)
  }

  @Delete(':commentId')
  @ValidateResourcesIds()
  @ApiNoContentResponse({ description: 'Delete a comment' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
  ) {
    return this.commentSerivce.remove(taskId, commentId)
  }
}
