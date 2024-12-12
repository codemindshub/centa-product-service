import {consoleLogger, fileLogger} from "../utils/logger.js";

export const loggerMiddleware = (req, res, next) => {
    const { method, url } = req; 
    const start = new Date()

    res.on('finish', () => {
        const { statusCode } = res;
        if (statusCode.toString().startsWith('2')) {
            consoleLogger.info(`${new Date().toLocaleString()} ${method.toUpperCase()} ${url.toUpperCase()} ${statusCode} ${(Date.now() - start) / 1000}s`)
        } else if (statusCode.toString().startsWith('5')) {
            consoleLogger.error(`${new Date().toLocaleString()} ${method.toUpperCase()} ${url.toUpperCase()} ${statusCode} ${(Date.now() - start) / 1000}s`)
            fileLogger.error(`${new Date().toLocaleString()} ${method.toUpperCase()} ${url.toUpperCase()} ${statusCode} ${(Date.now() - start) / 1000}s`)
        } else {
            consoleLogger.warn(`${new Date().toLocaleString()} ${method.toUpperCase()} ${url.toUpperCase()} ${statusCode} ${(Date.now() - start) / 1000}s`)
            fileLogger.warn(`${new Date().toLocaleString()} ${method.toUpperCase()} ${url.toUpperCase()} ${statusCode} ${(Date.now() - start) / 1000}s`)
        }
    })
    next();
}