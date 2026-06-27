import Anthropic from "@anthropic-ai/sdk";
import { getSupabaseServer } from "../../../lib/supabase";
import { buildSystemPrompt } from "../../../lib/prompt";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Widgets get embedded on client websites (a different domain than this
// app), so the browser needs explicit permission to call this API from there.
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req) {
  try {
    const { businessId, message, history = [], visitor = {} } = await req.json();

    if (!businessId || !message) {
      return Response.json(
        { error: "businessId and message are required" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const supabase = getSupabaseServer();

    const { data: business, error: bizError } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", businessId)
      .single();

    if (bizError || !business) {
      return Response.json({ error: "Business not found" }, { status: 404, headers: CORS_HEADERS });
    }

    const systemPrompt = buildSystemPrompt(business);

    const claudeMessages = [
      ...history.map((h) => ({ role: h.role, content: h.content })),
      { role: "user", content: message },
    ];

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 400,
      system: systemPrompt,
      messages: claudeMessages,
    });

    const replyText = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    await supabase.from("conversations").insert({
      business_id: businessId,
      visitor_name: visitor.name || null,
      visitor_contact: visitor.contact || null,
      user_message: message,
      bot_reply: replyText,
    });

    return Response.json({ reply: replyText }, { headers: CORS_HEADERS });
  } catch (err) {
    console.error("Chat route error:", err);
    return Response.json({ error: "Something went wrong" }, { status: 500, headers: CORS_HEADERS });
  }
}