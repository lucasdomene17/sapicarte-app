import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  constructor() { }

  /**
   * Log de información general
   */
  log(message: any, ...optionalParams: any[]): void {
    if (environment.enableLogs) {
      console.log(message, ...optionalParams);
    }
  }

  /**
   * Log de errores
   */
  error(message: any, ...optionalParams: any[]): void {
    if (environment.enableLogs) {
      console.error(message, ...optionalParams);
    }
  }

  /**
   * Log de advertencias
   */
  warn(message: any, ...optionalParams: any[]): void {
    if (environment.enableLogs) {
      console.warn(message, ...optionalParams);
    }
  }

  /**
   * Log de información detallada
   */
  info(message: any, ...optionalParams: any[]): void {
    if (environment.enableLogs) {
      console.info(message, ...optionalParams);
    }
  }

  /**
   * Log de debug
   */
  debug(message: any, ...optionalParams: any[]): void {
    if (environment.enableLogs) {
      console.debug(message, ...optionalParams);
    }
  }

  /**
   * Log de tabla
   */
  table(data: any): void {
    if (environment.enableLogs) {
      console.table(data);
    }
  }

  /**
   * Log de grupo
   */
  group(label: string): void {
    if (environment.enableLogs) {
      console.group(label);
    }
  }

  /**
   * Cerrar grupo de logs
   */
  groupEnd(): void {
    if (environment.enableLogs) {
      console.groupEnd();
    }
  }

  /**
   * Log con tiempo
   */
  time(label: string): void {
    if (environment.enableLogs) {
      console.time(label);
    }
  }

  /**
   * Finalizar log con tiempo
   */
  timeEnd(label: string): void {
    if (environment.enableLogs) {
      console.timeEnd(label);
    }
  }
}
