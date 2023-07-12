import * as mongoose from 'mongoose'

export const GraphSchema = new mongoose.Schema({
  graph: { type: [[Number]], required: true },
  next: { type: String, required: false },
  ownerId: { type: String, required: true }
})

export interface Graph extends mongoose.Document {
  id: string
  graph: number[][]
  next?: string
  ownerId: string
}
