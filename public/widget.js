(function () {
  // Workly embeddable widget.
  // Drop this on any website with:
  // <script src="https://YOUR-VERCEL-URL.vercel.app/widget.js" data-business="demo"></script>

  const scriptTag = document.currentScript;
  const businessId = scriptTag.getAttribute("data-business") || "demo";
  const apiBase = scriptTag.getAttribute("data-api-base") || new URL(scriptTag.src).origin;

  const INK = "#1B2B44";
  const ACCENT = "#E8A33D";

  const style = document.createElement("style");
  style.textContent = `
    .wk-bubble {
      position: fixed; bottom: 24px; right: 24px; width: 58px; height: 58px;
      border-radius: 50%; background: ${INK}; display: flex; align-items: center;
      justify-content: center; cursor: pointer; z-index: 999999;
      box-shadow: 0 8px 20px -6px rgba(27,43,68,0.5);
      animation: wk-pulse 2.4s infinite; border: none;
    }
    @keyframes wk-pulse {
      0%, 100% { box-shadow: 0 8px 20px -6px rgba(27,43,68,0.5); }
      50% { box-shadow: 0 8px 26px -4px rgba(232,163,61,0.55); }
    }
    .wk-panel {
      position: fixed; bottom: 24px; right: 24px; width: 320px; max-height: 440px;
      background: #fff; border-radius: 14px; box-shadow: 0 20px 50px -12px rgba(27,43,68,0.45);
      display: none; flex-direction: column; overflow: hidden; z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif;
    }
    .wk-panel.wk-open { display: flex; }
    .wk-head { background: ${INK}; color: #fff; padding: 14px 16px; display: flex;
      justify-content: space-between; align-items: center; }
    .wk-head-title { font-size: 14px; font-weight: 600; }
    .wk-head-sub { font-size: 11px; color: #8FA3C2; margin-top: 2px; }
    .wk-close { cursor: pointer; color: #8FA3C2; font-size: 18px; line-height: 1; background: none; border: none; }
    .wk-body { flex: 1; padding: 14px; overflow-y: auto; display: flex; flex-direction: column;
      gap: 10px; background: #F7F8FA; min-height: 220px; }
    .wk-msg { max-width: 85%; padding: 9px 12px; border-radius: 10px; font-size: 13.5px; line-height: 1.45; }
    .wk-msg.wk-bot { background: #fff; border: 1px solid #E3E6EA; align-self: flex-start; color: #26262e; }
    .wk-msg.wk-me { background: ${ACCENT}; color: #1B1304; align-self: flex-end; font-weight: 500; }
    .wk-inputrow { display: flex; gap: 8px; padding: 12px; border-top: 1px solid #E3E6EA; background: #fff; }
    .wk-input { flex: 1; border: 1px solid #D8DCE3; border-radius: 8px; padding: 9px 11px;
      font-size: 13.5px; font-family: inherit; }
    .wk-send { background: ${ACCENT}; border: none; border-radius: 8px; padding: 9px 14px;
      font-weight: 600; font-size: 13px; cursor: pointer; color: #1B1304; }
    .wk-typing { font-size: 12px; color: #9aa1ad; padding-left: 4px; }
  `;
  document.head.appendChild(style);

  const bubble = document.createElement("button");
  bubble.className = "wk-bubble";
  bubble.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 4H20V16H8L4 20V4Z" fill="white"/></svg>`;
  document.body.appendChild(bubble);

  const panel = document.createElement("div");
  panel.className = "wk-panel";
  panel.innerHTML = `
    <div class="wk-head">
      <div>
        <div class="wk-head-title">Chat with us</div>
        <div class="wk-head-sub">Usually replies instantly</div>
      </div>
      <button class="wk-close">&times;</button>
    </div>
    <div class="wk-body" id="wk-body"></div>
    <div class="wk-inputrow">
      <input class="wk-input" id="wk-input" type="text" placeholder="Ask a question..." />
      <button class="wk-send" id="wk-send">Send</button>
    </div>
  `;
  document.body.appendChild(panel);

  const body = panel.querySelector("#wk-body");
  const input = panel.querySelector("#wk-input");
  const sendBtn = panel.querySelector("#wk-send");
  let history = [];
  let greeted = false;

  function addMessage(text, who) {
    const el = document.createElement("div");
    el.className = "wk-msg " + (who === "me" ? "wk-me" : "wk-bot");
    el.textContent = text;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
  }

  async function sendMessage(text) {
    if (!text.trim()) return;
    addMessage(text, "me");
    history.push({ role: "user", content: text });
    input.value = "";

    const typing = document.createElement("div");
    typing.className = "wk-typing";
    typing.textContent = "Typing...";
    body.appendChild(typing);
    body.scrollTop = body.scrollHeight;

    try {
      const res = await fetch(apiBase + "/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, message: text, history: history.slice(0, -1) }),
      });
      const data = await res.json();
      typing.remove();
      if (data.reply) {
        addMessage(data.reply, "bot");
        history.push({ role: "assistant", content: data.reply });
      } else {
        addMessage("Sorry, something went wrong. Please try again.", "bot");
      }
    } catch (e) {
      typing.remove();
      addMessage("Connection error — please try again in a moment.", "bot");
    }
  }

  bubble.addEventListener("click", () => {
    panel.classList.add("wk-open");
    if (!greeted) {
      greeted = true;
      addMessage("Hi! How can I help you today?", "bot");
    }
  });
  panel.querySelector(".wk-close").addEventListener("click", () => panel.classList.remove("wk-open"));
  sendBtn.addEventListener("click", () => sendMessage(input.value));
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") sendMessage(input.value); });
})();