import { api } from 'boot/axios';
import type { Price } from './TableScript';

export type DayPrice = Pick<Price, 'time_start' | 'time_end' | 'NOK_per_kWh'>;

const CACHE_TTL_MS = 2 * 60_000;
const MAX_CACHED_DAYS = 40;
const cache = new Map<string, { prices: DayPrice[]; expires: number }>();
const inFlight = new Map<string, Promise<DayPrice[]>>();

export function getPriceDay(area: string, date: string): Promise<DayPrice[]> {
  const key = `/prices/${area}/${date}`;
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) return Promise.resolve(cached.prices);
  const pending = inFlight.get(key);
  if (pending) return pending;

  const request = api
    .get<{ prices: DayPrice[] }>(key)
    .then(({ data }) => {
      if (!Array.isArray(data?.prices)) throw new Error('Invalid price response');
      if (data.prices.length) {
        cache.delete(key);
        if (cache.size >= MAX_CACHED_DAYS) {
          const oldest = cache.keys().next().value;
          if (oldest) cache.delete(oldest);
        }
        cache.set(key, { prices: data.prices, expires: Date.now() + CACHE_TTL_MS });
      }
      return data.prices;
    })
    .finally(() => inFlight.delete(key));
  inFlight.set(key, request);
  return request;
}
