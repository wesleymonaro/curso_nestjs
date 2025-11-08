import { faker } from '@faker-js/faker'
import { ProjectCollaborator } from '@prisma/client'
import { QueryPaginationDTO } from 'src/common/dtos/query-pagination.dto'

export const mockPaginationQuery: QueryPaginationDTO = { page: '1', size: '10' }

export const mockedCollaborators = faker.helpers.multiple<ProjectCollaborator>(
  () => ({
    id: faker.string.uuid(),
    role: 'EDITOR',
    createdAt: new Date(),
    projectId: 'project-1',
    userId: 'user-1',
  }),
  { count: 5 },
)
