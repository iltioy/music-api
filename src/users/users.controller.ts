import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { GetUser } from 'src/auth/decorator';
import { updateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get(':username')
  getUser(@Param('username') username: string) {
    return this.userService.getUser(username);
  }

  @Patch('update')
  updateUser(@GetUser('id') userId: number, @Body() dto: updateUserDto) {
    return this.userService.updateUser(userId, dto);
  }
}
