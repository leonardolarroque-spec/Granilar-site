/* Granilar Sul — GA4 agregados (snapshot manual via Supermetrics).
 * Esta página lê apenas o resumo no Supabase com RLS; nenhum token de GA4 fica no navegador.
 */
(() => {
'use strict';
const $=id=>document.getElementById(id);
const int=new Intl.NumberFormat('pt-BR');
let busy=false,seq=0;
const escDate=d=>{
 const m=/^(\d{4})-(\d{2})-(\d{2})/.exec(String(d||''));
 return m?m[3]+'/'+m[2]+'/'+m[1]:'—';
};
function status(text,type='unavailable'){
 const card=document.querySelector('#gbi-root .gbi-integration');
 if(!card)return;
 card.classList.toggle('gbi-connected',type==='ready');
 card.classList.toggle('gbi-unavailable',type!=='ready');
 const badge=card.querySelector('.gbi-integration-head span');
 if(badge)badge.textContent=text;
}
function reset(){
 const root=$('gbi-root');if(!root)return;
 status('Resumo não carregado');
 const tiles=root.querySelectorAll('.gbi-traffic-tile');
 for(const tile of tiles){const value=tile.querySelector('b');if(value){value.textContent='—';value.classList.remove('gbi-traffic-value')}}
 const created=root.querySelectorAll('.gbi-analytics-period,.gbi-analytics-update,.gbi-analytics-detail,.gbi-analytics-foot,.gbi-analytics-error');
 created.forEach(el=>el.remove());
 const note=root.querySelector('.gbi-integration .gbi-explanation');
 if(note)note.textContent='É preciso entrar com uma conta autorizada para consultar os dados agregados de tráfego.';
}
function add(tag,classname,text){
 const e=document.createElement(tag);if(classname)e.className=classname;if(text!==undefined)e.textContent=String(text);return e;
}
function number(v){const n=Number(v);return Number.isFinite(n)&&n>=0?Math.round(n):0}
function pageLabel(path){
 if(path==='/')return 'Página principal';
 if(path==='/decor/'||path==='/decor')return 'Granilar Sul Decor';
 if(String(path||'').startsWith('/projetos/')){
  const part=String(path).split('/').filter(Boolean)[1]||'Projeto';
  return 'Projeto: '+part.replace(/-/g,' ');
 }
 return String(path||'Página');
}
function breakdown(group,list,labelKey,valueKey){
 if(!Array.isArray(list)||!list.length)return;
 const wrap=add('div','gbi-analytics-group');
 wrap.dataset.category=group;
 const title=add('h4','',group==='pages'?'Páginas mais visualizadas':'Origem das sessões');
 wrap.append(title);
 const sorted=list.filter(x=>x&&typeof x==='object')
  .map(x=>({label:group==='pages'?pageLabel(x[labelKey]):String(x[labelKey]||'Outro'),value:number(x[valueKey])}))
  .sort((a,b)=>b.value-a.value).slice(0,4);
 const max=Math.max(1,...sorted.map(x=>x.value));
 for(const it of sorted){
  const line=add('div','gbi-analytics-entry');
  const label=add('span','',it.label),count=add('strong','',int.format(it.value));
  line.append(label,count);
  const track=add('div','gbi-analytics-rail'),fill=add('i');
  fill.style.width=(it.value/max*100).toFixed(2)+'%';
  track.append(fill);wrap.append(line,track);
 }
 return wrap;
}
function show(data){
 if(!data||data.source!=='GA4')throw new Error('Resumo de GA4 indisponível.');
 const root=$('gbi-root'),card=root?.querySelector('.gbi-integration');
 if(!card)return;
 for(const el of card.querySelectorAll('.gbi-analytics-period,.gbi-analytics-update,.gbi-analytics-detail,.gbi-analytics-foot,.gbi-analytics-error'))el.remove();
 status('GA4 · resumo importado','ready');
 const head=card.querySelector('.gbi-integration-head');
 const period=add('p','gbi-analytics-period','Período: '+escDate(data.range_start)+' a '+escDate(data.range_end));
 const stamp=new Date(data.captured_at);
 const stampText=Number.isFinite(stamp.getTime())?
  new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',dateStyle:'short',timeStyle:'short'}).format(stamp):'data não informada';
 const updated=add('p','gbi-analytics-update','Importado em '+stampText+' · atualização manual, não em tempo real');
 if(head){head.after(period);period.after(updated)}
 const values=[number(data.active_users),number(data.whatsapp_clicks),number(data.page_views)];
 const labels=['Usuários ativos','Cliques no WhatsApp','Visualizações de página'];
 const tiles=[...card.querySelectorAll('.gbi-traffic-tile')];
 tiles.forEach((tile,i)=>{
  const val=tile.querySelector('b'),label=tile.querySelector('span');
  if(val){val.textContent=int.format(values[i]??0);val.classList.add('gbi-traffic-value')}
  if(label)label.textContent=labels[i];
 });
 const note=card.querySelector('.gbi-explanation');
 if(note)note.textContent='Dados agregados da propriedade GA4 da Granilar Sul. '+int.format(number(data.sessions))+
  ' sessões e '+int.format(number(data.quote_starts))+
  ' eventos “orcamento_iniciado” no período. Cliques e eventos não comprovam conversas ou vendas.';
 const detail=add('div','gbi-analytics-detail');
 const pages=breakdown('pages',data.page_breakdown,'path','views');
 const channels=breakdown('channels',data.channel_breakdown,'channel','sessions');
 if(pages)detail.append(pages);if(channels)detail.append(channels);
 if(detail.children.length)card.append(detail);
 const foot=add('p','gbi-analytics-foot',
  'Origem: Google Analytics 4 via Supermetrics. Valores de canais podem ter pequenas diferenças de agregação; os indicadores comerciais vêm dos orçamentos no Supabase.');
 card.append(foot);
}
async function refresh(){
 const app=$('app'),api=window.GranilarCommercialAPI;
 if(!app||app.style.display==='none'){seq++;reset();return}
 if(busy||!api||typeof api.analyticsSnapshot!=='function')return;
 busy=true;const order=++seq;
 try{
  const result=await api.analyticsSnapshot();
  if(order!==seq||app.style.display==='none')return;
  if(result?.error)throw new Error(result.error.message||'Falha na consulta');
  if(!result?.data)throw new Error('Ainda não existe um resumo GA4 importado.');
  show(result.data);
 }catch(e){
  if(order!==seq||app.style.display==='none')return;
  status('Não foi possível ler o resumo');
  const card=document.querySelector('#gbi-root .gbi-integration');
  if(card){
    const old=card.querySelector('.gbi-analytics-error');if(old)old.remove();
    const error=add('p','gbi-analytics-error','Resumo temporariamente indisponível. '+(e.message||''));
    card.append(error);
  }
 }finally{busy=false}
}
function init(){
 const app=$('app');if(!app||!$('gbi-root'))return;
 new MutationObserver(()=>{if(app.style.display==='none')reset();else refresh()})
  .observe(app,{attributes:true,attributeFilter:['style']});
 $('gbi-refresh')?.addEventListener('click',refresh);
 window.addEventListener('granilar:quotes-updated',refresh);
 if(app.style.display!=='none')refresh();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();