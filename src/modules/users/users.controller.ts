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
import { ApiResponse } from '@nestjs/swagger'
import { CreateUserDTO, UpdateUserDTO, UserFullDTO, UserListItemDTO } from './users.dto'
import { UsersService } from './users.service'

@Controller({
  version: '1',
  path: 'users',
})
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  @ApiResponse({ type: [UserListItemDTO] })
  findAll() {
    return this.userService.findAll()
  }

  @Get(':userId')
  @ApiResponse({ type: UserFullDTO })
  async findOne(@Param('userId', ParseUUIDPipe) userId: string) {
    const user = await this.userService.findById(userId)

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return user
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() data: CreateUserDTO) {
    return this.userService.create(data)
  }

  @Put(':userId')
  async update(@Param('userId', ParseUUIDPipe) userId: string, @Body() data: UpdateUserDTO) {
    return this.userService.update(userId, data)
  }

  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.userService.remove(userId)
  }
}
