import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common'

import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Calculation, SpanningTree } from './calculations.model'
import { Constraints, ConstraintsType } from './calculations.constraints'
import { MaximumDegree } from './Algorithms/maximumDegree'
import { MaximumDegreeV2 } from './Algorithms/maximumDegreev2'
import { MaximumDepth } from './Algorithms/maximumDepth'
import { MaximumDepthV2 } from './Algorithms/maximumDepthv2'
import { kruskalMST } from './Algorithms/kruskalMST'
import { MaximumLeaves } from './Algorithms/maximumLeaves'
import { PrimsMST } from './Algorithms/primsMST'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from 'src/users/users.service'
import {
  generateWeightedGraph,
  generateWeightedGraph2
} from './Algorithms/graphGenerator'
import { SpanningtreesService } from 'src/spanningtrees/spanningtrees.service'
import { GraphsService } from 'src/graphs/graphs.service'

@Injectable()
export class CalculationsService {
  constructor(
    @InjectModel('Calculation')
    private readonly calculationModel: Model<Calculation>,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly graphsService: GraphsService,
    private readonly spanningTreesService: SpanningtreesService
  ) {}

  private calculationStrategy(
    graph: number[][],
    constraint: string,
    constraintAmount: number
  ) {
    switch (constraint) {
      case Constraints.Degree:
        return MaximumDegree(graph, constraintAmount)
        break
      case Constraints.DegreeV2:
        return MaximumDegreeV2(graph, constraintAmount)
      case Constraints.Depth:
        return MaximumDepth(graph, constraintAmount)
        break
      case Constraints.DepthV2:
        return MaximumDepthV2(graph, constraintAmount)
        break
      case Constraints.Kruskal:
        return kruskalMST(graph)
        break
      case Constraints.Prims:
        return PrimsMST(graph)
        break
      case Constraints.Leaves:
        return MaximumLeaves(graph, constraintAmount)
        break
      default:
        throw new NotFoundException('Constraint type not supported.')
    }
  }

  generateWeightedGraph(graphSize: number, maxWeight: number) {
    return generateWeightedGraph2(graphSize, maxWeight)
  }

  isSquareSymmetricGraph(graph: number[][]): boolean {
    const rows = graph.length

    if (graph.some((row) => row.length !== rows)) {
      return false
    }

    for (let i = 0; i < rows - 1; i++) {
      for (let j = i + 1; j < rows; j++) {
        if (graph[i][j] !== graph[j][i]) {
          return false // Not symmetric
        }
      }
    }

    return true // Square and symmetric graph
  }

  async insertCalculation(
    title: string,
    description: string,
    graph: number[][],
    constraint: ConstraintsType,
    constraintAmount: number,
    token: string
  ) {
    type NumberArrayArray = number[][]
    if (
      Array.isArray(graph) &&
      graph.every(
        (row) =>
          Array.isArray(row) && row.every((value) => typeof value === 'number')
      )
    ) {
      const myCustomVariable: NumberArrayArray = graph as NumberArrayArray
    } else {
      if (typeof graph === 'string') {
        try {
          graph = JSON.parse(graph).map((row) => row.map(Number))
        } catch (error) {
          throw new BadRequestException('Invalid Graph')
        }
      } else if (
        Array.isArray(graph) &&
        graph.every(
          (row) =>
            Array.isArray(row) &&
            row.every(
              (value) => typeof value === 'string' || typeof value === 'number'
            )
        )
      ) {
        try {
          graph = graph.map((row) => row.map(Number))
        } catch (error) {
          throw new BadRequestException('Invalid Graph')
        }
      } else {
        throw new BadRequestException('Invalid Graph')
      }
    }

    if (!this.isSquareSymmetricGraph(graph)) {
      throw new BadRequestException('Invalid Graph')
    }

    const decodedToken = this.jwtService.verify(token)
    const userId = decodedToken.id
    let spanningTree: number[][]
    let weightSum: number
    let isMSTPossible: boolean = false
    let startTime = 0
    let elapsedTime = 0
    try {
      startTime = Date.now()
      ;[spanningTree, weightSum, isMSTPossible] = this.calculationStrategy(
        graph,
        constraint,
        constraintAmount
      )
      elapsedTime = Date.now() - startTime
    } catch (error) {
      throw error
    }
    if (isMSTPossible) {
      const graphId = await this.graphsService.insertGraph(graph, userId)
      const spanningTreeId = await this.spanningTreesService.insertSpanningTree(
        spanningTree,
        userId
      )

      const spanningTreeObject: SpanningTree = {
        spanningTree: spanningTreeId,
        weightSum,
        constraint,
        constraintAmount,
        elapsedTime
      }
      if (
        spanningTreeObject.constraint === 'kruskal' ||
        spanningTreeObject.constraint === 'prims'
      ) {
        delete spanningTreeObject.constraintAmount
      }

      const newCalculation = new this.calculationModel({
        title,
        description,
        graph: graphId,
        spanningTrees: [spanningTreeObject],
        ownerId: userId
      })
      try {
        const result = await newCalculation.save()
        await this.usersService.addCalculation(userId, result.id)
      } catch (error) {
        throw error
      }
    } else {
      throw new NotFoundException(
        'Could not calculate a spanning tree with the given constraints'
      )
    }
  }

  async insertSpanningTree(
    calculationId: string,
    constraint: ConstraintsType,
    constraintAmount: number,
    token: string
  ) {
    const decodedToken = this.jwtService.verify(token)
    const userId = decodedToken.id
    const user = await this.usersService.getUserById(userId)
    const calculationExistsOnUser = user.calculations.find(
      (calc) => calc === calculationId
    )
    if (!calculationExistsOnUser) {
      throw new NotFoundException(
        'Could not find calculation in users calculations.'
      )
    }
    // get calculation from DB with true to flag as internal call
    const calculation = await this.findCalculation(calculationId)
    if (calculation.ownerId !== userId) {
      throw new UnauthorizedException(
        'You are not the owner of this calculation'
      )
    }
    if (
      calculation.spanningTrees.some(
        (mst) =>
          (mst.constraint === constraint &&
            mst.constraintAmount === constraintAmount) ||
          (mst.constraint === constraint &&
            (constraint === 'kruskal' || constraint === 'prims'))
      )
    ) {
      throw new UnauthorizedException(
        'You are not able to calculate a constrained spanning Tree with the same constraint'
      )
    }
    const graph = await this.graphsService.getGraph(calculation.graph, token)

    let spanningTree: number[][]
    let weightSum: number
    let isMSTPossible: boolean = false
    let startTime = 0
    let elapsedTime = 0
    try {
      startTime = Date.now()
      ;[spanningTree, weightSum, isMSTPossible] = this.calculationStrategy(
        graph,
        constraint,
        constraintAmount
      )
      elapsedTime = Date.now() - startTime
      console.log('graph calculated')
    } catch (error) {
      throw error
    }
    if (isMSTPossible) {
      const spanningTreeId = await this.spanningTreesService.insertSpanningTree(
        spanningTree,
        userId
      )

      const spanningTreeObject: SpanningTree = {
        spanningTree: spanningTreeId,
        constraint,
        constraintAmount,
        weightSum,
        elapsedTime
      }
      if (
        spanningTreeObject.constraint === 'kruskal' ||
        spanningTreeObject.constraint === 'prims'
      ) {
        delete spanningTreeObject.constraintAmount
      }
      calculation.spanningTrees.push(spanningTreeObject)
      try {
        await calculation.save()
      } catch (error) {
        throw error
      }
    } else {
      throw new NotFoundException(
        'Could not calculate a spanning tree with the given constraints'
      )
    }
  }

  async getCalculations(token: string) {
    try {
      const decodedToken = this.jwtService.verify(token)
      const userId = decodedToken.id
      const user = await this.usersService.getUserById(userId)
      const calculationsIds = user.calculations.reverse()
      const calculations = await this.calculationModel
        .find({ _id: { $in: calculationsIds } })
        .exec()
      return calculations.map((calc) => ({
        id: calc.id,
        title: calc.title,
        description: calc.description,
        graph: calc.graph,
        spanningTrees: calc.spanningTrees,
        isOwner: calc.ownerId === userId
      }))
    } catch (error) {
      throw new InternalServerErrorException('Something went wrong.')
    }
  }

  async getSingleCalculation(token: string, calculationId: string) {
    const decodedToken = this.jwtService.verify(token)
    const userId = decodedToken.id
    const user = await this.usersService.getUserById(userId)
    const calculationExistsOnUser = user.calculations.find(
      (calc) => calc === calculationId
    )
    if (!calculationExistsOnUser) {
      throw new NotFoundException(
        'Could not find calculation in users calculations.'
      )
    }
    const calculation: Calculation = await this.findCalculation(calculationId)
    return {
      id: calculation.id,
      title: calculation.title,
      description: calculation.description,
      graph: calculation.graph,
      spanningTrees: calculation.spanningTrees,
      isOwner: calculation.ownerId === userId
    }
  }

  async updateCalculation(
    calculationId: string,
    title: string,
    desc: string,
    weightSum: number
  ) {
    const updatedCalculation = await this.findCalculation(calculationId)
    if (title) {
      updatedCalculation.title = title
    }
    if (desc) {
      updatedCalculation.description = desc
    }
    updatedCalculation.save()
  }

  private async findCalculation(id: string): Promise<Calculation> {
    let calculation
    try {
      calculation = await this.calculationModel.findById(id).exec()
    } catch (error) {
      throw new NotFoundException('Could not find id.')
    }
    if (!calculation) {
      throw new NotFoundException('Could not find id.')
    }
    return calculation
  }

  async deleteCalculation(id: string) {
    const result = await this.calculationModel.deleteOne({ _id: id }).exec()
    if (result.deletedCount === 0) {
      throw new NotFoundException('Could not find calculation')
    }
  }
}
