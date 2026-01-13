import { ScheduleConfig, DayOfWeek } from '../models';
import { randomUUID } from 'crypto';

export class ScheduleService {
  private schedules: Map<string, ScheduleConfig> = new Map();

  createSchedule(configId: string): ScheduleConfig {
    const schedule: ScheduleConfig = {
      id: randomUUID(),
      configId,
      enabled: false,
      daysOfWeek: [],
      time: '09:00',
      datesOfMonth: [],
      timezone: 'UTC',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.schedules.set(configId, schedule);
    return schedule;
  }

  getSchedule(configId: string): ScheduleConfig | undefined {
    return this.schedules.get(configId);
  }

  updateSchedule(
    configId: string,
    updates: Partial<Omit<ScheduleConfig, 'id' | 'configId' | 'createdAt'>>
  ): ScheduleConfig {
    const existing = this.schedules.get(configId);
    
    if (!existing) {
      throw new Error(`Schedule not found for configuration: ${configId}`);
    }

    // Validate time format
    if (updates.time && !this.isValidTime(updates.time)) {
      throw new Error('Invalid time format. Use HH:MM (24-hour format)');
    }

    // Validate dates of month
    if (updates.datesOfMonth) {
      const invalidDates = updates.datesOfMonth.filter(d => d < 1 || d > 31);
      if (invalidDates.length > 0) {
        throw new Error('Dates of month must be between 1 and 31');
      }
    }

    const updated: ScheduleConfig = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };

    this.schedules.set(configId, updated);
    return updated;
  }

  deleteSchedule(configId: string): void {
    if (!this.schedules.has(configId)) {
      throw new Error(`Schedule not found for configuration: ${configId}`);
    }
    this.schedules.delete(configId);
  }

  private isValidTime(time: string): boolean {
    const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
    return timeRegex.test(time);
  }

  // Convert schedule to cron expression for Airflow
  toCronExpression(schedule: ScheduleConfig): string {
    if (!schedule.enabled) {
      return '';
    }

    const [hour, minute] = schedule.time.split(':');
    
    // If specific dates of month are set, use those
    if (schedule.datesOfMonth.length > 0) {
      const dates = schedule.datesOfMonth.sort((a, b) => a - b).join(',');
      return `${minute} ${hour} ${dates} * *`;
    }
    
    // If days of week are set, use those
    if (schedule.daysOfWeek.length > 0) {
      const dayMap: Record<DayOfWeek, number> = {
        sunday: 0,
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
      };
      
      const days = schedule.daysOfWeek
        .map(d => dayMap[d])
        .sort((a, b) => a - b)
        .join(',');
      
      return `${minute} ${hour} * * ${days}`;
    }
    
    // Default: daily at specified time
    return `${minute} ${hour} * * *`;
  }

  // Get human-readable description of schedule
  getScheduleDescription(schedule: ScheduleConfig): string {
    if (!schedule.enabled) {
      return 'לא מופעל';
    }

    const parts: string[] = [];
    
    // Time
    parts.push(`בשעה ${schedule.time}`);
    
    // Days or dates
    if (schedule.datesOfMonth.length > 0) {
      const dates = schedule.datesOfMonth.sort((a, b) => a - b).join(', ');
      parts.push(`בתאריכים ${dates} בחודש`);
    } else if (schedule.daysOfWeek.length > 0) {
      const dayNames: Record<DayOfWeek, string> = {
        sunday: 'ראשון',
        monday: 'שני',
        tuesday: 'שלישי',
        wednesday: 'רביעי',
        thursday: 'חמישי',
        friday: 'שישי',
        saturday: 'שבת',
      };
      
      const days = schedule.daysOfWeek.map(d => dayNames[d]).join(', ');
      parts.push(`בימים: ${days}`);
    } else {
      parts.push('כל יום');
    }
    
    return parts.join(' ');
  }
}
