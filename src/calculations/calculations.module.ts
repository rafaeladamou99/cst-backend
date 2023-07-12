import { Module, forwardRef } from '@nestjs/common'

import { CalculationsController } from './calculations.controller'
import { CalculationsService } from './calculations.service'
import { MongooseModule } from '@nestjs/mongoose'
import { CalculationSchema } from './calculations.model'
import { UsersModule } from 'src/users/users.module'
import { GraphsModule } from 'src/graphs/graphs.module'
import { SpanningtreesModule } from 'src/spanningtrees/spanningtrees.module'

@Module({
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => GraphsModule),
    forwardRef(() => SpanningtreesModule),
    MongooseModule.forFeature([
      { name: 'Calculation', schema: CalculationSchema }
    ])
  ],
  controllers: [CalculationsController],
  providers: [CalculationsService]
})
export class CalculationsModule {}
