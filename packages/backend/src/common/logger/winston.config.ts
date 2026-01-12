import { utilities, WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';

const env = process.env.NODE_ENV;

export const winstonOptions: WinstonModuleOptions = {
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
                        winston.format.timestamp(),
                        winston.format.ms(),
                        utilities.format.nestLike('WEB23', {
                            colors: true,
                            prettyPrint: true,
                        }),
                    ),
        }),
    ],
};
