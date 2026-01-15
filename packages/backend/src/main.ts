import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import { winstonOptions } from './common/logger/winston.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonOptions),
  });
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
