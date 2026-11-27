/*
 * Black Friday 2026 (décision de Georges, 27/11 07:21) : l'Audit à 74,50 € au lieu de 149 €
 * avec le code BLACKFRIDAY50, jusqu'au 27/11/2026 à 23:59 (Paris).
 * Sans JavaScript, ou après la date de fin, la page affiche le prix normal : rien à retirer à la main.
 */
(function () {
  var FIN = Date.parse("2026-11-27T23:59:00+01:00");
  if (!(Date.now() < FIN)) return;

  var css =
    ".bf-bandeau{position:relative;z-index:50;background:#121216;color:#fff;text-align:center;padding:10px 16px;font:500 15px/1.4 var(--font-body,system-ui)}" +
    ".bf-bandeau b{font-family:var(--font-title,system-ui);letter-spacing:.02em}" +
    ".bf-bandeau .bf-code{display:inline-block;margin-left:6px;padding:1px 8px;border:1px dashed #E0432E;border-radius:6px;color:#fff;font-weight:700;letter-spacing:.06em}" +
    ".bf-prix{display:inline-flex;align-items:baseline;gap:.45em;flex-wrap:wrap}" +
    ".bf-ancien{position:relative;color:var(--muted,#6B6B73);font-weight:500;text-decoration:none;white-space:nowrap}" +
    ".bf-ancien::after{content:'';position:absolute;left:-4%;right:-4%;top:52%;height:2px;background:#E0432E;transform:rotate(-8deg);border-radius:2px}" +
    ".bf-nouveau{color:#E0432E;font-weight:700;white-space:nowrap}" +
    ".bf-mention{display:block;font-size:.8em;font-weight:500;color:#E0432E;margin-top:2px}";
  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  var bandeau = document.createElement("div");
  bandeau.className = "bf-bandeau";
  bandeau.setAttribute("role", "note");
  bandeau.innerHTML =
    "<b>Black Friday</b> : l'Audit AIGEO à <strong>74,50 €</strong> au lieu de 149 €, aujourd'hui jusqu'à minuit, avec le code" +
    "<span class=\"bf-code\">BLACKFRIDAY50</span> sur la page de paiement.";
  document.body.insertBefore(bandeau, document.body.firstChild);

  var prix = document.querySelectorAll("[data-prix-audit]");
  for (var i = 0; i < prix.length; i++) {
    var el = prix[i];
    var mention = el.hasAttribute("data-prix-mention")
      ? "<span class=\"bf-mention\">Aujourd'hui jusqu'à minuit, code BLACKFRIDAY50</span>"
      : "";
    el.innerHTML =
      "<span class=\"bf-prix\"><span class=\"bf-ancien\" aria-label=\"Prix habituel 149 euros\">149 €</span>" +
      "<span class=\"bf-nouveau\">74,50 €</span></span>" + mention;
  }

  // Décision de Georges (27/11 07:35) : pour un Audit payé 74,50 €, seul le montant payé est déduit.
  var deductions = document.querySelectorAll("[data-bf-deduction]");
  for (var j = 0; j < deductions.length; j++) {
    deductions[j].textContent = "Le montant payé pour l'Audit (74,50 € avec le code BLACKFRIDAY50) est déduit";
  }
})();
