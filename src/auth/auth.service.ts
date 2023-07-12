import { Injectable, UnauthorizedException } from '@nestjs/common'
import { UsersService } from 'src/users/users.service'
import { JwtService } from '@nestjs/jwt'

const bcrypt = require('bcrypt')

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async signIn(email: string, pass: string) {
    const user = await this.usersService.getUser(email)
    try {
      if (await bcrypt.compare(pass, user.password)) {
        const payload = { id: user._id, email: user.email }
        const userRespose = {
          id: user._id,
          calculations: user.calculations,
          email: user.email,
          access_token: await this.jwtService.signAsync(payload)
        }
        return userRespose
      } else {
        throw new UnauthorizedException()
      }
    } catch (error) {
      throw error
    }
  }
}
