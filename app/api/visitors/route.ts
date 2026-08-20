import { desc, sql } from "drizzle-orm";

import { getDb } from "@/db";
import { visitors } from "@/db/schema";

const STATIC_TOTAL = 1_284;
const STATIC_CITY_COUNT = 42;
const MAX_LOCATIONS = 24;
const inMemoryVisitors: Array<typeof visitors.$inferInsert> = [];

type LocationPayload = {
  city?: unknown;
  country?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  timezone?: unknown;
};

type Location = {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

function json(body: Record<string, unknown>, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function parseLocation(payload: LocationPayload): Location | null {
  const city = cleanText(payload.city, 80);
  const country = cleanText(payload.country, 80);
  const timezone = cleanText(payload.timezone, 80);
  const latitude = typeof payload.latitude === "number" ? payload.latitude : Number(payload.latitude);
  const longitude = typeof payload.longitude === "number" ? payload.longitude : Number(payload.longitude);

  if (!city || !country || !timezone || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;

  return { city, country, latitude, longitude, timezone };
}

function distinctLocations(rows: Array<Location>) {
  const seen = new Set<string>();
  return rows.filter((location) => {
    const key = `${location.city.toLowerCase()}|${location.country.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, MAX_LOCATIONS);
}

function fallbackResponse() {
  const locations = distinctLocations(inMemoryVisitors.map((entry) => ({
    city: entry.city,
    country: entry.country,
    latitude: entry.latitude,
    longitude: entry.longitude,
    timezone: entry.timezone,
  })));
  return {
    locations,
    totalVisitors: STATIC_TOTAL + inMemoryVisitors.length,
    cityCount: Math.max(STATIC_CITY_COUNT, locations.length),
    mode: "fallback",
  };
}

export async function GET() {
  try {
    const db = await getDb();
    if (!db) return json(fallbackResponse());

    const rows = await db.select({
      city: visitors.city,
      country: visitors.country,
      latitude: visitors.latitude,
      longitude: visitors.longitude,
      timezone: visitors.timezone,
    }).from(visitors).orderBy(desc(visitors.createdAt), desc(visitors.id)).limit(160);
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(visitors);
    const locations = distinctLocations(rows);

    return json({
      locations,
      totalVisitors: Number(count) || 0,
      cityCount: locations.length,
      mode: "database",
    });
  } catch {
    return json(fallbackResponse());
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json() as LocationPayload;
    const location = parseLocation(payload);
    if (!location) return json({ error: "A valid city-level location is required." }, 400);

    const createdAt = new Date();
    const db = await getDb();
    if (db) {
      await db.insert(visitors).values({ ...location, createdAt });
    } else {
      inMemoryVisitors.unshift({ ...location, createdAt });
      inMemoryVisitors.splice(48);
    }

    return json({ ok: true, ...location });
  } catch {
    return json({ error: "Unable to record visitor signal." }, 400);
  }
}
