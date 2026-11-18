
/* Granilar Sul — Inteligência Comercial V1
   Fontes: propostas Supabase com RLS + campos informados manualmente.
   NÃO inventa visitas, cliques de GA4 nem vendas confirmadas.
*/
(() => {
 'use strict';
 const money=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:2});
 const integer=new Intl.NumberFormat('pt-BR',{maximumFractionDigits:0});
 const sourceNames={google_ads:'Google Ads',site:'Site / orgânico',instagram:'Instagram',indicacao:'Indicação',whatsapp:'WhatsApp direto',outros:'Outros'};
 const statusNames={rascunho:'Rascunho',enviado:'Enviado',aprovado:'Aprovado',recusado:'Recusado'};
 const pageSize=400,maxPages=8;
 let allRows=[],reloading=false,queued=false,initialized=false,sampled=false,everLoaded=false;
 const $=id=>document.getElementById(id);
 function decimal(v){
   if(typeof v==='number')return Number.isFinite(v)&&v>0?v:0;
   let s=String(v??'').trim().replace(/[\sR$]/gi,'');
   if(!s)return 0;
   if(s.includes(','))s=s.replace(/\./g,'').replace(',','.');
   const n=Number(s);return Number.isFinite(n)&&n>0?n:0;
 }
 function totalValue(q){
   const cents=(Array.isArray(q.items)?q.items:[]).reduce((sum,item)=>{
     const qnt=decimal(item?.quantity),price=Math.round(decimal(item?.price)*100);
     return sum+Math.round(qnt*price);
   },0)+Math.round(decimal(q.shipping)*100)-Math.round(decimal(q.discount)*100);
   return Math.max(0,cents)/100;
 }
 function dateValue(value){const t=Date.parse(String(value||''));return Number.isFinite(t)?t:0}
 function todayISO(){
   const d=new Date();
   return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
 }
 function toDate(date){
   if(!date)return '';
   const m=/^(\d{4})-(\d{2})-(\d{2})/.exec(String(date));
   return m?m[3]+'/'+m[2]+'/'+m[1]:'—';
 }
 function filterByRange(list){
   const val=$('gbi-period')?.value||'90';
   if(val==='all')return list;
   const n=Math.max(1,Number(val)||90),cutoff=new Date();
   cutoff.setHours(0,0,0,0);cutoff.setDate(cutoff.getDate()-n+1);
   const time=cutoff.getTime();
   return list.filter(q=>dateValue(q.created_at)>=time);
 }
 function statusText(text,type='ok'){
   const node=$('gbi-status');if(!node)return;
   node.textContent=text;node.dataset.status=type;
 }
 function setText(id,value){const el=$(id);if(el)el.textContent=value}
 function ui(){
   const intro=$('inicio');if(!intro||$('gbi-root'))return Boolean($('gbi-root'));
   const top=intro.querySelector('.gs-overview-head');
   if(!top)return false;
   const root=document.createElement('section');root.id='gbi-root';root.setAttribute('aria-label','Inteligência Comercial da Granilar Sul');
   root.innerHTML=`
     <div class="gbi-periodbar">
       <div><span class="gbi-eyebrow">CENTRAL DE RESULTADOS</span>
       <h2 class="gbi-section-title">O que merece sua atenção hoje</h2>
       <p class="gbi-description">Propostas reais da equipe, sem estimativas de vendas ou visitantes.</p></div>
       <div class="gbi-period-actions">
        <label for="gbi-period">Período</label>
        <select id="gbi-period" class="gbi-period-select" aria-label="Período dos indicadores">
         <option value="30">Últimos 30 dias</option><option value="90" selected>Últimos 90 dias</option><option value="all">Todo o histórico</option>
        </select>
        <button class="gbi-refresh" type="button" id="gbi-refresh">↻ Atualizar</button>
       </div>
     </div>
     <div id="gbi-status" class="gbi-status" role="status" aria-live="polite" data-status="loading">Aguardando dados da equipe...</div>
     <div class="gbi-kpis">
       <article class="gbi-kpi" data-tone="neutral"><span class="gbi-icon" aria-hidden="true">▤</span><small>Orçamentos cadastrados</small><strong id="gbi-total">—</strong><span class="gbi-unit">No período selecionado</span></article>
       <article class="gbi-kpi"><span class="gbi-icon" aria-hidden="true">↗</span><small>Enviados sem decisão</small><strong id="gbi-sent">—</strong><span class="gbi-unit">Propostas em acompanhamento</span></article>
       <article class="gbi-kpi" data-tone="blue"><span class="gbi-icon" aria-hidden="true">R$</span><small>Valor em negociação</small><strong id="gbi-pipeline-value">—</strong><span class="gbi-unit">Somente propostas com status enviado</span></article>
       <article class="gbi-kpi" data-tone="neutral"><span class="gbi-icon" aria-hidden="true">✓</span><small>Propostas aprovadas</small><strong id="gbi-approved">—</strong><span class="gbi-unit" id="gbi-approved-sub">Aprovação não significa pagamento</span></article>
     </div>
     <div class="gbi-columns">
       <section class="gbi-card gbi-col-5" aria-labelledby="gbi-pipeline-title">
         <div class="gbi-cardhead"><div><h3 id="gbi-pipeline-title" class="gbi-section-title">Etapas das propostas</h3><p class="gbi-description">Distribuição por situação.</p></div><span class="gbi-pill" id="gbi-total-count">—</span></div>
         <div id="gbi-pipeline-bars" class="gbi-bars"></div>
         <div class="gbi-rate"><strong id="gbi-rate">—</strong><span>Taxa de aprovação sobre propostas com decisão registrada (aprovadas + recusadas), no período selecionado.</span></div>
       </section>
       <section class="gbi-card gbi-col-7" aria-labelledby="gbi-followup-title">
         <div class="gbi-cardhead"><div><h3 id="gbi-followup-title" class="gbi-section-title">Próximos acompanhamentos</h3><p class="gbi-description">Todos os períodos · propostas ainda sem decisão.</p></div><button id="gbi-view-all" class="gbi-softlink" type="button">Ver orçamentos →</button></div>
         <div id="gbi-todo" class="gbi-todo"><div class="gbi-empty">Carregando os acompanhamentos...</div></div>
       </section>
       <section class="gbi-card gbi-col-6" aria-labelledby="gbi-source-title">
         <div class="gbi-cardhead"><div><h3 id="gbi-source-title" class="gbi-section-title">Origem das oportunidades</h3><p class="gbi-description">Informada manualmente nos orçamentos.</p></div></div>
         <div id="gbi-sources" class="gbi-sources"><div class="gbi-empty">Carregando origens...</div></div>
         <p class="gbi-disclaimer">Não é atribuição automática de campanhas. Preencha “Origem do contato” no orçamento para acompanhar esta distribuição.</p>
       </section>
       <section class="gbi-card gbi-col-6" aria-labelledby="gbi-digital-title">
         <div class="gbi-cardhead"><div><h3 id="gbi-digital-title" class="gbi-section-title">Resultados do site</h3><p class="gbi-description">Acompanhe a etapa digital separadamente.</p></div></div>
         <div class="gbi-integration">
           <div class="gbi-integration-head"><strong>Google Analytics 4</strong><span>Integração de relatórios pendente</span></div>
           <div class="gbi-traffic-grid">
             <div class="gbi-traffic-tile"><b>—</b><span>Visitantes</span></div>
             <div class="gbi-traffic-tile"><b>—</b><span>Cliques WhatsApp</span></div>
             <div class="gbi-traffic-tile"><b>—</b><span>Projetos visualizados</span></div>
           </div>
           <p class="gbi-explanation">O site já registra interações na camada de dados. Para mostrar números reais aqui, precisamos conectar uma fonte de relatórios GA4 e configurar as tags e os acionadores no GTM.</p>
           <div class="gbi-links">
            <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer">Abrir GA4 ↗</a>
            <a href="https://tagmanager.google.com/" target="_blank" rel="noopener noreferrer">Abrir Tag Manager ↗</a>
           </div>
         </div>
       </section>
     </div>
     <p class="gbi-disclaimer" id="gbi-scope">Os números representam propostas cadastradas na Granilar Sul; propostas aprovadas não são vendas faturadas. Não substituem a análise financeira.</p>
   `;
   top.after(root);
   intro.classList.add('gs-bi-mounted');
   const oldHeading=top.querySelector('h2'),oldText=top.querySelector('p');
   if(oldHeading)oldHeading.textContent='Bem-vindo à central de decisões.';
   if(oldText)oldText.textContent='Acompanhe suas propostas, identifique pendências e priorize os próximos contatos.';
   $('gbi-period').addEventListener('change',render);
   $('gbi-refresh').addEventListener('click',refresh);
   $('gbi-view-all').addEventListener('click',()=>{
     document.querySelector('.gs-nav-item[data-page="archive"]')?.click();
   });
   return true;
 }
 function renderBars(quotes){
   const container=$('gbi-pipeline-bars');container.replaceChildren();
   const total=quotes.length||1;
   for(const status of ['rascunho','enviado','aprovado','recusado']){
     const n=quotes.filter(q=>q.status===status).length;
     const row=document.createElement('div');row.className='gbi-bar-line';row.dataset.kind=status;
     const name=document.createElement('span');name.textContent=statusNames[status];
     const track=document.createElement('div');track.className='gbi-bar-track';
     const fill=document.createElement('div');fill.className='gbi-bar-fill';fill.style.width=(n/total*100).toFixed(2)+'%';
     const count=document.createElement('strong');count.textContent=integer.format(n);
     track.append(fill);row.append(name,track,count);container.append(row);
   }
   const decided=quotes.filter(q=>q.status==='aprovado'||q.status==='recusado');
   const approved=decided.filter(q=>q.status==='aprovado').length;
   setText('gbi-rate',decided.length?Math.round(approved/decided.length*100)+'%':'—');
 }
 function renderSources(quotes){
   const container=$('gbi-sources');container.replaceChildren();
   if(!quotes.length){empty(container,'Ainda não há propostas neste período.');return}
   const counts=new Map();
   for(const q of quotes){
     const source=Object.prototype.hasOwnProperty.call(sourceNames,q.lead_source)?q.lead_source:'nao_informada';
     counts.set(source,(counts.get(source)||0)+1);
   }
   const rows=[...counts.entries()].sort((a,b)=>b[1]-a[1]);
   for(const [source,n] of rows){
     const row=document.createElement('div');row.className='gbi-source-row';
     const label=document.createElement('span');label.textContent=sourceNames[source]||'Não informada';
     const track=document.createElement('div');track.className='gbi-source-track';
     const fill=document.createElement('i');fill.style.width=(n/quotes.length*100).toFixed(2)+'%';track.append(fill);
     const count=document.createElement('b');count.textContent=integer.format(n);
     row.append(label,track,count);container.append(row);
   }
 }
 function empty(container,message){
   const e=document.createElement('div');e.className='gbi-empty';e.textContent=message;container.append(e);
 }
 function renderTodo(){
   const list=$('gbi-todo');list.replaceChildren();
   const today=todayISO();
   const open=allRows.filter(q=>q.status==='rascunho'||q.status==='enviado');
   const next=open.filter(q=>q.next_followup_on);
   const missing=open.filter(q=>q.status==='enviado'&&!q.next_followup_on);
   const sorted=[...next].sort((a,b)=>String(a.next_followup_on).localeCompare(String(b.next_followup_on)))
     .concat(missing.sort((a,b)=>dateValue(b.updated_at)-dateValue(a.updated_at)));
   if(!sorted.length){empty(list,'Nenhuma proposta aguardando acompanhamento. Ao enviar um orçamento, defina a data do próximo contato para organizar a agenda.');return}
   for(const q of sorted.slice(0,6)){
     const row=document.createElement('div');row.className='gbi-todo-row';
     const left=document.createElement('div');
     const name=document.createElement('strong');name.textContent=(q.client_name||'Cliente')+' · #'+q.number;
     const details=document.createElement('small');
     const status=statusNames[q.status]||q.status,when=q.next_followup_on;
     const date=when?toDate(when):'Sem data de retorno';
     details.textContent=status+' · '+date;
     if(when&&when<today)details.className='gbi-followup-overdue';
     else if(when&&when===today)details.className='gbi-followup-today';
     left.append(name,details);
     const side=document.createElement('div');side.className='gbi-todo-side';
     const val=document.createElement('b');val.textContent=money.format(totalValue(q));
     const button=document.createElement('button');button.type='button';button.textContent='Abrir';
     button.setAttribute('aria-label','Abrir orçamento número '+q.number);
     button.addEventListener('click',async()=>{
       button.disabled=true;const label=button.textContent;button.textContent='Abrindo…';
       try{
         const result=await window.GranilarCommercialAPI.openQuote(q.id);
         if(result?.error)throw new Error(result.error.message||'Erro ao abrir');
       }catch(err){statusText('Não foi possível abrir o orçamento: '+(err.message||err),'error')}
       finally{button.disabled=false;button.textContent=label}
     });
     side.append(val,button);row.append(left,side);list.append(row);
   }
   if(sorted.length>6){
     const note=document.createElement('div');note.className='gbi-disclaimer';
     note.textContent='Mais '+(sorted.length-6)+' proposta(s) aguardam análise. Veja todas no histórico.';list.append(note);
   }
 }
 function render(){
   if(!initialized||!everLoaded)return;
   const rows=filterByRange(allRows),sent=rows.filter(q=>q.status==='enviado');
   const approved=rows.filter(q=>q.status==='aprovado');
   setText('gbi-total',integer.format(rows.length));
   setText('gbi-sent',integer.format(sent.length));
   setText('gbi-pipeline-value',money.format(sent.reduce((sum,q)=>sum+totalValue(q),0)));
   setText('gbi-approved',integer.format(approved.length));
   setText('gbi-approved-sub',money.format(approved.reduce((sum,q)=>sum+totalValue(q),0))+' em propostas aprovadas');
   setText('gbi-total-count',integer.format(rows.length)+' propostas');
   setText('gbi-scope',sampled?
     'Foram analisadas até '+integer.format(maxPages*pageSize)+' propostas mais recentes. Os indicadores podem estar incompletos; consulte a base integral para um fechamento definitivo.':
     'Valores de propostas, não faturamento. A taxa de aprovação considera apenas propostas com decisão; visitantes dependem de conexão ao GA4.');
   renderBars(rows);renderSources(rows);renderTodo();
 }
 async function refresh(){
   if(reloading){queued=true;return}
   const app=$('app'),api=window.GranilarCommercialAPI;
   if(!app||app.style.display==='none'||!api||typeof api.page!=='function')return;
   reloading=true;const button=$('gbi-refresh');
   button.disabled=true;
   statusText('Atualizando propostas da equipe...','loading');
   try{
     const collected=[];let reachedEnd=false;sampled=false;
     for(let page=0;page<maxPages;page++){
       const result=await api.page(page*pageSize,pageSize);
       if(result?.error)throw new Error(result.error.message||'Não foi possível consultar os orçamentos.');
       const records=Array.isArray(result?.data)?result.data:[];
       collected.push(...records);
       if(records.length<pageSize){reachedEnd=true;break}
     }
     sampled=!reachedEnd;
     allRows=collected;everLoaded=true;
     render();
     statusText((sampled?'Amostra de até ':'Dados atualizados · ')+integer.format(collected.length)+' proposta(s)'+(sampled?' · limite de consulta':' · acesso da equipe'),'ok');
   }catch(err){
     statusText('Falha ao atualizar: '+(err.message||'Verifique sua conexão.'),'error');
   }finally{
     reloading=false;button.disabled=false;
     if(queued){queued=false;refresh()}
   }
 }
 function init(){
   if(initialized)return;
   initialized=ui();if(!initialized)return;
   const app=$('app');
   new MutationObserver(()=>{
     if(app.style.display!=='none')refresh();
     else {everLoaded=false;allRows=[];statusText('Entre com sua conta para visualizar os dados.','loading')}
   }).observe(app,{attributes:true,attributeFilter:['style']});
   window.addEventListener('granilar:quotes-updated',refresh);
   if(app.style.display!=='none')refresh();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
})();
