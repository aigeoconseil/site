// Formulaire « Décrire mon projet » de la page Services (CRM et site internet) : ouverture, validation, envoi.
// Aucun secret ici : l'adresse d'envoi est publique et sans clé. Textes et champs : générés dans la page.
(() => {
  const d = document.getElementById('projet');
  if (!d || typeof d.showModal !== 'function') return;
  const cfg = JSON.parse(document.getElementById('projet-config').textContent);
  const titre = document.getElementById('projet-titre');
  const merci = d.querySelector('[data-merci]');
  let opener = null, form = null;

  const open = (v, btn) => {
    opener = btn;
    d.querySelectorAll('form[data-version]').forEach((f) => { f.hidden = f.dataset.version !== v; });
    form = d.querySelector(`form[data-version="${v}"]`);
    if (!form) return;
    titre.textContent = form.dataset.titre;
    merci.hidden = true;
    d.showModal();
    d.scrollTop = 0;
    form.querySelector('input:not([type=hidden])').focus();
  };
  document.querySelectorAll('[data-projet]').forEach((b) => b.addEventListener('click', () => open(b.dataset.projet, b)));
  d.querySelector('[data-fermer]').addEventListener('click', () => d.close());
  d.addEventListener('close', () => { if (opener) opener.focus(); });

  // « Je n'ai pas encore de site » : l'adresse devient inutile
  d.querySelectorAll('input[data-aucun]').forEach((u) => {
    const c = document.getElementById(u.dataset.aucun);
    c.addEventListener('change', () => { u.disabled = c.checked; u.required = !c.checked; if (c.checked) u.value = ''; });
  });

  const status = (f, msg) => { const s = f.querySelector('.pj-status'); s.textContent = msg || ''; s.hidden = !msg; };
  const collect = (f) => {
    const fd = new FormData(f), reponses = {};
    for (const [k, v] of fd.entries()) {
      if (['nom', 'email', 'telephone', 'consentement', 'website'].includes(k)) continue;
      const val = String(v).trim();
      if (!val) continue;
      if (k in reponses) reponses[k] = [].concat(reponses[k], val); else reponses[k] = val;
    }
    for (const k of ['modules', 'fonctions', 'difficultes']) if (typeof reponses[k] === 'string') reponses[k] = [reponses[k]];
    return {
      service: f.dataset.version, reponses,
      contact: { nom: String(fd.get('nom') || '').trim(), email: String(fd.get('email') || '').trim(), telephone: String(fd.get('telephone') || '').trim() },
      consentement: fd.get('consentement') === 'oui', page: '/services/', website: String(fd.get('website') || ''), captcha: '',
    };
  };

  // Captcha Turnstile invisible : script Cloudflare chargé seulement au premier envoi, et seulement si une clé de site est posée
  let tsLoad = null;
  const loadTurnstile = () => tsLoad || (tsLoad = new Promise((ok, ko) => {
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    s.async = true; s.onload = () => (window.turnstile ? ok(window.turnstile) : ko()); s.onerror = () => { tsLoad = null; ko(); };
    document.head.appendChild(s);
  }));
  const captcha = async (f) => {
    if (!cfg.turnstile) return '';
    const ts = await loadTurnstile();
    return new Promise((ok, ko) => {
      const t = setTimeout(() => ko(new Error('captcha')), 15000);
      let box = f.querySelector('.pj-ts');
      if (!box) { box = document.createElement('div'); box.className = 'pj-ts'; f.querySelector('.pj-actions').before(box); }
      if (box.dataset.id) ts.remove(box.dataset.id);
      box.dataset.id = ts.render(box, { sitekey: cfg.turnstile, execution: 'execute', appearance: 'interaction-only', language: 'fr',
        callback: (tok) => { clearTimeout(t); ok(tok); }, 'error-callback': () => { clearTimeout(t); ko(new Error('captcha')); } });
      ts.execute(box);
    });
  };

  d.querySelectorAll('form[data-version]').forEach((f) => f.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    status(f, '');
    if (!f.checkValidity()) {
      const bad = f.querySelector(':invalid');
      f.reportValidity();
      if (bad) bad.focus();
      return;
    }
    const btn = f.querySelector('button[type=submit]');
    btn.disabled = true; btn.textContent = cfg.envoi;
    let ok = false;
    if (cfg.endpoint) {
      const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 15000);
      try {
        const body = collect(f); body.captcha = await captcha(f);
        const r = await fetch(cfg.endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), signal: ctl.signal, credentials: 'omit', mode: 'cors' });
        ok = r.ok;
      } catch { ok = false; } finally { clearTimeout(t); }
    }
    btn.disabled = false; btn.textContent = cfg.envoyer;
    if (!ok) { status(f, cfg.erreur); return; }
    f.hidden = true; f.reset(); merci.hidden = false; merci.focus(); d.scrollTop = 0;
  }));
})();
