/* Granilar Sul | V7 — atalhos de preenchimento e acesso rápido no celular. */
(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  function init(){
    const form=document.querySelector('.gs-form-surface');
    const items=$('items');
    if(!form||!items||document.body.dataset.granilarV7==='true')return;
    document.body.dataset.granilarV7='true';

    // Atalhos apenas preenchem a descrição e a unidade; preços nunca são pré-definidos.
    const presets=[
      {title:'Bancada',description:'Bancada sob medida',unit:'un'},
      {title:'Soleira',description:'Soleira em pedra natural',unit:'m linear'},
      {title:'Revestimento',description:'Revestimento em pedra',unit:'m²'},
      {title:'Instalação',description:'Serviço de instalação',unit:'serviço'}
    ];
    const toolbar=document.createElement('div');
    toolbar.className='gs7-presetbar';
    const intro=document.createElement('span');intro.textContent='ADICIONAR RAPIDAMENTE';
    toolbar.append(intro);
    for(const preset of presets){
      const b=document.createElement('button');b.type='button';b.className='gs7-preset';
      b.textContent='+ '+preset.title;
      b.addEventListener('click',()=>{
        const all=[...items.querySelectorAll('.item')];
        let target=all.length===1&&!all[0].querySelector('.desc')?.value.trim()&&
          !all[0].querySelector('.price')?.value.replace(/[\s0.,]/g,'').trim()?all[0]:null;
        if(!target){$('addItem').click();target=items.querySelector('.item:last-child')}
        if(!target)return;
        target.querySelector('.desc').value=preset.description;
        const unit=target.querySelector('.item-unit');if(unit)unit.value=preset.unit;
        target.querySelector('.desc').dispatchEvent(new Event('input',{bubbles:true}));
        target.querySelector('.material')?.focus();
      });
      toolbar.append(b)
    }
    items.before(toolbar);
    const tip=document.createElement('p');tip.className='gs7-unit-help';
    tip.textContent='Para cobrança por m² ou metro linear, informe a metragem na quantidade. Preço e medidas continuam personalizados para cada projeto.';
    toolbar.after(tip);

    // Total e salvar sempre acessíveis no celular durante a edição.
    const mobile=document.createElement('div');mobile.className='gs7-mobile-action';
    mobile.setAttribute('aria-label','Resumo e salvamento rápido do orçamento');
    const summary=document.createElement('div'),label=document.createElement('span'),total=document.createElement('strong');
    label.textContent='TOTAL DA PROPOSTA';total.textContent=$('total')?.textContent||'R$ 0,00';
    summary.append(label,total);
    const save=document.createElement('button');save.type='button';save.textContent='Salvar';
    save.addEventListener('click',()=>{$('save').click()});
    mobile.append(summary,save);document.body.append(mobile);
    const originalTotal=$('total');
    if(originalTotal)new MutationObserver(()=>{total.textContent=originalTotal.textContent}).observe(originalTotal,{childList:true,characterData:true,subtree:true});

    function syncView(){
      const active=document.querySelector('.gs-nav-item[data-page="quote"][aria-current="page"]');
      document.body.classList.toggle('gs7-on-editor',Boolean(active)&&$('app').style.display!=='none');
    }
    const nav=document.querySelector('.gs-nav');
    if(nav)new MutationObserver(syncView).observe(nav,{subtree:true,attributes:true,attributeFilter:['aria-current']});
    new MutationObserver(syncView).observe($('app'),{attributes:true,attributeFilter:['style']});
    syncView();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init()
})();