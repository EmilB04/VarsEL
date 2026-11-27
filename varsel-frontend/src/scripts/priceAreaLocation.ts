import mapUrl from 'src/assets/price-areas.geojson?url';
import type { AreaCode } from './TableScript';

type Point = [longitude: number, latitude: number];
type Ring = Point[];
type Polygon = Ring[];
type AreaMap = {
  features: {
    properties: { ElSpotOmr: AreaCode };
    geometry: { type: 'MultiPolygon'; coordinates: Polygon[] };
  }[];
};

type Match = { kind: 'matched'; area: AreaCode } | { kind: 'outside' | 'uncertain' };
const METRES_PER_DEGREE = 111_320;
// Allow for the simplified geometry in the published map as well as device accuracy.
const MAP_MARGIN_METRES = 50;

function contains([longitude, latitude]: Point, ring: Ring) {
  let inside = false;
  for (let index = 1; index < ring.length; index++) {
    const [x1, y1] = ring[index - 1]!;
    const [x2, y2] = ring[index]!;
    if (
      y1 > latitude !== y2 > latitude &&
      longitude < x1 + ((x2 - x1) * (latitude - y1)) / (y2 - y1)
    ) {
      inside = !inside;
    }
  }
  return inside;
}

function isNearBoundary([longitude, latitude]: Point, ring: Ring, radius: number) {
  const longitudeScale = METRES_PER_DEGREE * Math.cos((latitude * Math.PI) / 180);
  for (let index = 1; index < ring.length; index++) {
    const [x1, y1] = ring[index - 1]!;
    const [x2, y2] = ring[index]!;
    // Measure in metres on the local plane centred on the GPS fix.
    const ax = (x1 - longitude) * longitudeScale;
    const ay = (y1 - latitude) * METRES_PER_DEGREE;
    const dx = (x2 - x1) * longitudeScale;
    const dy = (y2 - y1) * METRES_PER_DEGREE;
    const lengthSquared = dx * dx + dy * dy;
    const fraction = lengthSquared
      ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / lengthSquared))
      : 0;
    if (Math.hypot(ax + fraction * dx, ay + fraction * dy) <= radius) return true;
  }
  return false;
}

export async function findPriceArea(
  { longitude, latitude, accuracy }: GeolocationCoordinates,
  signal: AbortSignal,
): Promise<Match> {
  const response = await fetch(mapUrl, { signal });
  if (!response.ok) throw new Error('Price-area map unavailable');
  const { features } = (await response.json()) as AreaMap;

  const point: Point = [longitude, latitude];
  const radius = accuracy + MAP_MARGIN_METRES;
  let area: AreaCode | undefined;
  for (const feature of features) {
    const polygon = feature.geometry.coordinates.find(
      ([outer, ...holes]) =>
        outer && contains(point, outer) && !holes.some((hole) => contains(point, hole)),
    );
    if (!polygon) continue;
    if (area || polygon.some((ring) => isNearBoundary(point, ring, radius))) {
      return { kind: 'uncertain' };
    }
    area = feature.properties.ElSpotOmr;
  }
  return area ? { kind: 'matched', area } : { kind: 'outside' };
}
