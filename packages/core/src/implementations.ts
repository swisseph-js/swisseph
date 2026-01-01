/**
 * Swiss Ephemeris Type Definitions - Implementation Classes
 *
 * This file contains implementation classes that add convenience methods
 * to the result interfaces, making the library more developer-friendly.
 */

import { EclipseType, CalendarType } from './enums';
import { LunarEclipse, SolarEclipse, ExtendedDateTime } from './results';

/**
 * Implementation of LunarEclipse with convenience methods
 */
export class LunarEclipseImpl implements LunarEclipse {
  constructor(
    public type: number,
    public maximum: number,
    public partialBegin: number,
    public partialEnd: number,
    public totalBegin: number,
    public totalEnd: number,
    public penumbralBegin: number,
    public penumbralEnd: number
  ) {}

  isTotal(): boolean {
    return (this.type & EclipseType.Total) !== 0;
  }

  isPartial(): boolean {
    return (this.type & EclipseType.Partial) !== 0;
  }

  isPenumbralOnly(): boolean {
    return (
      (this.type & EclipseType.Penumbral) !== 0 &&
      (this.type & (EclipseType.Total | EclipseType.Partial)) === 0
    );
  }

  getTotalityDuration(): number {
    if (!this.isTotal() || this.totalBegin === 0 || this.totalEnd === 0) {
      return 0;
    }
    // Convert from Julian days to hours
    const duration = (this.totalEnd - this.totalBegin) * 24;
    return duration > 0 ? duration : 0;
  }

  getPartialDuration(): number {
    if (this.partialBegin === 0 || this.partialEnd === 0) {
      return 0;
    }
    // Convert from Julian days to hours
    const duration = (this.partialEnd - this.partialBegin) * 24;
    return duration > 0 ? duration : 0;
  }

  getTotalDuration(): number {
    if (this.penumbralBegin === 0 || this.penumbralEnd === 0) {
      return 0;
    }
    // Convert from Julian days to hours
    const duration = (this.penumbralEnd - this.penumbralBegin) * 24;
    return duration > 0 ? duration : 0;
  }
}

/**
 * Implementation of SolarEclipse with convenience methods
 */
export class SolarEclipseImpl implements SolarEclipse {
  constructor(
    public type: number,
    public maximum: number,
    public partialBegin: number,
    public partialEnd: number,
    public centralBegin: number,
    public centralEnd: number,
    public centerLineBegin: number,
    public centerLineEnd: number
  ) {}

  isTotal(): boolean {
    return (this.type & EclipseType.Total) !== 0;
  }

  isAnnular(): boolean {
    return (this.type & EclipseType.Annular) !== 0;
  }

  isHybrid(): boolean {
    return (this.type & EclipseType.AnnularTotal) !== 0;
  }

  isPartial(): boolean {
    return (this.type & EclipseType.Partial) !== 0;
  }

  isCentral(): boolean {
    return (this.type & EclipseType.Central) !== 0;
  }

  isNonCentral(): boolean {
    return (this.type & EclipseType.NonCentral) !== 0;
  }
}

/**
 * Implementation of ExtendedDateTime with convenience methods
 */
export class DateTimeImpl implements ExtendedDateTime {
  constructor(
    public year: number,
    public month: number,
    public day: number,
    public hour: number,
    public calendarType: CalendarType = CalendarType.Gregorian
  ) {}

  toISOString(): string {
    const hours = Math.floor(this.hour);
    const minutes = Math.floor((this.hour - hours) * 60);
    const seconds = Math.floor(((this.hour - hours) * 60 - minutes) * 60);
    const milliseconds = Math.floor((((this.hour - hours) * 60 - minutes) * 60 - seconds) * 1000);

    const yearStr = Math.abs(this.year).toString().padStart(4, '0');
    const yearSign = this.year < 0 ? '-' : '';
    const monthStr = this.month.toString().padStart(2, '0');
    const dayStr = this.day.toString().padStart(2, '0');
    const hoursStr = hours.toString().padStart(2, '0');
    const minutesStr = minutes.toString().padStart(2, '0');
    const secondsStr = seconds.toString().padStart(2, '0');
    const msStr = milliseconds.toString().padStart(3, '0');

    return `${yearSign}${yearStr}-${monthStr}-${dayStr}T${hoursStr}:${minutesStr}:${secondsStr}.${msStr}Z`;
  }

  toString(): string {
    const calType = this.calendarType === CalendarType.Gregorian ? 'Gregorian' : 'Julian';
    const yearStr = this.year < 0 ? `${Math.abs(this.year)} BCE` : this.year.toString();

    return `${yearStr}-${this.month.toString().padStart(2, '0')}-${this.day.toString().padStart(2, '0')} ${this.hour.toFixed(6)} hours (${calType})`;
  }
}
