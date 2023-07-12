import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common'
import { UsersService } from './users.service'
import { Public } from 'src/auth/public.decorator'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post()
  async createUser(
    @Body('email') userEmail: string,
    @Body('password') userPassword: string
  ) {
    const user = await this.usersService.createUser(userEmail, userPassword)
    return user
  }

  @Get(':email')
  getUser(@Param('email') userEmail: string) {
    return this.usersService.getUser(userEmail)
  }

  @Patch('resetPassword')
  async resetPassword(
    @Body('email') email: string,
    @Body('oldPassword') oldPassword: string,
    @Body('newPassword') newPassword: string
  ) {
    await this.usersService.resetPassword(email, oldPassword, newPassword)
    return null
  }
}
