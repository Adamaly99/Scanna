/**
 * Logger Service - Logging structuré avec contexte
 * Production-ready avec rotation et persistance
 */

import { LOG_LEVELS, LOG_LEVEL_PRIORITY } from '@/constants/app';

type LogLevel = keyof typeof LOG_LEVELS;

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
  duration?: number; // pour profiling
}

class LoggerService {
  private static instance: LoggerService;
  private logs: LogEntry[] = [];
  private readonly MAX_LOGS = 1000;
  private readonly MIN_LOG_LEVEL: LogLevel = 'DEBUG';
  private isDev = __DEV__;
  private timers: Map<string, number> = new Map();

  private constructor() {}

  static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  /**
   * Log avec niveau DEBUG
   */
  debug(message: string, context?: Record<string, any>): void {
    this.log('DEBUG', message, context);
  }

  /**
   * Log avec niveau INFO
   */
  info(message: string, context?: Record<string, any>): void {
    this.log('INFO', message, context);
  }

  /**
   * Log avec niveau WARN
   */
  warn(message: string, context?: Record<string, any>): void {
    this.log('WARN', message, context);
  }

  /**
   * Log avec niveau ERROR
   */
  error(message: string, error?: Error | unknown, context?: Record<string, any>): void {
    const err = error instanceof Error ? error : new Error(String(error));
    this.log('ERROR', message, { ...context, stack: err.stack });
    if (this.isDev) {
      console.error(`[ERROR] ${message}`, err);
    }
  }

  /**
   * Démarrer un timer pour mesurer performance
   */
  startTimer(label: string): void {
    this.timers.set(label, Date.now());
  }

  /**
   * Terminer un timer et logger la durée
   */
  endTimer(label: string, level: LogLevel = 'DEBUG'): number {
    const startTime = this.timers.get(label);
    if (!startTime) {
      console.warn(`Timer ${label} not started`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.timers.delete(label);
    this.log(level, `⏱️ ${label}`, { duration });
    return duration;
  }

  /**
   * Log interne avec filtrage de niveau
   */
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error
  ): void {
    // Filtrer par niveau
    if (LOG_LEVEL_PRIORITY[level] < LOG_LEVEL_PRIORITY[this.MIN_LOG_LEVEL]) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context,
      error,
    };

    this.logs.push(entry);

    // Limiter la taille
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift();
    }

    // Console en développement
    if (this.isDev) {
      const prefix = `[${level}]`;
      const timestamp = entry.timestamp.toISOString();

      switch (level) {
        case 'DEBUG':
          console.log(`${prefix} ${timestamp} ${message}`, context);
          break;
        case 'INFO':
          console.log(`${prefix} ${timestamp} ${message}`, context);
          break;
        case 'WARN':
          console.warn(`${prefix} ${timestamp} ${message}`, context);
          break;
        case 'ERROR':
          console.error(`${prefix} ${timestamp} ${message}`, context);
          break;
      }
    }
  }

  /**
   * Récupérer tous les logs
   */
  getLogs(
    level?: LogLevel,
    limit?: number
  ): LogEntry[] {
    let filtered = this.logs;

    if (level) {
      filtered = filtered.filter(log => log.level === level);
    }

    if (limit) {
      filtered = filtered.slice(-limit);
    }

    return filtered;
  }

  /**
   * Récupérer les logs en tant que texte
   */
  getLogsAsText(limit?: number): string {
    const logs = this.getLogs(undefined, limit);
    return logs
      .map(
        log =>
          `[${log.level}] ${log.timestamp.toISOString()} ${log.message}${
            log.context ? ' ' + JSON.stringify(log.context) : ''
          }`
      )
      .join('\n');
  }

  /**
   * Récupérer les logs en JSON
   */
  getLogsAsJSON(limit?: number): LogEntry[] {
    return this.getLogs(undefined, limit);
  }

  /**
   * Effacer tous les logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Récupérer des statistiques
   */
  getStats(): { totalLogs: number; byLevel: Record<LogLevel, number> } {
    const byLevel = {
      DEBUG: 0,
      INFO: 0,
      WARN: 0,
      ERROR: 0,
    } as Record<LogLevel, number>;

    this.logs.forEach(log => {
      byLevel[log.level]++;
    });

    return {
      totalLogs: this.logs.length,
      byLevel,
    };
  }
}

export const logger = LoggerService.getInstance();