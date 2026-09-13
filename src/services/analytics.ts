import { logger } from './logger';

/**
 * Analytics Service - Monitoring & Tracking
 * 
 * Phase 3: Integration with Sentry
 * Also supports: Google Analytics, Mixpanel, Amplitude
 * 
 * Install: npm install @sentry/react-native
 */

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: Date;
}

interface PerformanceMetric {
  name: string;
  duration: number;
  metadata?: Record<string, any>;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private events: AnalyticsEvent[] = [];
  private metrics: PerformanceMetric[] = [];

  private constructor() {}

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Initialize analytics
   * Set Sentry DSN here
   */
  async initialize(sentryDsn?: string): Promise<void> {
    try {
      if (sentryDsn) {
        // TODO: Initialize Sentry
        // import * as Sentry from '@sentry/react-native';
        // Sentry.init({ dsn: sentryDsn });
      }

      logger.info('Analytics service initialized');
    } catch (error) {
      logger.error('Analytics initialization failed', error);
    }
  }

  /**
   * Track custom event
   */
  trackEvent(
    name: string,
    properties?: Record<string, any>
  ): void {
    try {
      const event: AnalyticsEvent = {
        name,
        properties,
        timestamp: new Date(),
      };

      this.events.push(event);

      // TODO: Send to Sentry
      // Sentry.captureMessage(name, 'info', { extra: properties });

      logger.debug('Event tracked', { name, properties });
    } catch (error) {
      logger.error('Failed to track event', error);
    }
  }

  /**
   * Track error
   */
  trackError(error: Error, context?: Record<string, any>): void {
    try {
      logger.error('Error tracked', error);

      // TODO: Send to Sentry
      // Sentry.captureException(error, { extra: context });
    } catch (err) {
      logger.error('Failed to track error', err);
    }
  }

  /**
   * Track performance metric
   */
  trackMetric(
    name: string,
    duration: number,
    metadata?: Record<string, any>
  ): void {
    try {
      const metric: PerformanceMetric = {
        name,
        duration,
        metadata,
      };

      this.metrics.push(metric);

      logger.debug('Metric tracked', { name, duration, metadata });

      // TODO: Send to Sentry
      // Sentry.captureMessage(`${name}: ${duration}ms`, 'info');
    } catch (error) {
      logger.error('Failed to track metric', error);
    }
  }

  /**
   * Get events
   */
  getEvents(limit = 100): AnalyticsEvent[] {
    return this.events.slice(-limit);
  }

  /**
   * Get metrics
   */
  getMetrics(limit = 100): PerformanceMetric[] {
    return this.metrics.slice(-limit);
  }

  /**
   * Set user context
   */
  setUserContext(userId: string, properties?: Record<string, any>): void {
    try {
      // TODO: Send to Sentry
      // Sentry.setUser({ id: userId, ...properties });

      logger.debug('User context set', { userId });
    } catch (error) {
      logger.error('Failed to set user context', error);
    }
  }

  /**
   * Clear all events and metrics
   */
  clear(): void {
    this.events = [];
    this.metrics = [];
    logger.debug('Analytics data cleared');
  }
}

export const analytics = AnalyticsService.getInstance();