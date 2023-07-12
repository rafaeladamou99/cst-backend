import { Module, forwardRef } from '@nestjs/common'
import { GraphsController } from './graphs.controller'
import { GraphsService } from './graphs.service'
import { MongooseModule } from '@nestjs/mongoose'
import { GraphSchema } from './graphs.model'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Graph', schema: GraphSchema }])
  ],
  controllers: [GraphsController],
  providers: [GraphsService],
  exports: [GraphsService]
})
export class GraphsModule {}
