import { createLogger, format, transports } from "winston";

export const consoleLogger = createLogger({
    level: 'info',
    format: format.combine(
        format.colorize(),
        format.simple(),
        // format.timestamp()
    ),
    transports: [
        new transports.Console(),
    ]
})

export const fileLogger = createLogger({
    level: 'info',
    format: format.combine(
        // format.colorize(),
        format.simple(),
        // format.timestamp()
    ),
    transports: [
        new transports.File({
            filename: process.env.ERR_LOG_DIR || './errors.txt'
        }),
    ]
})
