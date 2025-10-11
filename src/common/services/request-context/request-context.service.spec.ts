import { Test, TestingModule } from '@nestjs/testing'
import { RequestContextService } from '../../../modules/request-context/request-context.service'

describe('RequestContextService', () => {
  let service: RequestContextService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequestContextService],
    }).compile()

    service = module.get<RequestContextService>(RequestContextService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
