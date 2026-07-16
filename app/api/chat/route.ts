import { NextResponse } from "next/server";

import { PORTFOLIO_CONTEXT, portfolioFallbackAnswer } from "@/lib/portfolio-context";

type ChatMessage = { role: "user" | "assistant"; content: string };

const SYSTEM_PROMPT = `You are Sonal Hegde's portfolio assistant. Answer only questions about Sonal's verified background, projects, skills, education, certifications, availability, résumé, and contact information. Be concise, warm, and factual. Never invent missing dates, metrics, credential links, or personal facts. If the answer is not in the supplied context, say that it is not listed and suggest contacting Sonal.\n\nVERIFIED PORTFOLIO CONTEXT:\n${PORTFOLIO_CONTEXT}`;

function outputText(payload: unknown) {
  if (!payload || typeof payload !== "object") return "";
  const response = payload as { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> };
  return response.output_text ?? response.output?.flatMap((item) => item.content ?? []).map((item) => item.text ?? "").join("").trim() ?? "";
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { messages?: ChatMessage[] };
    const messages = (body.messages ?? [])
      .filter((message) => (message.role === "user" || message.role === "assistant") && typeof message.content === "string")
      .slice(-8)
      .map((message) => ({ ...message, content: message.content.trim().slice(0, 600) }));
    const latest = [...messages].reverse().find((message) => message.role === "user")?.content;
    if (!latest) return NextResponse.json({ error: "A question is required." }, { status: 400 });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ reply: portfolioFallbackAnswer(latest), mode: "portfolio-index" });

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-5.6-luna",
        instructions: SYSTEM_PROMPT,
        input: messages,
        max_output_tokens: 260,
      }),
    });
    if (!response.ok) return NextResponse.json({ reply: portfolioFallbackAnswer(latest), mode: "portfolio-index" });
    const reply = outputText(await response.json());
    return NextResponse.json({ reply: reply || portfolioFallbackAnswer(latest), mode: "ai" });
  } catch {
    return NextResponse.json({ error: "Unable to process that question." }, { status: 400 });
  }
}
