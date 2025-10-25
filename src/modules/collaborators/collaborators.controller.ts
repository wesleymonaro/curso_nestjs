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
  ApiResponse,
} from '@nestjs/swagger'
import { ValidateResourcesIds } from 'src/common/decorators/validate-resources-ids.decorator'
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard'
import { ValidateResourcesIdsInterceptor } from 'src/common/inteceptors/validate-resources-ids.interceptor'
import {
  AddCollaboratorDTO,
  CollaboratorListItemDTO,
  UpdateCollaboratorDTO,
} from './collaborators.dto'
import { CollaboratorsService } from './collaborators.service'

@Controller({
  version: '1',
  path: 'projects/:projectId/collaborators',
})
@UseInterceptors(ValidateResourcesIdsInterceptor)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('jwt')
export class CollaboratorsController {
  constructor(private readonly collaboratorService: CollaboratorsService) {}

  @Get()
  @ValidateResourcesIds()
  @ApiResponse({ type: [CollaboratorListItemDTO] })
  findAllByProject(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.collaboratorService.findAllByProject(projectId)
  }

  @Post()
  @ValidateResourcesIds()
  @ApiCreatedResponse({
    type: CollaboratorListItemDTO,
  })
  @HttpCode(HttpStatus.CREATED)
  create(@Param('projectId', ParseUUIDPipe) projectId: string, @Body() data: AddCollaboratorDTO) {
    return this.collaboratorService.create(projectId, data)
  }

  @Put(':userId')
  @ValidateResourcesIds()
  @ApiOkResponse({
    type: CollaboratorListItemDTO,
  })
  update(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() data: UpdateCollaboratorDTO,
  ) {
    return this.collaboratorService.update(projectId, userId, data)
  }

  @Delete(':userId')
  @ValidateResourcesIds()
  @ApiNoContentResponse()
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.collaboratorService.remove(projectId, userId)
  }
}
