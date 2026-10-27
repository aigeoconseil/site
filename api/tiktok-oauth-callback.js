// HTTPS ingress for the owner's local n8n OAuth callback. No token exchange,
// account access, external destination, logging, storage, or publication here.
// n8n remains responsible for verifying its signed, single-use OAuth state.
const LOCAL_CALLBACK = 'http://localhost:5678/rest/oauth2-credential/callback';
module.exports = function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).end('Méthode non autorisée.'); }
  const query = new URL(req.url, 'https://aigeoconseil.com').searchParams;
  const allowed = new Set(['code', 'auth_code', 'state', 'error', 'error_description']);
  if ([...query.keys()].some(k => !allowed.has(k) || query.getAll(k).length !== 1)) return res.status(400).end('Retour d’autorisation invalide.');
  if (query.has('error')) return res.status(400).end('Autorisation TikTok refusée ou annulée. Aucun compte connecté.');
  const code = query.get('code') || query.get('auth_code');
  const state = query.get('state');
  const safe = s => typeof s === 'string' && s.length > 0 && s.length <= 8192 && !/[\u0000-\u0020\u007f]/.test(s);
  if ((query.has('code') && query.has('auth_code')) || !safe(code) || !safe(state)) return res.status(400).end('Retour TikTok prêt. Aucune autorisation reçue. Initiez la connexion depuis le n8n local du propriétaire.');
  const target = new URL(LOCAL_CALLBACK);
  target.searchParams.set('code', code);
  target.searchParams.set('state', state);
  res.setHeader('Location', target.toString());
  return res.status(302).end('Retour vers le n8n local du propriétaire.');
};
