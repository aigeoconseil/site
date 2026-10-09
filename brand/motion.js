/* AIGEO motion design (09/10/2026). Sans dépendance. Rien ne se cache si le script échoue : la classe .mo n'est posée qu'ici. */
(function(){
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!('IntersectionObserver' in window)||reduce) return;
  document.documentElement.classList.add('mo');
  var SEL='section h2, .lead, .card, .plan, .post, .feature, .cta-band, .example-score, .faq details, .faq h2, .legal h2, .ptable, .vj, .contact-panel, .person';
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('mo-in');io.unobserve(e.target);}});},{rootMargin:'0px 0px -8% 0px',threshold:.08});
  function scan(root){
    var groups=new Map();
    (root||document).querySelectorAll(SEL).forEach(function(el){
      if(el.classList.contains('mo-r')||el.closest('header')||el.closest('.hero')) return;
      el.classList.add('mo-r');
      var p=el.parentElement,i=groups.get(p)||0; groups.set(p,i+1);
      el.style.setProperty('--mo-d',Math.min(i,5)*90+'ms'); io.observe(el);
    });
  }
  var demo=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('mo-play');demo.unobserve(e.target);}});},{threshold:.35});
  function ready(){
    scan();
    document.querySelectorAll('.test-example').forEach(function(t){demo.observe(t);});
    // Les pages de l'accueil s'affichent par onglet : on rescanne quand un onglet change.
    new MutationObserver(function(ms){if(ms.some(function(m){return m.target.classList&&m.target.classList.contains('page');}))scan();}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['class']});
    // FAQ : ouverture et fermeture fluides
    document.querySelectorAll('.faq details').forEach(function(d){
      var s=d.querySelector('summary'),r=d.querySelector('.rep'); if(!s||!r) return;
      s.addEventListener('click',function(ev){
        ev.preventDefault();
        if(d.open){var h=r.scrollHeight;r.animate([{height:h+'px',opacity:1},{height:'0px',opacity:0}],{duration:260,easing:'ease'}).onfinish=function(){d.open=false;};}
        else{d.open=true;var h2=r.scrollHeight;r.animate([{height:'0px',opacity:0},{height:h2+'px',opacity:1}],{duration:320,easing:'cubic-bezier(.2,.7,.2,1)'});}
      });
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',ready); else ready();
})();
