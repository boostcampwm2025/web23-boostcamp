import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { AuthModule } from './auth/auth.module';
import { DocumentModule } from './document/document.module';
import { InterviewModule } from './interview/interview.module';
import { UserModule } from './user/user.module';
import { SeedModule } from './seed/seed.module';
import { HealthModule } from './health/health.module';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';
import { winstonOptions } from './common/logger/winston.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
    }),
    WinstonModule.forRoot(winstonOptions),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize:
          process.env.NODE_ENV === 'local' || process.env.NODE_ENV === 'test',
        dropSchema:
          process.env.NODE_ENV === 'local' || process.env.NODE_ENV === 'test',
        logging: true,
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        migrationsRun:
          process.env.NODE_ENV === 'local' ||
          process.env.NODE_ENV === 'development',
      }),
    }),
    UserModule,
    AuthModule,
    DocumentModule,
    InterviewModule,
    SeedModule,
    HealthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
