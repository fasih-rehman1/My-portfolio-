/* Contact form -> Resend. Runs on the server only, so the API key is never sent to the browser.
   Used by server.cjs (Node hosting), api/contact.js (Vercel) and the Vite dev server. */
const hits = new Map();
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

module.exports = async function contact(req, res) {
  const send = (code, body) => res.status(code).json(body);
  if (req.method !== "POST") return send(405, { ok: false, message: "Method not allowed" });

  // very small rate limit: 5 messages / 10 minutes / IP
  const ip = (req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "x").toString().split(",")[0].trim();
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 600000);
  if (recent.length >= 5) return send(429, { ok: false, message: "Too many messages. Please try again later." });

  let b = req.body;
  if (typeof b === "string") { try { b = JSON.parse(b); } catch { b = {}; } }
  b = b || {};
  if (b._honey) return send(200, { ok: true }); // bot

  const name = String(b.name || "").trim().slice(0, 120);
  const email = String(b.email || "").trim().slice(0, 200);
  const subject = String(b.subject || "").trim().slice(0, 160) || "New message from your portfolio";
  const message = String(b.message || "").trim().slice(0, 6000);
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || message.length < 10) {
    return send(400, { ok: false, message: "Please add your name, a valid email and a message." });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) return send(503, { ok: false, message: "Email service is not configured." });
  const to = process.env.CONTACT_TO || "fasihurrehman7283@gmail.com";
  const from = process.env.CONTACT_FROM || "Portfolio <onboarding@resend.dev>";

  const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #e5ddcd;border-radius:14px;overflow:hidden">
    <div style="background:#1F4E46;color:#F7F2E9;padding:18px 22px"><b style="font-size:16px">New portfolio message</b></div>
    <div style="padding:22px;color:#1E1A16;font-size:15px;line-height:1.6">
      <p style="margin:0 0 4px"><b>From:</b> ${esc(name)} &lt;${esc(email)}&gt;</p>
      <p style="margin:0 0 16px"><b>Subject:</b> ${esc(subject)}</p>
      <div style="background:#F7F2E9;border-radius:10px;padding:14px 16px;white-space:pre-wrap">${esc(message)}</div>
      <p style="margin:18px 0 0;color:#645A4F;font-size:13px">Reply to this email to answer ${esc(name)} directly.</p>
    </div></div>`;

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from, to: [to], reply_to: email,
        subject: `Portfolio: ${subject} — ${name}`,
        html,
        text: `From: ${name} <${email}>\nSubject: ${subject}\n\n${message}`
      })
    });
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      console.error("Resend error", r.status, t);
      return send(502, { ok: false, message: "Could not send the email." });
    }
    hits.set(ip, [...recent, now]);
    return send(200, { ok: true });
  } catch (e) {
    console.error("Resend failed", e);
    return send(502, { ok: false, message: "Could not send the email." });
  }
};
