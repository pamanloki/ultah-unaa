// Vercel Serverless Function — nerima form "klaim hadiah" dari halaman,
// lalu ngirim isinya ke Telegram lewat Bot API.
//
// SET DI VERCEL (Project > Settings > Environment Variables):
//   TELEGRAM_BOT_TOKEN = token dari @BotFather
//   TELEGRAM_CHAT_ID   = chat id kamu (angka; cek via @userinfobot)
// Token TIDAK ada di kode ini, jadi aman walau repo publik.

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method' });
    return;
  }
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    res.status(500).json({ ok: false, error: 'not_configured' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};
  const name = String(body.name || '').trim().slice(0, 200);
  const addr = String(body.address || '').trim().slice(0, 2000);
  if (!addr) { res.status(400).json({ ok: false, error: 'empty' }); return; }

  const text =
    '🎁 *Klaim Hadiah — Kamar Elvira*\n\n' +
    (name ? ('👤 Nama: ' + name + '\n') : '') +
    '📍 Alamat:\n' + addr;

  try {
    const r = await fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' })
    });
    const j = await r.json().catch(() => ({}));
    if (r.ok && j.ok) { res.status(200).json({ ok: true }); }
    else { res.status(502).json({ ok: false, error: 'telegram' }); }
  } catch (e) {
    res.status(500).json({ ok: false, error: 'network' });
  }
};
