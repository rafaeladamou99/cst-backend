import * as mongoose from 'mongoose'

export const SpanningTreeSchema = new mongoose.Schema({
  spanningTree: { type: [[Number]], required: true },
  next: { type: String, required: false },
  ownerId: { type: String, required: true },
})

export interface SpanningTree extends mongoose.Document {
  id: string
  spanningTree: number[][]
  next?: string
  ownerId: string
}
