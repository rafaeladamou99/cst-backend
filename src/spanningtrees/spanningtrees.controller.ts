import { Controller, Get, Headers, Param } from '@nestjs/common'
import { SpanningtreesService } from './spanningtrees.service'

@Controller('spanningtrees')
export class SpanningtreesController {
  constructor(private readonly spanningtreesService: SpanningtreesService) {}

  @Get(':id')
  async getSpanningTree(
    @Param('id') spanningTreeId: string,
    @Headers('authorization') authorization: string
  ) {
    const token = authorization.replace('Bearer ', '')
    return this.spanningtreesService.getSpanningTree(spanningTreeId, token)
  }
}
