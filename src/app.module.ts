import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { CalculationsModule } from './calculations/calculations.module'
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GraphsModule } from './graphs/graphs.module';
import { SpanningtreesModule } from './spanningtrees/spanningtrees.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URL')
      }),
      inject: [ConfigService]
    }),
    CalculationsModule,
    AuthModule,
    UsersModule,
    GraphsModule,
    SpanningtreesModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
