import * as mongoose from 'mongoose'

export const CalculationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  graph: { type: String, required: true },
  spanningTrees: {
    type: [
      {
        spanningTree: String,
        weightSum: Number,
        constraint: String,
        constraintAmount: Number,
        elapsedTime: Number
      }
    ],
    required: true
  },
  ownerId: { type: String, required: true }
})

export type SpanningTree = {
  spanningTree: string
  weightSum: number
  constraint: string
  constraintAmount: number
  elapsedTime: number
}

export interface Calculation extends mongoose.Document {
  id: string
  title: string
  description: string
  graph: string
  spanningTrees: SpanningTree[]
  ownerId: string
}
