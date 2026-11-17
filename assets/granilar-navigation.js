/* Granilar Sul | Navegação contextual acessível nas LPs.
 * Não interfere em WhatsApp, Mercado Livre, GTM, formulários ou sistema interno.
 */
(() => {
 'use strict';
 function init(){
   if(document.body.dataset.gsNavigation==='ready')return;
   const decor=Boolean(document.querySelector('.gsd-mobile-store'));
   const header=document.querySelector(decor?'.header-inner':'.nav-inner');
   const hero=document.querySelector('section.hero');
   if(!header||!hero)return;
   document.body.dataset.gsNavigation='ready';
   if(decor)document.body.classList.add('gsnav-context-decor');
   if(!hero.id)hero.id='gsnav-inicio';
   const layout=decor?[
      {id:hero.id,title:'Início'},
      {id:'catalogo',title:'Bandeja Gold'},
      {id:'ambientes',title:'Ambientes'},
      {id:'colecao',title:'Nossa coleção'},
      {id:'estoque',title:'Preço e disponibilidade'}
   ]:[
      {id:hero.id,title:'Início'},
      {id:'servicos',title:'Serviços'},
      {id:'galeria',title:'Projetos reais'},
      {id:'materiais',title:'Materiais'},
      {id:'orcamento-inteligente',title:'Pedir orçamento'},
      {id:'faq',title:'Dúvidas frequentes'}
   ];
   const sections=layout.filter(x=>document.getElementById(x.id));
   if(sections.length<3)return;
   const primarySource=document.querySelector(decor?'.shop-top-link':'.nav-cta');
   const trigger=document.createElement('button');
   trigger.type='button';trigger.className='gsnav-trigger';trigger.setAttribute('aria-expanded','false');
   trigger.setAttribute('aria-controls','gsnav-drawer');trigger.setAttribute('aria-label','Abrir menu de navegação');
   trigger.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg><span>Menu</span>';
   header.append(trigger);
   const overlay=document.createElement('div');overlay.className='gsnav-overlay';overlay.hidden=true;
   const drawer=document.createElement('aside');drawer.id='gsnav-drawer';drawer.className='gsnav-drawer';drawer.hidden=true;
   drawer.setAttribute('role','dialog');drawer.setAttribute('aria-modal','true');drawer.setAttribute('aria-labelledby','gsnav-title');
   const top=document.createElement('div');top.className='gsnav-drawer-top';
   const titleBox=document.createElement('div');
   const eyebrow=document.createElement('span');eyebrow.className='gsnav-drawer-mark';eyebrow.textContent=decor?'GRANILAR SUL DECOR':'GRANILAR SUL MARMORARIA';
   const title=document.createElement('h2');title.className='gsnav-drawer-title';title.id='gsnav-title';title.textContent=decor?'Descubra cada detalhe.':'Explore nossos projetos.';
   titleBox.append(eyebrow,title);
   const closeBtn=document.createElement('button');closeBtn.type='button';closeBtn.className='gsnav-close';closeBtn.setAttribute('aria-label','Fechar menu');closeBtn.textContent='×';
   top.append(titleBox,closeBtn);
   const intro=document.createElement('p');intro.className='gsnav-drawer-subtitle';intro.textContent=decor?'Conheça a peça, veja os ambientes e confira as condições na loja oficial.':'Encontre rapidamente os serviços, projetos reais e o caminho para pedir seu orçamento.';
   const nav=document.createElement('nav');nav.className='gsnav-drawer-links';nav.setAttribute('aria-label','Navegação por seções');
   for(const item of sections){
     const a=document.createElement('a');a.href='#'+item.id;a.dataset.gsnavTarget=item.id;
     a.append(document.createTextNode(item.title));
     const arrow=document.createElement('span');arrow.className='gsnav-arrow';arrow.setAttribute('aria-hidden','true');arrow.textContent='↗';a.append(arrow);
     nav.append(a);
   }
   const other=document.createElement('a');
   other.href=decor?'../':'decor/';
   other.append(document.createTextNode(decor?'Voltar à marmoraria':'Conhecer a Granilar Sul Decor'));
   const arrow=document.createElement('span');arrow.className='gsnav-arrow';arrow.setAttribute('aria-hidden','true');arrow.textContent='↗';other.append(arrow);
   nav.append(other);
   const bottom=document.createElement('div');bottom.className='gsnav-drawer-bottom';
   const primary=document.createElement('a');primary.className='gsnav-primary';
   primary.href=primarySource?.getAttribute('href')||'#'+(decor?'catalogo':'orcamento-inteligente');
   if(primarySource?.target==='_blank'){primary.target='_blank';primary.rel='noopener noreferrer';}
   if(decor){primary.dataset.outbound='mercado-livre-loja';primary.textContent='Ver loja oficial no Mercado Livre';}
   else primary.textContent='Conversar sobre meu orçamento';
   const note=document.createElement('p');note.className='gsnav-drawer-footnote';
   note.textContent=decor?'Compra, pagamento, estoque e frete são confirmados no Mercado Livre.':'28 anos de tradição · Qualidade, Compromisso, Confiança.';
   bottom.append(primary,note);
   drawer.append(top,intro,nav,bottom);
   document.body.append(overlay,drawer);

   let opened=false;
   function openMenu(){
     if(opened)return;
     opened=true;overlay.hidden=false;drawer.hidden=false;
     document.body.classList.add('gsnav-open');
     trigger.setAttribute('aria-expanded','true');trigger.setAttribute('aria-label','Fechar menu de navegação');
     closeBtn.focus();
   }
   function closeMenu(restoreFocus=true){
     if(!opened)return;
     opened=false;overlay.hidden=true;drawer.hidden=true;
     document.body.classList.remove('gsnav-open');
     trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-label','Abrir menu de navegação');
     if(restoreFocus)trigger.focus();
   }
   trigger.addEventListener('click',()=>opened?closeMenu():openMenu());
   closeBtn.addEventListener('click',()=>closeMenu());
   overlay.addEventListener('click',()=>closeMenu());
   drawer.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>closeMenu(false)));
   document.addEventListener('keydown',event=>{
     if(!opened)return;
     if(event.key==='Escape'){event.preventDefault();closeMenu();return}
     if(event.key!=='Tab')return;
     const focusable=[...drawer.querySelectorAll('a[href],button:not([disabled])')].filter(el=>el.getClientRects().length>0);
     if(!focusable.length)return;
     const first=focusable[0],last=focusable[focusable.length-1];
     if(event.shiftKey&&(document.activeElement===first||!drawer.contains(document.activeElement))){event.preventDefault();last.focus()}
     else if(!event.shiftKey&&(document.activeElement===last||!drawer.contains(document.activeElement))){event.preventDefault();first.focus()}
   });
   window.addEventListener('resize',()=>{
     if(opened&&window.matchMedia('(min-width: 901px)').matches)closeMenu(false);
   },{passive:true});

   // Mini-índice lateral para telas amplas, sem sobrepor o conteúdo da LP.
   const rail=document.createElement('nav');rail.className='gsnav-rail';rail.setAttribute('aria-label','Atalhos para as seções da página');
   sections.slice(0,5).forEach((item,index)=>{
     const a=document.createElement('a');a.href='#'+item.id;
     a.dataset.gsnavTarget=item.id;a.setAttribute('aria-label','Ir para '+item.title);
     a.append(document.createTextNode(String(index+1).padStart(2,'0')));
     const hint=document.createElement('span');hint.className='gsnav-tooltip';hint.textContent=item.title;a.append(hint);rail.append(a)
   });
   document.body.append(rail);
   const progress=document.createElement('div');progress.className='gsnav-progress';progress.setAttribute('aria-hidden','true');
   document.body.append(progress);

   // Estado ativo + barra de leitura, calculados sem modificar o histórico.
   let scheduled=false;
   function updatePosition(){
     scheduled=false;
     const full=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
     progress.style.width=Math.min(100,Math.max(0,window.scrollY/full*100)).toFixed(2)+'%';
     const marker=window.scrollY+window.innerHeight*.36;
     let selected=sections[0].id;
     for(const item of sections){
       const node=document.getElementById(item.id);
       if(node&&node.getBoundingClientRect().top+window.scrollY<=marker)selected=item.id;
     }
     document.querySelectorAll('[data-gsnav-target]').forEach(a=>{
       if(a.dataset.gsnavTarget===selected)a.setAttribute('aria-current','location');
       else a.removeAttribute('aria-current');
     });
   }
   function schedule(){
     if(!scheduled){scheduled=true;window.requestAnimationFrame(updatePosition)}
   }
   window.addEventListener('scroll',schedule,{passive:true});
   window.addEventListener('resize',schedule,{passive:true});
   window.addEventListener('load',schedule,{once:true});
   schedule();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
})();