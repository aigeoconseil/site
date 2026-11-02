// Forward only campaign labels already in the current URL. No cookies, storage or network beacon.
(function(){
 const keys=['utm_source','utm_medium','utm_campaign','utm_id','utm_content'];
 window.aigeoCampaignDestination=function(value){
  const target=new URL(value,location.origin);
  if(target.origin!=='https://app.aigeoconseil.com'||target.pathname!=='/scan') return target.toString();
  const incoming=new URLSearchParams(location.search);
  const labels={};
  if(keys.some(k=>incoming.getAll(k).length!==1)) return target.toString();
  for(const k of keys){const v=incoming.get(k);if(!v||v.length>128||!/^[a-z0-9_-]+$/i.test(v)) return target.toString();labels[k]=v;}
  for(const k of keys) if(!target.searchParams.has(k)) target.searchParams.set(k,labels[k]);
  return target.toString();
 };
 document.querySelectorAll('a[href]').forEach(a=>{try{a.href=window.aigeoCampaignDestination(a.href);}catch{}});
})();
