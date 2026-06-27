"use client";

import { useState } from "react";

// Quick internal test page — not the real embeddable widget yet.
// Use this on Day 1 to confirm: Next.js -> Supabase -> Claude all work together.
// businessId "demo" must exist in your `businesses` table (see supabase/schema.sql).

export default function TestPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: "demo",
          message: userMsg.content,
          history: messages,
        }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
      } else {
        setMessages([...nextMessages, { role: "assistant", content: `Error: ${data.error}` }]);
      }
    } catch (err) {
      setMessages([...nextMessages, { role: "assistant", content: "Network error — check console." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 480, margin: "60px auto", padding: 20 }}>
      <h1>Workly — Day 1 test</h1>
      <p style={{ color: "#666", fontSize: 14 }}>
        Talking to businessId <code>demo</code>. Confirms the chat API,
        Supabase logging, and Claude are wired up correctly.
      </p>
      <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, minHeight: 200, marginBottom: 12 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ margin: "8px 0", textAlign: m.role === "user" ? "right" : "left" }}>
            <span
              style={{
                display: "inline-block",
                padding: "8px 12px",
                borderRadius: 8,
                background: m.role === "user" ? "#1B2B44" : "#f0f0f0",
                color: m.role === "user" ? "#fff" : "#000",
                maxWidth: "80%",
              }}
            >
              {m.content}
            </span>
          </div>
        ))}
        {loading && <p style={{ color: "#999" }}>Thinking…</p>}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask about hours, pricing..."
          style={{ flex: 1, padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
        />
        <button onClick={send} style={{ padding: "10px 16px", borderRadius: 6, border: "none", background: "#E8A33D", fontWeight: 600 }}>
          Send
        </button>
      </div>
    </main>
  );
}
