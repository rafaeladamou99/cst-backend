import * as mongoose from 'mongoose'

const bcrypt = require('bcrypt')

export const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, unique: true },
  password: { type: String, required: true },
  calculations: { type: [String], required: true }
})

export interface User extends mongoose.Document {
  id: string
  email: string
  password: string
  calculations: string[]
}

UserSchema.pre('save', async function (next) {
  try {
    if (this.isModified('password')) {
      const salt = await bcrypt.genSalt(12)
      const hashedPassword = await bcrypt.hash(this.password, salt)
      this.password = hashedPassword
    }
    next()
  } catch (error) {
    next(error)
  }
})
