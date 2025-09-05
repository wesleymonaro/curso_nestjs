import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common'
import { UsersService } from './users.service'

@Controller({
  version: '1',
  path: 'users',
})
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  findAll() {
    return this.userService.findAll()
  }

  @Get(':userId')
  async findOne(@Param('userId', ParseUUIDPipe) userId: string) {
    const user = await this.userService.findById(userId)

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return user
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() data: any) {
    return this.userService.create(data)
  }

  @Put(':userId')
  async update(@Param('userId', ParseUUIDPipe) userId: string, @Body() data: any) {
    return this.userService.update(userId, data)
  }

  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.userService.remove(userId)
  }
}
