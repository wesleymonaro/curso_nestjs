import { User } from '@prisma/client'
import { RequestContextService } from './request-context.service'

describe('RequestContextService', () => {
  const service: RequestContextService = new RequestContextService()

  it('should set and return the user', () => {
    const mockUser = { id: 'user-1' } as unknown as User
    service.setUser(mockUser)
    expect(service.getUser()).toEqual(mockUser)
  })

  it('should return the user id', () => {
    const mockUser = { id: 'user-1' } as unknown as User
    service.setUser(mockUser)
    expect(service.getUserId()).toEqual('user-1')
  })
})
