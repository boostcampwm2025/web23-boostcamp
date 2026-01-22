import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import { winstonOptions } from './common/logger/winston.config';

import { SeedService } from './seed/seed.service';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonOptions),
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  // 개발 환경 등에서 자동 시딩 실행
  const seedService = app.get(SeedService);
  await seedService.seed();

  //도메인 발급 받으면 수정 필요.
  app.enableCors();
  await app.listen(process.env.PORT ?? 8000);
}
bootstrap().catch((err) => {
  const logger = WinstonModule.createLogger(winstonOptions);
  if (logger.fatal) {
    logger.fatal(err);
  } else {
    logger.error(err);
  }
  process.exit(1);
});
