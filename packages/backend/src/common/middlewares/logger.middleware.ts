import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const start = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - start;
      const message = `${method} ${originalUrl} ${statusCode} - ${ip} - ${userAgent} +${duration}ms`;

      if (statusCode >= 500) {
        this.logger.error(message);
      }
      if (statusCode >= 400 && statusCode < 500) {
        this.logger.warn(message);
      }
      if (statusCode >= 200 && statusCode < 400) {
        this.logger.log(message);
      }
    });

    next();
  }
}
