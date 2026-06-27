import Anthropic from "@anthropic-ai/sdk";
import { getSupabaseServer } from "../../../lib/supabase";
import { buildSystemPrompt } from "../../../lib/prompt";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req) {
  try {
    const { businessId, message, history = [], visitor = {} } = await req.json();

    if (!businessId || !message) {
      return Response.json(
        { error: "businessId and message are required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer();

    const { data: business, error: bizError } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", businessId)
      .single();

    if (bizError || !business) {
      return Response.json({ error: "Business not found" }, { status: 404 });
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

    // Log the exchange so the owner dashboard has something to show.
    await supabase.from("conversations").insert({
      business_id: businessId,
      visitor_name: visitor.name || null,
      visitor_contact: visitor.contact || null,
      user_message: message,
      bot_reply: replyText,
    });

    return Response.json({ reply: replyText });
  } catch (err) {
    console.error("Chat route error:", err);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
