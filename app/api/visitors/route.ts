import { createHash } from "node:crypto";
import { desc, sql } from "drizzle-orm";

import { getDb } from "@/db";
import { visitors } from "@/db/schema";

const MAX_LOCATIONS = 24;

type CloudflareGeo = {
  city?: string;
  country?: string;
  latitude?: string;
  longitude?: string;
  timezone?: string;
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

// Visitor location is resolved exclusively server-side. On Cloudflare Workers the
// request carries request.cf geolocation data — no third-party API, no exposed keys.
// When that data is absent the honest answer is "unavailable", never a guess.
function serverLocation(request: Request) {
  const cf = (request as Request & { cf?: CloudflareGeo }).cf;
  const city = cleanText(cf?.city, 80);
  const countryCode = cleanText(cf?.country, 2).toUpperCase();
  const timezone = cleanText(cf?.timezone, 80);
  const latitude = Number.parseFloat(cleanText(cf?.latitude, 16));
  const longitude = Number.parseFloat(cleanText(cf?.longitude, 16));

  if (!city || !countryCode || !timezone || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  let country = countryCode;
  try {
    country = new Intl.DisplayNames(["en"], { type: "region" }).of(countryCode) || countryCode;
  } catch {
    // Region display names unsupported in this runtime — keep the ISO code.
  }

  return { city, country, latitude, longitude, timezone };
}

function visitorDedupeKey(request: Request, sessionId: string, dayIso: string) {
  const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-real-ip") ?? "";
  return createHash("sha256").update(`${sessionId}|${ip}|${dayIso}`).digest("hex");
}

export async function GET() {
  const db = await getDb();
  if (!db) return json({ available: false, mode: "unavailable" });

  try {
    const rows = await db.select({
      city: visitors.city,
      country: visitors.country,
      latitude: visitors.latitude,
      longitude: visitors.longitude,
      timezone: visitors.timezone,
      createdAt: visitors.createdAt,
    }).from(visitors).orderBy(desc(visitors.createdAt), desc(visitors.id)).limit(160);

    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(visitors);
    const locations = distinctLocations(rows.map((row) => ({
      city: row.city,
      country: row.country,
      latitude: row.latitude,
      longitude: row.longitude,
      timezone: row.timezone,
    })));

    return json({
      available: true,
      mode: "database",
      totalVisitors: Number(count) || 0,
      cityCount: locations.length,
      locations,
    });
  } catch {
    return json({ available: false, mode: "unavailable" }, 503);
  }
}

export async function POST(request: Request) {
  const db = await getDb();
  if (!db) return json({ error: "Visitor storage is not configured." }, 503);

  const location = serverLocation(request);
  if (!location) return json({ error: "Visitor location is unavailable from the server." }, 503);

  try {
    const payload = (await request.json().catch(() => ({}))) as { sessionId?: unknown };
    const sessionId = cleanText(payload.sessionId, 64);
    const dedupeKey = visitorDedupeKey(request, sessionId, new Date().toISOString().slice(0, 10));

    const inserted = await db.insert(visitors)
      .values({ ...location, dedupeKey, createdAt: new Date() })
      .onConflictDoNothing({ target: visitors.dedupeKey })
      .returning({ id: visitors.id });

    return json({ ok: true, counted: inserted.length > 0, ...location });
  } catch {
    return json({ error: "Unable to record visitor signal." }, 503);
  }
}

function distinctLocations(rows: Array<{
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}>) {
  const seen = new Set<string>();
  return rows.filter((location) => {
    const key = `${location.city.toLowerCase()}|${location.country.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, MAX_LOCATIONS);
}
