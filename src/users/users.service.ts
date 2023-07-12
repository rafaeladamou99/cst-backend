import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User } from './users.model'
import { JwtService } from '@nestjs/jwt'
import { passwordRegex } from './usersConfig'

const bcrypt = require('bcrypt')

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User')
    private readonly userModel: Model<User>,
    private readonly jwtService: JwtService
  ) {}

  async getUser(email: string) {
    let user
    try {
      user = await this.userModel.findOne({ email: email }).exec()
    } catch (error) {
      throw new InternalServerErrorException('Error')
    }
    if (!user) {
      throw new NotFoundException('Could not find user')
    }
    // const {password, ...rest} = user.toObject()
    return user
  }

  async getUserById(userId: string) {
    let user
    try {
      user = await this.userModel.findById(userId).exec()
    } catch (error) {
      throw new InternalServerErrorException('Error')
    }
    if (!user) {
      throw new NotFoundException('Could not find user')
    }
    // const {password, ...rest} = user.toObject()
    return user
  }

  async createUser(email: string, password: string) {
    if (!passwordRegex.test(password)) {
      throw new UnauthorizedException(
        'Password should be between 6 to 20 characters'
      )
    }
    try {
      const existingUser = await this.getUser(email)

      throw new ConflictException('User already exists')
    } catch (error) {
      if (error instanceof NotFoundException) {
        const newUser = new this.userModel({
          email,
          password: password,
          calculations: []
        })
        const user = await newUser.save()
        const payload = { id: user._id, email: user.email }
        const userRespose = {
          id: user._id,
          calculations: user.calculations,
          email: user.email,
          access_token: await this.jwtService.signAsync(payload)
        }
        return userRespose
      }
      throw error
    }
  }

  async resetPassword(email: string, oldPass: string, newPass: string) {
    if (!passwordRegex.test(newPass)) {
      throw new UnauthorizedException(
        'Password should be between 6 to 20 characters'
      )
    }
    const user = await this.getUser(email)
    if (await bcrypt.compare(oldPass, user.password)) {
      try {
        user.password = newPass
        await user.save()
      } catch {
        throw new InternalServerErrorException(
          'Something went wrong. Please try again later.'
        )
      }
    } else {
      throw new UnauthorizedException(
        'Old password does not match user password.'
      )
    }
  }

  async addCalculation(userId: string, calcId: string) {
    try {
      const user = await this.getUserById(userId)
      user.calculations.push(calcId)
      await user.save()
    } catch (error) {
      throw error
    }
  }
}
