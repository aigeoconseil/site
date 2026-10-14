/* =========================================================
   RÉGLAGE UNIQUE : achat en ligne de l'Audit AIGEO.

   false (par défaut) : les boutons Audit mènent au contact,
     et le parcours affiché est l'achat accompagné.
   true : les boutons Audit mènent à la page d'achat de l'espace,
     et le parcours affiché est compte, projet, puis paiement.

   Ne passer à true qu'après le GO d'ouverture commerciale ET la
   mise en production de /offre-audit149 sur l'espace.
   Après tout changement, régénérer la FAQ (generer-faq.py lit
   cette valeur) pour que son texte et son JSON-LD suivent.
   ========================================================= */
var AIGEO_AUDIT_ACHAT_OUVERT = true;
var AIGEO_AUDIT_ACHAT_URL = 'https://espace.aigeoconseil.com/offre-audit149';

(function () {
  function appliquer() {
    var ouvert = AIGEO_AUDIT_ACHAT_OUVERT === true;
    document.documentElement.setAttribute('data-audit-achat', ouvert ? 'ouvert' : 'ferme');
    var variantes = document.querySelectorAll('[data-audit-parcours]');
    for (var i = 0; i < variantes.length; i++) {
      var v = variantes[i];
      v.hidden = v.getAttribute('data-audit-parcours') !== (ouvert ? 'ouvert' : 'ferme');
    }
    if (!ouvert) return;
    var boutons = document.querySelectorAll('[data-audit-cta]');
    for (var j = 0; j < boutons.length; j++) {
      var b = boutons[j];
      if (b.tagName === 'A') {
        b.setAttribute('href', AIGEO_AUDIT_ACHAT_URL);
      } else {
        b.removeAttribute('onclick');
        b.removeAttribute('data-topic');
        b.onclick = function () { window.location.href = AIGEO_AUDIT_ACHAT_URL; };
      }
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', appliquer);
  } else {
    appliquer();
  }
})();
