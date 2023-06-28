import { createLogger, transports, format, Logger } from 'winston'
import { injectable } from 'inversify'

@injectable()
export default class LLogger {
  private logger: Logger

  constructor() {
    this.logger = createLogger({
      defaultMeta: { service: 'dia-oracle' },
      exitOnError: false,
      format: format.combine(
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
      ),
      transports: [
        new transports.Console({
          handleExceptions: true,
          format: format.combine(
            format.colorize(),
            format.printf(info => {
              const { timestamp, level, message, stack } = info
              return `${timestamp} ${level}:\n${message} ${stack || ''}`
            })
          )
        })
      ]
    })
  }

  public getLogger() {
    return this.logger
  }

  public error(message: string, ...args: any[]) {
    this.logger.error(message, ...args)
  }

  public info(message: string, ...args: any[]) {
    this.logger.info(message, ...args)
  }

  public debug(message: string, ...args: any[]) {
    this.logger.debug(message, ...args)
  }

  public warning(message: string, ...args: any[]) {
    this.logger.warning(message, ...args)
  }
}
