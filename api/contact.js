// Formulaire de contact du site : envoie le message par Brevo vers contact@aigeoconseil.com.
// Rien n'est stocké. Clé attendue dans la variable d'environnement Vercel BREVO_API_KEY.
const TO = 'contact@aigeoconseil.com';
const hits = new Map(); // limite indicative par instance : 5 envois par heure et par adresse

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false }); }
  const origin = req.headers.origin || '';
  const okOrigin = /^https:\/\/(www\.)?aigeoconseil\.com$/.test(origin) || (process.env.VERCEL_ENV === 'preview' && /^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin));
  if (origin && !okOrigin) return res.status(403).json({ ok: false });

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'inconnue';
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 3600e3);
  if (recent.length >= 5) return res.status(429).json({ ok: false, error: 'too_many' });
  recent.push(now); hits.set(ip, recent);

  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = {}; } }
  b = b || {};
  if (b.website) return res.status(200).json({ ok: true }); // piège anti-robots, rien n'est envoyé

  const line = (v, n) => String(v || '').replace(/[\r\n]+/g, ' ').trim().slice(0, n);
  const topic = line(b.topic, 80), brand = line(b.brand, 120), email = line(b.email, 254);
  const message = String(b.message || '').trim().slice(0, 4000);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 5) return res.status(400).json({ ok: false, error: 'invalid' });

  const key = process.env.BREVO_API_KEY;
  if (!key) return res.status(503).json({ ok: false, error: 'not_configured' });

  try {
    const r = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': key, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        sender: { name: 'Site AIGEO', email: 'espace@aigeoconseil.com' },
        to: [{ email: TO }],
        replyTo: { email },
        subject: `[Site] ${topic || 'Message'} · ${brand || email}`,
        textContent: `Demande : ${topic}\nMarque : ${brand}\nEmail : ${email}\n\n${message}\n\nEnvoyé depuis le formulaire de aigeoconseil.com. Le site n'en garde aucune copie.`,
      }),
    });
    if (!r.ok) return res.status(502).json({ ok: false, error: 'send_failed' });
  } catch {
    return res.status(502).json({ ok: false, error: 'send_failed' });
  }
  return res.status(200).json({ ok: true });
};
