import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  NotFoundException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable } from 'rxjs'
import { VALIDATE_RESOURCES_IDS_KEY } from 'src/consts'
import { PrismaService } from 'src/prisma.service'

@Injectable()
export class ValidateResourcesIdsInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<Request>> {
    // Validar se o endpoint possui o decorator @ValidateResourcesIds()
    const shouldValidate = this.reflector.get<boolean>(
      VALIDATE_RESOURCES_IDS_KEY,
      context.getHandler(),
    )

    if (!shouldValidate) {
      return next.handle()
    }

    // Validar o projectId da URL
    const request = context.switchToHttp().getRequest()
    const projectId = request.params.projectId

    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
      },
    })

    if (!project) {
      throw new NotFoundException('Project not found')
    }

    return next.handle()
  }
}
