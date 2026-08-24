// Cloudflare Pages Function — sama seperti api/claim.js (Vercel), tapi format
// Cloudflare. URL-nya tetap /api/claim. Client tidak perlu diubah.
//
// SET DI CLOUDFLARE (Pages > Settings > Environment variables / Secrets):
//   TELEGRAM_BOT_TOKEN = token dari @BotFather
//   TELEGRAM_CHAT_ID   = chat id kamu (angka)
// Untuk `wrangler pages dev` lokal, taruh keduanya di file .dev.vars
// Token TIDAK ada di kode ini, jadi aman walau repo publik.

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const token = env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return json({ ok: false, error: 'not_configured' }, 500);

  let body = {};
  try { body = await request.json(); } catch { body = {}; }
  const name = String(body.name || '').trim().slice(0, 200);
  const addr = String(body.address || '').trim().slice(0, 2000);
  if (!addr) return json({ ok: false, error: 'empty' }, 400);

  const text =
    '🎁 *Klaim Hadiah — Kamar Elvira*\n\n' +
    (name ? ('👤 Nama: ' + name + '\n') : '') +
    '📍 Alamat:\n' + addr;

  try {
    const r = await fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
    });
    const j = await r.json().catch(() => ({}));
    return json({ ok: !!(r.ok && j.ok) }, (r.ok && j.ok) ? 200 : 502);
  } catch (e) {
    return json({ ok: false, error: 'network' }, 500);
  }
}
