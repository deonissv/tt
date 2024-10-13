/* eslint-disable @typescript-eslint/no-unsafe-argument */
export type LogLevel = 'log' | 'error' | 'warn' | 'debug' | 'verbose' | 'fatal';
export interface ILogger {
  log(message: any, ...optionalParams: any[]): any;
  error(message: any, ...optionalParams: any[]): any;
  warn(message: any, ...optionalParams: any[]): any;
  debug?(message: any, ...optionalParams: any[]): any;
  verbose?(message: any, ...optionalParams: any[]): any;
  fatal?(message: any, ...optionalParams: any[]): any;
  setLogLevels?(levels: LogLevel[]): any;
}

class LoggerProxy implements ILogger {
  logger: ILogger;

  register(logger: ILogger) {
    this.logger = logger;
  }

  log(...args: any[]) {
    this.logger?.log(args[0], ...args.slice(1));
  }

  error(...args: any[]) {
    this.logger?.error(args[0], ...args.slice(1));
  }

  warn(...args: any[]) {
    this.logger?.warn(args[0], ...args.slice(1));
  }

  debug(...args: any[]) {
    this.logger?.debug?.(args[0], ...args.slice(1));
  }

  verbose(...args: any[]) {
    this.logger?.verbose?.(args[0], ...args.slice(1));
  }

  fatal(...args: any[]) {
    this.logger?.fatal?.(args[0], ...args.slice(1));
  }

  setLogLevels(levels: LogLevel[]) {
    this.logger?.setLogLevels?.(levels);
  }
}

export const Logger = new LoggerProxy();
