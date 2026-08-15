/**
 * Alert definitions, persistence and the delivery ledger.
 *
 * Everything here is deliberately defensive about what comes back out of
 * localStorage: it is user-writable, survives across app versions, and the
 * previous implementation fed `JSON.parse` output straight into the UI as if
 * it were typed. A single hand-edited or half-migrated entry could therefore
 * crash the notifications page.
 */

import type { WeekdayIndex } from './osloTime';
import { parseTimeOfDay } from './osloTime';

export type AlertKind = 'price' | 'cheapest';
export type PriceCondition = 'under' | 'over' | 'equal';

/**
 * Prices are compared in kr/kWh with three decimals, so an exact `===` match on
 * a floating point price would essentially never fire. "Equal" is therefore
 * defined as "rounds to the same øre".
 */
export const EQUALITY_EPSILON = 0.005;

export interface QuietHours {
  enabled: boolean;
  /** Minutes since Norwegian midnight. May be greater than `endMinute` to wrap past midnight. */
  startMinute: number;
  endMinute: number;
}

interface AlertCommon {
  id: string;
  area: string;
  city: string;
  enabled: boolean;
  /** Weekdays the alert may fire on (0 = Sunday). Empty means every day. */
  days: WeekdayIndex[];
  quietHours: QuietHours;
  createdAt: number;
}

export interface PriceAlert extends AlertCommon {
  kind: 'price';
  targetPrice: number;
  condition: PriceCondition;
}

export interface CheapestAlert extends AlertCommon {
  kind: 'cheapest';
  /** Norwegian wall-clock time of day, `HH:mm`. */
  notificationTime: string;
}

export type Alert = PriceAlert | CheapestAlert;

export const ALERTS_STORAGE_KEY = 'varsel-alerts-v2';
export const LEDGER_STORAGE_KEY = 'varsel-alert-deliveries-v1';

// Legacy keys written by the pre-delivery version of the notifications page.
const LEGACY_PRICE_KEY = 'varsel-price-alerts';
const LEGACY_CHEAPEST_KEY = 'varsel-cheapest-alerts';

const VALID_AREAS = new Set(['NO1', 'NO2', 'NO3', 'NO4', 'NO5']);
const VALID_CONDITIONS = new Set<PriceCondition>(['under', 'over', 'equal']);

export function defaultQuietHours(): QuietHours {
  // 23:00-07:00 - a sensible default for anyone who turns it on, but off by
  // default so enabling an alert never silently drops notifications.
  return { enabled: false, startMinute: 23 * 60, endMinute: 7 * 60 };
}

function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `alert-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createPriceAlert(input: Partial<PriceAlert> = {}): PriceAlert {
  return {
    kind: 'price',
    id: newId(),
    area: input.area ?? '',
    city: input.city ?? '',
    targetPrice: input.targetPrice ?? 0,
    condition: input.condition ?? 'under',
    enabled: input.enabled ?? true,
    days: input.days ?? [],
    quietHours: input.quietHours ?? defaultQuietHours(),
    createdAt: Date.now(),
  };
}

export function createCheapestAlert(input: Partial<CheapestAlert> = {}): CheapestAlert {
  return {
    kind: 'cheapest',
    id: newId(),
    area: input.area ?? '',
    city: input.city ?? '',
    notificationTime: input.notificationTime ?? '07:00',
    enabled: input.enabled ?? true,
    days: input.days ?? [],
    quietHours: input.quietHours ?? defaultQuietHours(),
    createdAt: Date.now(),
  };
}

/* ------------------------------------------------------------------ *
 * Validation
 * ------------------------------------------------------------------ */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function coerceDays(value: unknown): WeekdayIndex[] {
  if (!Array.isArray(value)) return [];
  const days = value
    .filter((day): day is number => typeof day === 'number' && Number.isInteger(day))
    .filter((day) => day >= 0 && day <= 6) as WeekdayIndex[];
  // Deduplicate, and treat "all seven selected" the same as "no restriction".
  const unique = [...new Set(days)].sort((a, b) => a - b);
  return unique.length === 7 ? [] : unique;
}

function coerceMinuteOfDay(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  const rounded = Math.round(value);
  return rounded >= 0 && rounded < 1440 ? rounded : fallback;
}

function coerceQuietHours(value: unknown): QuietHours {
  const fallback = defaultQuietHours();
  if (!isRecord(value)) return fallback;
  return {
    enabled: value.enabled === true,
    startMinute: coerceMinuteOfDay(value.startMinute, fallback.startMinute),
    endMinute: coerceMinuteOfDay(value.endMinute, fallback.endMinute),
  };
}

function coerceCommon(raw: Record<string, unknown>): AlertCommon | null {
  const area = typeof raw.area === 'string' ? raw.area.toUpperCase() : '';
  if (!VALID_AREAS.has(area)) return null;

  return {
    id: typeof raw.id === 'string' && raw.id.length > 0 ? raw.id : newId(),
    area,
    city: typeof raw.city === 'string' ? raw.city : '',
    enabled: raw.enabled !== false,
    days: coerceDays(raw.days),
    quietHours: coerceQuietHours(raw.quietHours),
    createdAt: typeof raw.createdAt === 'number' && raw.createdAt > 0 ? raw.createdAt : Date.now(),
  };
}

/** Narrows one persisted entry to a valid Alert, or null when unusable. */
export function coerceAlert(raw: unknown): Alert | null {
  if (!isRecord(raw)) return null;

  const common = coerceCommon(raw);
  if (!common) return null;

  // Entries migrated from the legacy keys have no `kind`; infer it from shape.
  const kind =
    raw.kind === 'price' || raw.kind === 'cheapest'
      ? raw.kind
      : 'notificationTime' in raw
        ? 'cheapest'
        : 'price';

  if (kind === 'cheapest') {
    const notificationTime =
      typeof raw.notificationTime === 'string' && parseTimeOfDay(raw.notificationTime) !== null
        ? raw.notificationTime
        : '07:00';
    return { ...common, kind: 'cheapest', notificationTime };
  }

  const targetPrice = Number(raw.targetPrice);
  if (!Number.isFinite(targetPrice)) return null;

  const condition =
    typeof raw.condition === 'string' && VALID_CONDITIONS.has(raw.condition as PriceCondition)
      ? (raw.condition as PriceCondition)
      : 'under';

  return { ...common, kind: 'price', targetPrice, condition };
}

/* ------------------------------------------------------------------ *
 * Persistence
 * ------------------------------------------------------------------ */

function readJson(key: string): unknown {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    // Corrupt or non-JSON payload - treat as absent rather than throwing on load.
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // Quota exceeded or storage disabled (private mode). Alerts stay in memory
    // for this session rather than taking the page down.
    console.warn('Could not persist alerts', error);
  }
}

/**
 * Pulls forward alerts saved under the two pre-v2 keys. Runs once: the legacy
 * keys are removed after a successful migration so re-running cannot duplicate.
 */
function migrateLegacyAlerts(): Alert[] {
  const legacy = [
    ...(Array.isArray(readJson(LEGACY_PRICE_KEY)) ? (readJson(LEGACY_PRICE_KEY) as unknown[]) : []),
    ...(Array.isArray(readJson(LEGACY_CHEAPEST_KEY))
      ? (readJson(LEGACY_CHEAPEST_KEY) as unknown[])
      : []),
  ];
  if (legacy.length === 0) return [];

  const migrated = legacy
    .map(coerceAlert)
    .filter((alert): alert is Alert => alert !== null);

  writeJson(ALERTS_STORAGE_KEY, migrated);
  try {
    localStorage.removeItem(LEGACY_PRICE_KEY);
    localStorage.removeItem(LEGACY_CHEAPEST_KEY);
  } catch {
    // Non-fatal - worst case the migration re-runs and overwrites with the same data.
  }
  return migrated;
}

export function loadAlerts(): Alert[] {
  const stored = readJson(ALERTS_STORAGE_KEY);
  if (stored === null) return migrateLegacyAlerts();
  if (!Array.isArray(stored)) return [];

  return stored.map(coerceAlert).filter((alert): alert is Alert => alert !== null);
}

export function saveAlerts(alerts: Alert[]): void {
  writeJson(ALERTS_STORAGE_KEY, alerts);
}

/* ------------------------------------------------------------------ *
 * Delivery ledger (duplicate suppression)
 * ------------------------------------------------------------------ */

export type DeliveryOutcome = 'delivered' | 'suppressed' | 'missed';

export interface DeliveryRecord {
  at: number;
  outcome: DeliveryOutcome;
  /** Human-readable summary, shown in the "recent alerts" list. */
  summary?: string;
}

export type DeliveryLedger = Record<string, DeliveryRecord>;

const LEDGER_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

export function loadLedger(): DeliveryLedger {
  const stored = readJson(LEDGER_STORAGE_KEY);
  if (!isRecord(stored)) return {};

  const now = Date.now();
  const ledger: DeliveryLedger = {};
  for (const [key, value] of Object.entries(stored)) {
    if (!isRecord(value)) continue;
    const at = typeof value.at === 'number' ? value.at : 0;
    // Drop anything past the retention window so the ledger stays bounded.
    if (at <= 0 || now - at > LEDGER_RETENTION_MS) continue;

    const outcome =
      value.outcome === 'delivered' || value.outcome === 'suppressed' || value.outcome === 'missed'
        ? value.outcome
        : 'delivered';

    ledger[key] = {
      at,
      outcome,
      ...(typeof value.summary === 'string' ? { summary: value.summary } : {}),
    };
  }
  return ledger;
}

export function saveLedger(ledger: DeliveryLedger): void {
  writeJson(LEDGER_STORAGE_KEY, ledger);
}

/**
 * Idempotency key for one delivery opportunity.
 *
 * Price alerts get one opportunity per Norwegian hour, cheapest-hour alerts one
 * per Norwegian day. Both are derived purely from the alert id plus the
 * Norwegian calendar slot, so re-evaluating the same slot - on the next tick,
 * after a reload, or in a second tab - resolves to the same key and cannot
 * produce a second notification.
 */
export function deliveryKey(alert: Alert, osloDate: string, osloHour?: number): string {
  return alert.kind === 'price'
    ? `${alert.id}:${osloDate}:${String(osloHour ?? 0).padStart(2, '0')}`
    : `${alert.id}:${osloDate}`;
}
