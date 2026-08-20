import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

type WorkerEnv = { DB?: unknown };

type D1DatabaseLike = Parameters<typeof drizzle>[0];

export async function getDb() {
  try {
    const workerModule = await import("cloudflare:workers") as { env?: WorkerEnv };
    const binding = workerModule.env?.DB;
    if (!binding) return null;
    return drizzle(binding as D1DatabaseLike, { schema });
  } catch {
    // Local Next/Vinext and Surge static builds do not provide Cloudflare bindings.
    return null;
  }
}
