import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query
} from '@nestjs/common'
import { CalculationsService } from './calculations.service'
import { ConstraintsType } from './calculations.constraints'

@Controller('calculations')
export class CalculationsController {
  constructor(private readonly calculationsService: CalculationsService) {}

  @Post()
  async addCalculation(
    @Body('title') calcTitle: string,
    @Body('description') calcDesc: string,
    @Body('graph') calcGraph: number[][],
    @Body('constraint') calcConstraint: ConstraintsType,
    @Body('constraintAmount') calcConstraintAmount: number = undefined,
    @Headers('authorization') authorization: string
  ) {
    const token = authorization.replace('Bearer ', '')
    const generatedId = await this.calculationsService.insertCalculation(
      calcTitle,
      calcDesc,
      calcGraph,
      calcConstraint,
      calcConstraintAmount,
      token
    )
    return { id: generatedId }
  }

  @Patch(':id')
  async addSpanningTree(
    @Param('id') calcId: string,
    @Body('constraint') calcConstraint: ConstraintsType,
    @Body('constraintAmount') calcConstraintAmount: number = undefined,
    @Headers('authorization') authorization: string
  ) {
    const token = authorization.replace('Bearer ', '')
    const generatedId = await this.calculationsService.insertSpanningTree(
      calcId,
      calcConstraint,
      calcConstraintAmount,
      token
    )
    return { id: generatedId }
  }

  @Get('generateGraph')
  generateGraph(
    @Query('graphSize') graphSize: number,
    @Query('maxWeight') maxWeight: number
  ) {
    return this.calculationsService.generateWeightedGraph(graphSize, maxWeight)
  }

  @Get()
  async getAllCalculations(@Headers('authorization') authorization: string) {
    const token = authorization.replace('Bearer ', '')
    const calculations = await this.calculationsService.getCalculations(token)
    return calculations
  }

  @Get(':id')
  getCalculation(
    @Param('id') calcId: string,
    @Headers('authorization') authorization: string
  ) {
    const token = authorization.replace('Bearer ', '')
    return this.calculationsService.getSingleCalculation(token, calcId)
  }

  // @Patch(':id')
  // async updateCalculation(
  //   @Param('id') calcId: string,
  //   @Body('title') calcTitle: string,
  //   @Body('description') calcDesc: string,
  //   @Body('price') calcPrice: number
  // ) {
  //   await this.calculationsService.updateCalculation(
  //     calcId,
  //     calcTitle,
  //     calcDesc,
  //     calcPrice
  //   )
  //   return null
  // }

  @Delete(':id')
  async removeCalculation(@Param('id') calcId: string) {
    await this.calculationsService.deleteCalculation(calcId)
    return null
  }
}
