import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Graph } from './graphs.model'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from 'src/users/users.service'

const BSON = require('bson')
const SIZE_LIMIT = 16000000

@Injectable()
export class GraphsService {
  constructor(
    @InjectModel('Graph')
    private readonly graphModel: Model<Graph>,
    private readonly jwtService: JwtService
  ) {}

  private getMatrixSize(matrix: number[][]) {
    const sizeInBytes = BSON.calculateObjectSize(matrix)
    // const sizeInBytes = Buffer.byteLength(jsonString, 'utf8')
    return sizeInBytes
  }

  async insertGraph(
    graph: number[][],
    ownerId: string,
    next: string = undefined
  ) {
    const graphSize = this.getMatrixSize(graph)
    console.log(graphSize)
    const partitions = Math.ceil(graphSize / SIZE_LIMIT)
    if (partitions === 1) {
      const newGraph = new this.graphModel({
        graph,
        ownerId,
        next
      })
      try {
        const result = await newGraph.save()
        return result.id.toString()
      } catch (error) {
        console.log(error)
      }
    } else {
      const nodesAmount = graph.length
      let stepSize = Math.floor(nodesAmount / partitions)
      let start = nodesAmount - stepSize
      let end = nodesAmount
      let nextPart = undefined
      do {
        if (nextPart) {
          start = start > stepSize ? start - stepSize : 0
          end = end - stepSize
        }
        const arr = graph.slice(start, end)
        nextPart = await this.insertGraph(arr, ownerId, nextPart)
      } while (start > 0)
      return nextPart
    }
  }

  async getGraph(graphId: string, token: string) {
    const decodedToken = this.jwtService.verify(token)
    const userId = decodedToken.id
    let graph: number[][] = []
    let tempId = graphId
    do {
      let graphPart
      try {
        graphPart = await this.graphModel.findById(tempId).exec()
        if (graphPart.ownerId !== userId) {
          throw new UnauthorizedException('This does not belong to you')
        }
        graph.push(...graphPart.graph)
        tempId = graphPart?.next
      } catch {
        throw new InternalServerErrorException('Error')
      }
      if (!graphPart) {
        throw new NotFoundException('Could not find user')
      }
    } while (tempId)
    return graph
  }
}
