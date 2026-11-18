/* Granilar Sul | Interface v6 – camada visual isolada, sem alteração nas operações do Supabase. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const icon = paths => `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  const icons = {
    dashboard: icon('<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>'),
    quote: icon('<path d="M12 5v14M5 12h14"/><rect x="3" y="3" width="18" height="18" rx="3"/>'),
    archive: icon('<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v11h14V9M10 13h4"/>'),
    clients: icon('<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5v1"/>'),
  };
  const panelMap = { dashboard: 'inicio', quote: 'orcamento', archive: 'historico', clients: 'clientes' };
  let activeTab='dashboard';
  function init() {
    const app=$('app');
    if (!app || app.dataset.v6Initialized==='true') return;
    const main=$('orcamento'), archive=$('historico'), clients=$('clientes');
    const legacyNav=app.querySelector('nav.quick-nav');
    const legacyStats=app.querySelector('.stat-grid');
    const legacyTop=app.querySelector('.topbar');
    if (!main || !archive || !clients || !legacyNav || !legacyStats || !legacyTop) return;
    app.dataset.v6Initialized='true';
    const shell=document.createElement('div');shell.className='gs-shell';
    const aside=document.createElement('aside');aside.className='gs-sidebar';
    aside.innerHTML=`<div class="gs-sidebar-brand"><span class="gs-monogram">GS<span>.</span></span><div class="gs-sidebar-brand-text"><strong>GRANILAR SUL</strong><small>Orçamentos</small></div></div>
    <div class="gs-nav-title">ESPAÇO DE TRABALHO</div>
    <nav aria-label="Menu principal" class="gs-nav">
      <button class="gs-nav-item" type="button" data-page="dashboard" aria-current="page">${icons.dashboard}<span>Visão geral</span></button>
      <button class="gs-nav-item" type="button" data-page="quote">${icons.quote}<span>Novo orçamento</span></button>
      <button class="gs-nav-item" type="button" data-page="archive">${icons.archive}<span>Orçamentos</span></button>
      <button class="gs-nav-item" type="button" data-page="clients">${icons.clients}<span>Clientes</span></button>
    </nav><div class="gs-sidebar-foot"><div class="gs-foot-rule"></div><span>28 anos de tradição</span><small>Qualidade · Compromisso · Confiança</small></div>`;
    const workspace=document.createElement('div');workspace.className='gs-workspace';
    const content=document.createElement('div');content.className='gs-content';
    const header=document.createElement('div');header.className='gs-workspace-header';
    const headerTitle=document.createElement('div');headerTitle.className='gs-page-heading';
    headerTitle.innerHTML='<span class="gs-eyebrow" id="gs-header-label">PAINEL</span><h1 id="gs-header-title">Visão geral</h1><p id="gs-header-subtitle">Uma visão clara do seu trabalho.</p>';
    header.append(headerTitle,legacyTop);
    workspace.append(header,content);shell.append(aside,workspace);
    const intro=document.createElement('section');intro.id='inicio';intro.className='gs-section';
    intro.innerHTML=`<div class="gs-overview-head"><div><span class="gs-kicker">BOM TRABALHO!</span><h2>Bem-vindo ao seu escritório digital.</h2><p>Organize propostas, acompanhe negociações e atenda com mais agilidade.</p></div><button type="button" id="gs-create-hero" class="gs-primary-action">${icons.quote} Criar orçamento</button></div>
    <div class="gs-overview-tiles"></div><div class="gs-home-grid">
      <div class="gs-feature-card"><div class="gs-feature-eyebrow">SEU PRÓXIMO PASSO</div><h3>Do projeto ao orçamento, sem complicação.</h3><p>Descreva as peças, informe o valor de cada serviço e envie uma proposta bem apresentada ao cliente.</p><button type="button" id="gs-create-feature">Começar orçamento <span aria-hidden="true">→</span></button><div class="gs-feature-bottom">Granilar Sul Marmoraria <span>·</span> desde 1998</div></div>
      <section class="gs-recent-panel"><div class="gs-card-head"><div><h3>Propostas recentes</h3><p>Continue de onde parou.</p></div><button type="button" class="gs-text-link" id="gs-all">Ver todas →</button></div><div id="gs-recent-list"></div></section></div>`;
    intro.querySelector('.gs-overview-tiles').append(legacyStats);
    content.append(intro,main,archive,clients);
    legacyNav.replaceWith(shell);
    app.append(shell);

    // Reorganização do formulário sem recriar campos ou mexer nas funções de persistência.
    const editorHeader=main.querySelector(':scope > .row');
    const summary=main.querySelector(':scope > .summary-card');
    const warning=main.querySelector(':scope > .inline-alert');
    const actions=main.querySelector(':scope > .actions');
    const oldChildren=[...main.children];
    const newHeading=document.createElement('div');newHeading.className='gs-editor-heading';
    if(editorHeader)newHeading.append(editorHeader);
    const formWrapper=document.createElement('div');formWrapper.className='gs-editor-grid';
    const form=document.createElement('section');form.className='gs-form-surface';
    const financial=document.createElement('aside');financial.className='gs-financial-panel';
    const financialTitle=document.createElement('div');financialTitle.className='gs-financial-heading';
    financialTitle.innerHTML='<span class="gs-eyebrow">RESUMO EM TEMPO REAL</span><h3>Valor da proposta</h3><p>Valores calculados automaticamente.</p>';
    financial.append(financialTitle);
    for(const child of oldChildren){
      if(child===editorHeader)continue;
      if(child===summary||child===warning||child===actions)financial.append(child);
      else form.append(child);
    }
    const secureNote=document.createElement('div');secureNote.className='gs-secure-note';secureNote.textContent='Orçamento salvo na conta da empresa e disponível para a equipe autorizada.';
    financial.append(secureNote);
    formWrapper.append(form,financial);
    main.replaceChildren(newHeading,formWrapper);main.classList.remove('panel');
    const formTitles=[...form.querySelectorAll('h3')];
    formTitles.forEach((el,index)=>{
      const k=String(index+1).padStart(2,'0');
      el.insertAdjacentHTML('afterbegin',`<span class="gs-step">${k}</span>`);
    });
    const editorTitle=$('formTitle');if(editorTitle)editorTitle.classList.add('gs-form-title');
    const priceInputs=form.querySelector('.grid.four');if(priceInputs)priceInputs.classList.add('gs-commercial-fields');
    const itemButton=$('addItem');if(itemButton)itemButton.textContent='＋ Adicionar peça ou serviço';
    const payLabel=$('paymentTerms')?.closest('div')?.querySelector('label');if(payLabel)payLabel.textContent='Condições de pagamento';
    if($('newQuote'))$('newQuote').textContent='Limpar e começar outro';

    // Melhorias no histórico e clientes: as tabelas e a lógica original permanecem.
    archive.classList.add('gs-table-section');clients.classList.add('gs-table-section');
    const searchClient=document.createElement('div');searchClient.className='gs-search-client';
    searchClient.innerHTML='<label for="gs-filter-clients">Localizar cliente</label><input id="gs-filter-clients" type="search" placeholder="Busque por nome, telefone ou e-mail">';
    const customerTable=clients.querySelector('.table-scroll');
    if(customerTable){customerTable.before(searchClient);
      $('gs-filter-clients').addEventListener('input',e=>{
        const term=e.target.value.trim().toLocaleLowerCase('pt-BR');
        $('customers').querySelectorAll('tr').forEach(tr=>tr.hidden=!!term&&!tr.textContent.toLocaleLowerCase('pt-BR').includes(term));
      });
    }

    const tabs=aside.querySelectorAll('.gs-nav-item');
    const viewTitles={
      dashboard:['PAINEL','Visão geral','Bem-vindo à área de gestão da Granilar Sul.'],
      quote:['ORÇAMENTOS','Criar proposta','Preencha o projeto e acompanhe o valor final.'],
      archive:['HISTÓRICO','Orçamentos','Consulte, edite e acompanhe suas propostas.'],
      clients:['CONTATOS','Clientes','Uma base organizada para novos atendimentos.']
    };
    function navigate(page,scroll=true){
      if(!panelMap[page])page='dashboard';
      activeTab=page;
      for(const [key,id] of Object.entries(panelMap))$(id).hidden=key!==page;
      tabs.forEach(b=>b.setAttribute('aria-current',b.dataset.page===page?'page':'false'));
      const [eyebrow,title,subtitle]=viewTitles[page];
      $('gs-header-label').textContent=eyebrow;
      $('gs-header-title').textContent=title;
      $('gs-header-subtitle').textContent=subtitle;
      if(scroll)window.scrollTo({top:0,behavior:'smooth'});
    }
    tabs.forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.page)));
    const create=()=>{$('newQuote').click();navigate('quote');};
    $('gs-create-hero').addEventListener('click',create);
    $('gs-create-feature').addEventListener('click',create);
    $('gs-all').addEventListener('click',()=>navigate('archive'));
    // O botão 'Novo orçamento' da versão anterior já mantém sua lógica de limpar.
    $('newQuote').addEventListener('click',()=>navigate('quote'));
    // Abre a guia ANTES do clique chamar a função original openQuote().
    $('history').addEventListener('click',e=>{if(e.target.closest('.gs-quote-edit,.gs-quote-duplicate'))navigate('quote')},true);
    // Mudanças de autenticação não afetam o formulário de recuperação.
    const viewObserver=new MutationObserver(()=>{
      document.body.classList.toggle('gs-authenticated',app.style.display!=='none');
      if(app.style.display!=='none'&&!$('inicio').hidden&&activeTab!=='dashboard')navigate(activeTab,false);
    });
    viewObserver.observe(app,{attributes:true,attributeFilter:['style']});
    function refreshRecents(){
      const list=$('gs-recent-list');if(!list)return;list.replaceChildren();
      const rows=[...$('history').querySelectorAll('.gs-quote-card')];
      if(!rows.length){const p=document.createElement('p');p.className='gs-empty';p.textContent='Nenhuma proposta neste filtro. Consulte a aba Orçamentos.';list.append(p);return;}
      for(const row of rows.slice(0,5)){
        const b=document.createElement('button');b.type='button';b.className='gs-recent-entry';
        const left=document.createElement('span'),title=document.createElement('strong'),sub=document.createElement('small'),value=document.createElement('span');
        title.textContent=row.querySelector('.gs-quote-client')?.textContent||'Cliente';
        sub.textContent=(row.querySelector('.gs-quote-number')?.textContent||'')+' · '+(row.querySelector('.gs-quote-stage')?.textContent||'');
        left.append(title,sub);value.className='gs-recent-value';value.textContent=row.querySelector('.gs-quote-amount')?.textContent||'';
        b.append(left,value);b.addEventListener('click',()=>row.querySelector('.gs-quote-edit')?.click());list.append(b);
      }
    }
    new MutationObserver(refreshRecents).observe($('history'),{childList:true});refreshRecents();
    navigate('dashboard',false);
    document.body.classList.toggle('gs-authenticated',app.style.display!=='none');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
