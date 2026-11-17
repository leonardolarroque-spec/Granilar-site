/* Granilar Sul | Galeria ampliável, comparação de pedras e zoom da Decor.
 * Usa somente as imagens já publicadas. Sem dependências externas.
 */
(() => {
  'use strict';
  function start(){
    if(document.body.dataset.gsVisuals==='ready')return;
    const main=document.querySelector('#materiais .material-grid');
    const decor=document.querySelector('#decor-gallery-main');
    if(!main&&!decor)return;
    document.body.dataset.gsVisuals='ready';

    // Visualizador compartilhado e acessível (teclado, fechamento, foco e swipe).
    const viewer=document.createElement('div');
    viewer.className='gs-lightbox';viewer.hidden=true;
    viewer.setAttribute('role','dialog');viewer.setAttribute('aria-modal','true');
    viewer.setAttribute('aria-label','Visualização ampliada das fotografias');
    viewer.innerHTML=`
      <button type="button" class="gs-lightbox-close" aria-label="Fechar imagem ampliada">×</button>
      <button type="button" class="gs-lightbox-prev" aria-label="Imagem anterior">‹</button>
      <div class="gs-lightbox-inner">
        <img class="gs-lightbox-img" alt="">
        <div class="gs-lightbox-caption"><span class="gs-lightbox-description"></span><span class="gs-lightbox-number"></span></div>
      </div>
      <button type="button" class="gs-lightbox-next" aria-label="Próxima imagem">›</button>`;
    document.body.append(viewer);
    const vImg=viewer.querySelector('.gs-lightbox-img');
    const caption=viewer.querySelector('.gs-lightbox-description');
    const indexInfo=viewer.querySelector('.gs-lightbox-number');
    const prev=viewer.querySelector('.gs-lightbox-prev');
    const next=viewer.querySelector('.gs-lightbox-next');
    const close=viewer.querySelector('.gs-lightbox-close');
    let photos=[],current=0,trigger=null;
    function render(){
      const p=photos[current];if(!p)return;
      vImg.src=p.src;
      vImg.alt=p.alt||p.label||'Fotografia ampliada';
      caption.textContent=p.label||p.alt||'Fotografia';
      indexInfo.textContent=(current+1)+' / '+photos.length;
      prev.hidden=next.hidden=photos.length<2;
    }
    function openViewer(list,at=0,origin=null){
      if(!Array.isArray(list)||!list.length)return;
      photos=list.filter(p=>p&&p.src);
      if(!photos.length)return;
      current=Math.min(Math.max(at,0),photos.length-1);
      trigger=origin||document.activeElement;
      viewer.hidden=false;
      document.body.classList.add('gs-lightbox-active');
      render();close.focus();
    }
    function closeViewer(){
      if(viewer.hidden)return;
      viewer.hidden=true;
      document.body.classList.remove('gs-lightbox-active');
      vImg.removeAttribute('src');
      if(trigger&&typeof trigger.focus==='function')trigger.focus();
    }
    function change(delta){if(photos.length<2)return;current=(current+delta+photos.length)%photos.length;render()}
    prev.addEventListener('click',()=>change(-1));
    next.addEventListener('click',()=>change(1));
    close.addEventListener('click',closeViewer);
    viewer.addEventListener('click',event=>{if(event.target===viewer)closeViewer()});
    document.addEventListener('keydown',event=>{
      if(viewer.hidden)return;
      if(event.key==='Escape'){event.preventDefault();closeViewer()}
      else if(event.key==='ArrowLeft'){event.preventDefault();change(-1)}
      else if(event.key==='ArrowRight'){event.preventDefault();change(1)}
      else if(event.key==='Tab'){
        const allowed=[close,...(prev.hidden?[]:[prev,next])];
        const first=allowed[0],last=allowed[allowed.length-1];
        if(event.shiftKey&&(document.activeElement===first||!viewer.contains(document.activeElement))){event.preventDefault();last.focus()}
        else if(!event.shiftKey&&(document.activeElement===last||!viewer.contains(document.activeElement))){event.preventDefault();first.focus()}
      }
    });
    let startX=null;
    viewer.addEventListener('touchstart',event=>{
      if(event.touches.length===1)startX=event.touches[0].clientX;
    },{passive:true});
    viewer.addEventListener('touchend',event=>{
      if(startX===null||!event.changedTouches.length)return;
      const delta=event.changedTouches[0].clientX-startX;startX=null;
      if(Math.abs(delta)>55)change(delta<0?1:-1);
    },{passive:true});

    if(main){
      // Galeria de projetos reais; mantém filtros e legendas existentes.
      const tiles=[...document.querySelectorAll('#galeria .gallery-grid .tile')];
      const projectPhotos=tiles.map(tile=>{
        const img=tile.querySelector('img.surface');
        return img?{src:img.getAttribute('src'),alt:img.alt,label:tile.querySelector('.label')?.textContent.trim()||img.alt}:null;
      });
      tiles.forEach((tile,index)=>{
        if(!projectPhotos[index])return;
        const button=document.createElement('button');
        button.type='button';button.className='gs-photo-open';
        button.setAttribute('aria-label','Ampliar foto: '+projectPhotos[index].label);
        button.addEventListener('click',()=>{
          const visible=tiles.map((t,i)=>({t,p:projectPhotos[i]})).filter(x=>x.p&&!x.t.hidden);
          const at=visible.findIndex(x=>x.t===tile);
          openViewer(visible.map(x=>x.p),Math.max(0,at),button);
        });
        tile.append(button);
      });

      // Catálogo de acabamentos: filtros pelo material e comparação de duas texturas.
      const cards=[...main.querySelectorAll('.material-card')];
      const toolbar=document.createElement('div');toolbar.className='gs-material-toolbar';
      const intro=document.createElement('div');intro.className='gs-material-toolbar-intro';
      const introTitle=document.createElement('strong');introTitle.textContent='Explore e compare os materiais';
      const introText=document.createElement('p');
      introText.textContent='Amplie as texturas ou selecione duas opções para visualizar lado a lado.';
      intro.append(introTitle,introText);toolbar.append(intro);
      const filters=document.createElement('div');filters.className='gs-material-filters';
      filters.setAttribute('role','group');filters.setAttribute('aria-label','Filtrar tipos de pedras');
      const filterOptions=[['todos','Todos'],['granito','Granitos'],['mármore','Mármores'],['quartzo','Quartzos']];
      let activeFilter='todos';
      const filterBtns=[];
      const selected=[];
      const compare=document.createElement('div');compare.className='gs-material-comparison';compare.hidden=true;
      const live=document.createElement('span');live.className='gs-visually-hidden';
      live.setAttribute('role','status');live.setAttribute('aria-live','polite');
      toolbar.append(filters);main.before(toolbar);main.after(compare);toolbar.append(live);
      function itemData(card){
        const img=card.querySelector('img');
        const name=card.querySelector('.m-name')?.textContent.trim()||'Pedra natural';
        const spec=card.querySelector('.m-spec')?.textContent.trim()||'Textura ilustrativa';
        return {src:img?.getAttribute('src')||'',alt:img?.alt||name,label:name,kind:spec.split('·')[0].trim().toLocaleLowerCase('pt-BR'),spec};
      }
      const materials=cards.map(itemData);
      function renderCompare(){
        compare.replaceChildren();
        if(!selected.length){compare.hidden=true;return}
        compare.hidden=false;
        const panel=document.createElement('div');panel.className='gs-material-compare-panel';
        const heading=document.createElement('div');heading.className='gs-material-compare-heading';
        const headCopy=document.createElement('div'),title=document.createElement('strong'),help=document.createElement('p');
        title.textContent='Comparação de texturas';
        help.textContent=selected.length===1?'Escolha mais uma pedra para comparar lado a lado.':'Duas opções selecionadas — amplie a imagem para ver os detalhes.';
        headCopy.append(title,help);
        const clear=document.createElement('button');clear.type='button';clear.className='gs-material-clear';clear.textContent='Limpar seleção';
        clear.addEventListener('click',()=>{
          selected.splice(0);cards.forEach((c,i)=>syncCard(i));renderCompare();live.textContent='Seleção de materiais limpa';
        });
        heading.append(headCopy,clear);
        const grid=document.createElement('div');grid.className='gs-material-compare-grid';
        selected.forEach(index=>{
          const item=materials[index];
          const card=document.createElement('div');card.className='gs-material-compare-item';
          const img=document.createElement('img');img.src=item.src;img.alt=item.alt;img.loading='lazy';
          const details=document.createElement('div');details.className='gs-material-compare-details';
          const n=document.createElement('strong');n.textContent=item.label;
          const s=document.createElement('span');s.textContent=item.spec;
          details.append(n,s);card.append(img,details);grid.append(card);
        });
        if(selected.length===1){
          const placeholder=document.createElement('div');placeholder.className='gs-material-compare-placeholder';
          placeholder.textContent='＋ Selecione uma segunda pedra acima';
          grid.append(placeholder);
        }
        const footer=document.createElement('p');footer.className='gs-material-footnote';
        footer.textContent='Imagens ilustrativas de texturas. Tonalidade, desenho e disponibilidade de cada chapa podem variar. Confirme as opções com a equipe.';
        panel.append(heading,grid,footer);compare.append(panel);
      }
      function syncCard(i){
        const state=selected.includes(i),card=cards[i],btn=card.querySelector('.gs-compare-btn');
        card.classList.toggle('gs-material-selected',state);
        if(btn){btn.setAttribute('aria-pressed',String(state));btn.textContent=state?'✓ Selecionada':'+ Comparar'}
      }
      cards.forEach((card,index)=>{
        const data=materials[index],img=card.querySelector('img');
        if(!img)return;
        img.loading='lazy';img.decoding='async';
        const preview=document.createElement('button');preview.type='button';preview.className='gs-material-preview';
        preview.setAttribute('aria-label','Ampliar textura: '+data.label);
        preview.addEventListener('click',()=>openViewer([data],0,preview));
        const btn=document.createElement('button');btn.type='button';btn.className='gs-compare-btn';
        btn.setAttribute('aria-label','Comparar '+data.label);btn.setAttribute('aria-pressed','false');
        btn.textContent='+ Comparar';
        btn.addEventListener('click',()=>{
          const at=selected.indexOf(index);
          if(at>=0){selected.splice(at,1);live.textContent=data.label+' removida da comparação'}
          else if(selected.length>=2){live.textContent='Duas pedras já selecionadas. Desmarque uma antes de escolher outra.';return}
          else {selected.push(index);live.textContent=data.label+' adicionada à comparação'}
          syncCard(index);renderCompare();
        });
        card.append(preview,btn);
      });
      function applyFilter(kind){
        activeFilter=kind;
        filterBtns.forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.kind===kind)));
        cards.forEach((card,i)=>{card.hidden=kind!=='todos'&&materials[i].kind!==kind});
        live.textContent='Filtro aplicado: '+(filterOptions.find(x=>x[0]===kind)||[])[1];
      }
      filterOptions.forEach(([key,label])=>{
        const btn=document.createElement('button');btn.type='button';btn.dataset.kind=key;
        btn.textContent=label;btn.setAttribute('aria-pressed','false');
        btn.addEventListener('click',()=>applyFilter(key));
        filters.append(btn);filterBtns.push(btn);
      });
      applyFilter(activeFilter);
    }

    if(decor){
      // A foto ativa da galeria de produto pode ser ampliada e percorrida.
      const media=decor.closest('.product-media');
      const thumbs=[...document.querySelectorAll('.product-thumb-strip .thumb')];
      const photoSet=thumbs.map(thumb=>{
        const img=thumb.querySelector('img');
        return {src:img?.getAttribute('src')||'',alt:thumb.getAttribute('aria-label')||'Bandeja Gold',
          label:(thumb.getAttribute('aria-label')||'Bandeja Gold').replace(/^Ver foto \d+:\s*/,'')};
      }).filter(x=>x.src);
      if(media&&photoSet.length){
        const zoom=document.createElement('button');zoom.type='button';zoom.className='gsd-zoom-product';
        zoom.textContent='⌕ Ver em tela cheia';zoom.setAttribute('aria-label','Ampliar foto da Bandeja Gold');
        zoom.addEventListener('click',()=>{
          const src=decor.getAttribute('src');
          const at=photoSet.findIndex(p=>p.src===src);
          openViewer(photoSet,Math.max(0,at),zoom);
        });
        media.append(zoom);
      }
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();