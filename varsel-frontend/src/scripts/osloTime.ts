/**
 * Norwegian wall-clock helpers.
 *
 * Electricity prices are published, and alerts are expressed, in Norwegian
 * local time (Europe/Oslo, CET/CEST). The browser's own timezone is whatever
 * the user's machine says, and `Date#toISOString()` is always UTC - so neither
 * can be used to answer "what day/hour is it in Norway right now?".
 *
 * Concretely, `new Date().toISOString().slice(0, 10)` - the idiom this module
 * replaces - returns *yesterday's* date for every Norwegian user between
 * midnight and 01:00 (CET) or 02:00 (CEST), because Norway is ahead of UTC.
 *
 * Everything here goes through `Intl.DateTimeFormat` with an explicit
 * `timeZone`, which gets DST transitions right without pulling in a date
 * library, and calendar arithmetic is done in UTC on plain Y/M/D numbers so a
 * 23- or 25-hour day can never shift the result by a day.
 */

export const OSLO_TIME_ZONE = 'Europe/Oslo';

/** Weekday indices match `Date#getDay()`: 0 = Sunday ... 6 = Saturday. */
export type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface OsloParts {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  hour: number; // 0-23
  minute: number; // 0-59
  weekday: WeekdayIndex;
}

const WEEKDAY_INDEX: Record<string, WeekdayIndex> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

// Constructing an Intl.DateTimeFormat is comparatively expensive, and the alert
// engine calls these helpers on every tick, so the formatter is built once.
let partsFormatter: Intl.DateTimeFormat | null = null;

function getPartsFormatter(): Intl.DateTimeFormat {
  partsFormatter ??= new Intl.DateTimeFormat('en-US', {
    timeZone: OSLO_TIME_ZONE,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
  });
  return partsFormatter;
}

/** Breaks an instant down into Norwegian wall-clock components. */
export function getOsloParts(instant: Date = new Date()): OsloParts {
  const parts = getPartsFormatter().formatToParts(instant);
  const lookup: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== 'literal') lookup[part.type] = part.value;
  }

  return {
    year: Number(lookup.year),
    month: Number(lookup.month),
    day: Number(lookup.day),
    // `hourCycle: 'h23'` still renders midnight as "24" in some engines.
    hour: Number(lookup.hour) % 24,
    minute: Number(lookup.minute),
    weekday: WEEKDAY_INDEX[lookup.weekday ?? 'Mon'] ?? 1,
  };
}

/** Today's date in Norway, as `YYYY-MM-DD`. */
export function getOsloIsoDate(instant: Date = new Date()): string {
  const { year, month, day } = getOsloParts(instant);
  return toIsoDate(year, month, day);
}

/** The current hour of the day in Norway (0-23). */
export function getOsloHour(instant: Date = new Date()): number {
  return getOsloParts(instant).hour;
}

/** Minutes elapsed since Norwegian midnight (0-1439). */
export function getOsloMinutesOfDay(instant: Date = new Date()): number {
  const { hour, minute } = getOsloParts(instant);
  return hour * 60 + minute;
}

/** The current weekday in Norway, 0 = Sunday. */
export function getOsloWeekday(instant: Date = new Date()): WeekdayIndex {
  return getOsloParts(instant).weekday;
}

function toIsoDate(year: number, month: number, day: number): string {
  return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day
    .toString()
    .padStart(2, '0')}`;
}

/**
 * Shifts an ISO calendar date by whole days.
 *
 * Done as UTC calendar arithmetic rather than `Date#setDate()` on a local Date,
 * because on the two DST-transition days a local-time day is 23 or 25 hours
 * long and naive millisecond math lands on the wrong calendar date.
 */
export function addOsloDays(isoDate: string, deltaDays: number): string {
  const parsed = parseIsoDate(isoDate);
  if (!parsed) return isoDate;

  const shifted = new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day + deltaDays));
  return toIsoDate(shifted.getUTCFullYear(), shifted.getUTCMonth() + 1, shifted.getUTCDate());
}

/** Parses `YYYY-MM-DD`, returning null when the string is not a valid date. */
export function parseIsoDate(isoDate: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  // Round-trip through UTC to reject impossible dates such as 2026-02-30.
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() + 1 !== month ||
    probe.getUTCDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}

/** Compares two ISO dates. Safe as a plain string compare given the fixed width. */
export function isoDateIsBefore(a: string, b: string): boolean {
  return a < b;
}

/** The weekday of an ISO calendar date, 0 = Sunday. */
export function getIsoDateWeekday(isoDate: string): WeekdayIndex {
  const parsed = parseIsoDate(isoDate);
  if (!parsed) return 1;
  return new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day)).getUTCDay() as WeekdayIndex;
}

/** Formats `HH:mm` from minutes since midnight. */
export function formatMinutesOfDay(minutes: number): string {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  return `${hours.toString().padStart(2, '0')}:${(normalized % 60).toString().padStart(2, '0')}`;
}

/** Parses `HH:mm` into minutes since midnight, or null when malformed. */
export function parseTimeOfDay(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}
