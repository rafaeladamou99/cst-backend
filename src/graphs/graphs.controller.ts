import { Controller, Get, Headers, Param } from '@nestjs/common'
import { GraphsService } from './graphs.service'

@Controller('graphs')
export class GraphsController {
  constructor(private readonly graphsService: GraphsService) {}

  @Get(':id')
  async getGraph(
    @Param('id') graphId: string,
    @Headers('authorization') authorization: string
  ) {
    const token = authorization.replace('Bearer ', '')
    return this.graphsService.getGraph(graphId, token)
  }
}
