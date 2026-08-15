/**
 * Evaluates saved alerts and actually delivers notifications.
 *
 * Before this existed, alerts were written to localStorage and never read back
 * by anything - the UI promised "you will be notified" and then no notification
 * could ever fire. This is the delivery half.
 *
 * Scope and limits (see docs/notifications.md):
 * - Delivery is client-side, via the browser's Notification API. It therefore
 *   only runs while a VarsEL tab is open. Genuine background delivery needs a
 *   server-side scheduler plus Web Push credentials, which is a deliberate
 *   non-goal here.
 * - Every decision about "what day/hour is it" goes through Europe/Oslo wall
 *   clock time, not the browser's timezone and not UTC.
 * - Delivery is at-most-once per slot: the ledger entry is written before the
 *   notification is raised, so a crash mid-delivery drops one notification
 *   rather than repeating it on the next tick.
 */

import { ref, computed, readonly } from 'vue';
import { api } from 'boot/axios';
import {
  getOsloIsoDate,
  getOsloParts,
  parseTimeOfDay,
  type WeekdayIndex,
} from 'src/scripts/osloTime';
import {
  loadAlerts,
  loadLedger,
  saveLedger,
  deliveryKey,
  EQUALITY_EPSILON,
  type Alert,
  type CheapestAlert,
  type DeliveryLedger,
  type DeliveryOutcome,
  type PriceAlert,
  type QuietHours,
} from 'src/scripts/alertStore';

/** How often the engine re-evaluates while the tab is visible. */
const TICK_INTERVAL_MS = 60_000;

/**
 * How late a cheapest-hour alert may still fire after its scheduled time.
 * Opening the app at 22:00 should not replay a 07:00 alert; the slot is instead
 * recorded as missed so it neither fires late nor retries for the rest of the day.
 */
const CATCH_UP_WINDOW_MINUTES = 120;

/** Caps the exponential backoff applied after consecutive fetch failures. */
const MAX_BACKOFF_MS = 15 * 60_000;
const MAX_CONSECUTIVE_FAILURES = 6;

export interface DeliveryEvent {
  key: string;
  alertId: string;
  kind: Alert['kind'];
  title: string;
  body: string;
  at: number;
  outcome: DeliveryOutcome;
}

interface BackendPrice {
  time_start: string;
  time_end: string;
  NOK_per_kWh: number;
}

/* ------------------------------------------------------------------ *
 * Module-level singleton state
 * ------------------------------------------------------------------ */

const permission = ref<NotificationPermission | 'unsupported'>(
  typeof Notification === 'undefined' ? 'unsupported' : Notification.permission,
);
const lastRunAt = ref<number | null>(null);
const lastError = ref<string | null>(null);
const consecutiveFailures = ref(0);
const recentDeliveries = ref<DeliveryEvent[]>([]);

let ledger: DeliveryLedger = {};
let tickHandle: ReturnType<typeof setInterval> | null = null;
let started = false;
let running = false;
let nextAllowedRunAt = 0;

/** Reloads alerts from storage on every run so edits take effect immediately. */
function currentAlerts(): Alert[] {
  return loadAlerts().filter((alert) => alert.enabled);
}

/* ------------------------------------------------------------------ *
 * Schedule predicates
 * ------------------------------------------------------------------ */

/** True when the alert is allowed to fire on this Norwegian weekday. */
export function isScheduledToday(alert: Alert, weekday: WeekdayIndex): boolean {
  return alert.days.length === 0 || alert.days.includes(weekday);
}

/**
 * True when a Norwegian minute-of-day falls inside the configured quiet window.
 * Handles windows that wrap past midnight (e.g. 23:00-07:00).
 */
export function isWithinQuietHours(quietHours: QuietHours, minuteOfDay: number): boolean {
  if (!quietHours.enabled) return false;

  const { startMinute, endMinute } = quietHours;
  if (startMinute === endMinute) return false; // zero-length window: never quiet
  return startMinute < endMinute
    ? minuteOfDay >= startMinute && minuteOfDay < endMinute
    : minuteOfDay >= startMinute || minuteOfDay < endMinute;
}

/** Whether a price satisfies the alert's threshold condition. */
export function priceMeetsCondition(alert: PriceAlert, price: number): boolean {
  switch (alert.condition) {
    case 'under':
      return price < alert.targetPrice;
    case 'over':
      return price > alert.targetPrice;
    case 'equal':
      // An exact float comparison would never match, so "equal" means
      // "rounds to the same øre".
      return Math.abs(price - alert.targetPrice) <= EQUALITY_EPSILON;
    default:
      return false;
  }
}

/* ------------------------------------------------------------------ *
 * Price access
 * ------------------------------------------------------------------ */

/**
 * The backend renders `time_start` as `dd.MM.yyyy HH:mm` in Norwegian local
 * time, so the hour is a fixed slice. Returns -1 for an unparseable value
 * rather than silently treating it as midnight.
 */
function hourOf(price: BackendPrice): number {
  const hour = Number(price.time_start?.slice(11, 13));
  return Number.isInteger(hour) && hour >= 0 && hour <= 23 ? hour : -1;
}

async function fetchPrices(regionParam: string, isoDate: string): Promise<BackendPrice[]> {
  const response = await api.get(`/prices/${regionParam}/${isoDate}`, {
    params: { startHour: 0, endHour: 24 },
  });
  const json = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;

  if (!json || !Array.isArray(json.prices)) {
    throw new Error('Backend returned no usable price data');
  }
  return json.prices as BackendPrice[];
}

/** City takes precedence over area, matching the price pages. */
function regionParamFor(alert: Alert): string {
  return alert.city || alert.area;
}

/* ------------------------------------------------------------------ *
 * Delivery
 * ------------------------------------------------------------------ */

function record(key: string, outcome: DeliveryOutcome, summary: string): void {
  ledger[key] = { at: Date.now(), outcome, summary };
  saveLedger(ledger);
}

function pushEvent(event: DeliveryEvent): void {
  // Newest first, capped - this feeds the "recent alerts" list in the UI.
  recentDeliveries.value = [event, ...recentDeliveries.value].slice(0, 25);
}

/**
 * Raises one notification.
 *
 * The ledger is written *before* the notification is constructed, so a failure
 * or a reload between the two drops a single notification instead of replaying
 * it forever. The `tag` is the same idempotency key, which lets the OS collapse
 * a duplicate as a second line of defence.
 */
function deliver(key: string, alert: Alert, title: string, body: string): void {
  record(key, 'delivered', body);

  const event: DeliveryEvent = {
    key,
    alertId: alert.id,
    kind: alert.kind,
    title,
    body,
    at: Date.now(),
    outcome: 'delivered',
  };
  pushEvent(event);

  if (permission.value !== 'granted' || typeof Notification === 'undefined') {
    // No OS-level permission: the in-app "recent alerts" list is the delivery
    // channel. Still ledgered, so granting permission later does not replay.
    return;
  }

  try {
    new Notification(title, { body, tag: key, icon: '/icons/favicon-128x128.png' });
  } catch (error) {
    console.warn('Notification could not be shown', error);
  }
}

function skip(key: string, alert: Alert, outcome: DeliveryOutcome, summary: string): void {
  record(key, outcome, summary);
  pushEvent({
    key,
    alertId: alert.id,
    kind: alert.kind,
    title: '',
    body: summary,
    at: Date.now(),
    outcome,
  });
}

/* ------------------------------------------------------------------ *
 * Evaluation
 * ------------------------------------------------------------------ */

function evaluatePriceAlert(
  alert: PriceAlert,
  prices: BackendPrice[],
  osloDate: string,
  hour: number,
  minuteOfDay: number,
): void {
  const key = deliveryKey(alert, osloDate, hour);
  if (ledger[key]) return; // this hour has already been decided

  const current = prices.find((price) => hourOf(price) === hour);
  if (!current) return; // no data for this hour yet - retry on the next tick

  if (!priceMeetsCondition(alert, current.NOK_per_kWh)) return;

  const label = alert.city || alert.area;
  const body = `${label}: ${current.NOK_per_kWh.toFixed(3)} kr/kWh (${alert.condition} ${alert.targetPrice} kr/kWh)`;

  if (isWithinQuietHours(alert.quietHours, minuteOfDay)) {
    skip(key, alert, 'suppressed', body);
    return;
  }
  deliver(key, alert, 'VarsEL', body);
}

function evaluateCheapestAlert(
  alert: CheapestAlert,
  prices: BackendPrice[],
  osloDate: string,
  minuteOfDay: number,
): void {
  const key = deliveryKey(alert, osloDate);
  if (ledger[key]) return; // already decided for today

  const scheduledMinute = parseTimeOfDay(alert.notificationTime);
  if (scheduledMinute === null || minuteOfDay < scheduledMinute) return; // not due yet

  const label = alert.city || alert.area;

  if (minuteOfDay - scheduledMinute > CATCH_UP_WINDOW_MINUTES) {
    // The tab was closed across the whole window. Record it as missed so it
    // neither fires hours late nor gets re-checked for the rest of the day.
    skip(key, alert, 'missed', `${label}: missed the ${alert.notificationTime} window`);
    return;
  }

  const usable = prices.filter((price) => hourOf(price) >= 0);
  if (usable.length === 0) return; // no data yet - retry on the next tick

  const cheapest = usable.reduce((best, price) =>
    price.NOK_per_kWh < best.NOK_per_kWh ? price : best,
  );
  const body = `${label}: cheapest hour today is ${cheapest.time_start.slice(11, 16)} at ${cheapest.NOK_per_kWh.toFixed(3)} kr/kWh`;

  if (isWithinQuietHours(alert.quietHours, minuteOfDay)) {
    skip(key, alert, 'suppressed', body);
    return;
  }
  deliver(key, alert, 'VarsEL', body);
}

/**
 * One evaluation pass over every enabled alert.
 *
 * Re-entrancy is guarded, and prices are fetched at most once per region per
 * pass, so N alerts on the same area cost one backend request rather than N.
 */
export async function runOnce(options: { force?: boolean } = {}): Promise<void> {
  if (running) return;
  if (!options.force && Date.now() < nextAllowedRunAt) return; // still backing off

  const alerts = currentAlerts();
  if (alerts.length === 0) {
    lastRunAt.value = Date.now();
    return;
  }

  running = true;
  try {
    ledger = loadLedger(); // pick up deliveries made by another tab
    const now = new Date();
    const { hour, minute, weekday } = getOsloParts(now);
    const osloDate = getOsloIsoDate(now);
    const minuteOfDay = hour * 60 + minute;

    const dueToday = alerts.filter((alert) => isScheduledToday(alert, weekday));
    if (dueToday.length === 0) {
      lastRunAt.value = Date.now();
      return;
    }

    // One request per distinct region for this pass.
    const regions = [...new Set(dueToday.map(regionParamFor))];
    const priceCache = new Map<string, BackendPrice[]>();
    await Promise.all(
      regions.map(async (region) => {
        priceCache.set(region, await fetchPrices(region, osloDate));
      }),
    );

    for (const alert of dueToday) {
      const prices = priceCache.get(regionParamFor(alert));
      if (!prices) continue;

      if (alert.kind === 'price') {
        evaluatePriceAlert(alert, prices, osloDate, hour, minuteOfDay);
      } else {
        evaluateCheapestAlert(alert, prices, osloDate, minuteOfDay);
      }
    }

    lastRunAt.value = Date.now();
    lastError.value = null;
    consecutiveFailures.value = 0;
    nextAllowedRunAt = 0;
  } catch (error) {
    // The backend is on a free tier that cold-starts, so transient failures are
    // expected. Back off exponentially rather than hammering it every minute,
    // and surface the state so the UI can say alerts are currently degraded.
    consecutiveFailures.value = Math.min(consecutiveFailures.value + 1, MAX_CONSECUTIVE_FAILURES);
    lastError.value = error instanceof Error ? error.message : String(error);
    nextAllowedRunAt =
      Date.now() + Math.min(TICK_INTERVAL_MS * 2 ** consecutiveFailures.value, MAX_BACKOFF_MS);
    console.warn('Alert evaluation failed', error);
  } finally {
    running = false;
  }
}

/** Prompts for OS notification permission. Must be called from a user gesture. */
export async function requestPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof Notification === 'undefined') {
    permission.value = 'unsupported';
    return 'unsupported';
  }
  try {
    permission.value = await Notification.requestPermission();
  } catch (error) {
    console.warn('Notification permission request failed', error);
  }
  return permission.value;
}

function handleVisibilityChange(): void {
  // Timers are throttled hard in background tabs, so re-evaluate immediately on
  // return to catch up on anything that came due while hidden.
  if (document.visibilityState === 'visible') void runOnce({ force: true });
}

/** Starts the periodic evaluation loop. Safe to call from several components. */
export function startAlertEngine(): void {
  if (started || typeof window === 'undefined') return;
  started = true;

  ledger = loadLedger();
  void runOnce({ force: true });

  tickHandle = setInterval(() => {
    if (document.visibilityState === 'visible') void runOnce();
  }, TICK_INTERVAL_MS);

  document.addEventListener('visibilitychange', handleVisibilityChange);
}

export function stopAlertEngine(): void {
  if (tickHandle) clearInterval(tickHandle);
  tickHandle = null;
  document.removeEventListener('visibilitychange', handleVisibilityChange);
  started = false;
}

export function useAlertEngine() {
  return {
    permission: readonly(permission),
    lastRunAt: readonly(lastRunAt),
    lastError: readonly(lastError),
    recentDeliveries: readonly(recentDeliveries),
    isDegraded: computed(() => consecutiveFailures.value > 0),
    requestPermission,
    runOnce,
    startAlertEngine,
  };
}
