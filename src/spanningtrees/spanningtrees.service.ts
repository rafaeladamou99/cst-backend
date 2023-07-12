import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { SpanningTree } from './spanningtrees.model'
import { Model } from 'mongoose'
import { JwtService } from '@nestjs/jwt'

const BSON = require('bson')
const SIZE_LIMIT = 16000000

@Injectable()
export class SpanningtreesService {
  constructor(
    @InjectModel('SpanningTree')
    private readonly spanningTreeModel: Model<SpanningTree>,
    private readonly jwtService: JwtService
  ) {}

  private getMatrixSize(matrix: number[][]) {
    const sizeInBytes = BSON.calculateObjectSize(matrix)
    // const sizeInBytes = Buffer.byteLength(jsonString, 'utf8')
    return sizeInBytes
  }

  async insertSpanningTree(
    spanningTree: number[][],
    ownerId: string,
    next: string = undefined
  ) {
    const spanningTreeSize = this.getMatrixSize(spanningTree)
    const partitions = Math.ceil(spanningTreeSize / SIZE_LIMIT)
    if (partitions === 1) {
      const newSpanningTree = new this.spanningTreeModel({
        spanningTree,
        ownerId,
        next
      })
      try {
        const result = await newSpanningTree.save()
        return result.id.toString()
      } catch (error) {
        console.log(error)
      }
    } else {
      const nodesAmount = spanningTree.length
      let stepSize = Math.floor(nodesAmount / partitions)
      let start = nodesAmount - stepSize
      let end = nodesAmount
      let nextPart = undefined
      do {
        if (nextPart) {
          start = start > stepSize ? start - stepSize : 0
          end = end - stepSize
        }
        const arr = spanningTree.slice(start, end)
        nextPart = await this.insertSpanningTree(arr, ownerId, nextPart)
      } while (start > 0)
      return nextPart
    }
  }

  async getSpanningTree(spanningTreeId: string, token: string) {
    const decodedToken = this.jwtService.verify(token)
    const userId = decodedToken.id
    let spanningTree: number[][] = []
    let tempId = spanningTreeId
    do {
      let spanningTreePart
      try {
        spanningTreePart = await this.spanningTreeModel.findById(tempId).exec()
        if (spanningTreePart.ownerId !== userId) {
          throw new UnauthorizedException('This does not belong to you')
        }
        spanningTree.push(...spanningTreePart.spanningTree)
        tempId = spanningTreePart?.next
      } catch {
        throw new InternalServerErrorException('Error')
      }
      if (!spanningTreePart) {
        throw new NotFoundException('Could not find user')
      }
    } while (tempId)
    return spanningTree
  }
}
