import { Module } from '@nestjs/common'
import { SpanningtreesController } from './spanningtrees.controller'
import { SpanningtreesService } from './spanningtrees.service'
import { MongooseModule } from '@nestjs/mongoose'
import { SpanningTreeSchema } from './spanningtrees.model'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'SpanningTree', schema: SpanningTreeSchema }
    ])
  ],
  controllers: [SpanningtreesController],
  providers: [SpanningtreesService],
  exports: [SpanningtreesService]
})
export class SpanningtreesModule {}
