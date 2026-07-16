import { NextResponse } from "next/server";

import { PORTFOLIO_CONTEXT, portfolioFallbackAnswer } from "@/lib/portfolio-context";

type ChatMessage = { role: "user" | "assistant"; content: string };

const SYSTEM_PROMPT = `You are Sonal Hegde's portfolio assistant. Answer only questions about Sonal's verified background, projects, skills, education, certifications, availability, CV, and contact information. Be concise, warm, and factual. Never invent missing dates, metrics, credential links, or personal facts. If the answer is not in the supplied context, say that it is not listed and suggest contacting Sonal.\n\nVERIFIED PORTFOLIO CONTEXT:\n${PORTFOLIO_CONTEXT}`;
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 18;
const requestBuckets = new Map<string, number[]>();

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function permittedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return !host || new URL(origin).host === host;
  } catch {
    return false;
  }
}

function rateLimited(request: Request) {
  const now = Date.now();
  const ip = (request.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  for (const [key, values] of requestBuckets) {
    const recent = values.filter((timestamp) => now - timestamp < RATE_WINDOW_MS);
    if (recent.length) requestBuckets.set(key, recent);
    else requestBuckets.delete(key);
  }
  const bucket = requestBuckets.get(ip) ?? [];
  if (bucket.length >= RATE_LIMIT) return true;
  bucket.push(now);
  requestBuckets.set(ip, bucket);
  return false;
}

function outputText(payload: unknown) {
  if (!payload || typeof payload !== "object") return "";
  const response = payload as { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> };
  return response.output_text ?? response.output?.flatMap((item) => item.content ?? []).map((item) => item.text ?? "").join("").trim() ?? "";
}

export async function POST(request: Request) {
  try {
    if (!permittedOrigin(request)) return json({ error: "Cross-origin requests are not allowed." }, 403);
    if (rateLimited(request)) return json({ error: "Too many requests. Please try again shortly." }, 429);
    if (!(request.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json")) {
      return json({ error: "JSON content is required." }, 415);
    }
    const body = await request.json() as { messages?: ChatMessage[] };
    const messages = (body.messages ?? [])
      .filter((message) => (message.role === "user" || message.role === "assistant") && typeof message.content === "string")
      .slice(-8)
      .map((message) => ({ ...message, content: message.content.trim().slice(0, 600) }));
    const latest = [...messages].reverse().find((message) => message.role === "user")?.content;
    if (!latest) return json({ error: "A question is required." }, 400);

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return json({ reply: portfolioFallbackAnswer(latest), mode: "portfolio-index" });

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-5.6-luna",
        instructions: SYSTEM_PROMPT,
        input: messages,
        max_output_tokens: 260,
      }),
      signal: AbortSignal.timeout(12_000),
    });
    if (!response.ok) return json({ reply: portfolioFallbackAnswer(latest), mode: "portfolio-index" });
    const reply = outputText(await response.json());
    return json({ reply: reply || portfolioFallbackAnswer(latest), mode: "ai" });
  } catch {
    return json({ error: "Unable to process that question." }, 400);
  }
}
