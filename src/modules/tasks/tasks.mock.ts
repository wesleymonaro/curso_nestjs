import { faker } from '@faker-js/faker'
import { Task, TaskPriority, TaskStatus } from '@prisma/client'
import { QueryPaginationDTO } from 'src/common/dtos/query-pagination.dto'

export const mockPaginationQuery: QueryPaginationDTO = { page: '1', size: '10' }

export const mockedTasks = faker.helpers.multiple<Task>(() => ({
  id: faker.string.uuid(),
  title: faker.lorem.sentence(),
  description: faker.lorem.sentence(),
  status: faker.helpers.arrayElement(Object.values(TaskStatus)),
  priority: faker.helpers.arrayElement(Object.values(TaskPriority)),
  dueDate: faker.date.future(),
  createdAt: new Date(),
  updatedAt: new Date(),
  projectId: 'project-1',
  assigneeId: 'user-1',
  assignee: {
    id: 'user-1',
    name: faker.person.fullName(),
    email: faker.internet.email,
    avatar: '',
  },
}))
