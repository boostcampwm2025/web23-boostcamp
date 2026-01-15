import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';

const env = process.env.NODE_ENV;

const levels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
};

const colors = {
  fatal: 'red',
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
};

winston.addColors(colors);

// Define the interface for the log info
interface WinstonLogInfo extends winston.Logform.TransformableInfo {
  timestamp: string;
  ms?: string;
  context?: string;
}

export const winstonOptions: WinstonModuleOptions = {
  levels: levels,
  transports: [
    new winston.transports.Console({
      level: env === 'production' ? 'info' : 'debug',
      format:
        env === 'production'
          ? winston.format.combine(
              winston.format.timestamp(),
              winston.format.json(),
            )
          : winston.format.combine(
              winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
              winston.format.ms(),
              winston.format.colorize({ all: true }),
              winston.format.printf((info) => {
                const { timestamp, level, message, context, ms } =
                  info as WinstonLogInfo;
                const yellow = '\x1b[38;5;228m';
                const reset = '\x1b[0m';
                const contextStr = context
                  ? `${yellow}[${String(context)}]${reset}`
                  : `${yellow}[Application]${reset}`;
                const msStr = ms ? `${yellow}${ms}${reset}` : '';

                return `[WEB23] ${process.pid}  - ${timestamp}  ${level} ${contextStr} ${String(message)} ${msStr}`;
              }),
            ),
    }),
  ],
};
