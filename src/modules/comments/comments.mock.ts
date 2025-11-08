import { faker } from '@faker-js/faker'
import { Comment } from '@prisma/client'
import { QueryPaginationDTO } from 'src/common/dtos/query-pagination.dto'

export const mockPaginationQuery: QueryPaginationDTO = { page: '1', size: '10' }

export const mockedComments = faker.helpers.multiple<Comment>(
  () => ({
    id: faker.string.uuid(),
    content: faker.lorem.sentence(),
    authorId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    taskId: 'task-1',
  }),
  { count: 5 },
)
