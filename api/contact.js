// Vercel serverless function (used automatically when you deploy to Vercel).
// Set RESEND_API_KEY (and optionally CONTACT_TO / CONTACT_FROM) in Vercel → Settings → Environment Variables.
import handler from "../lib/contact-handler.cjs";
export default handler;
