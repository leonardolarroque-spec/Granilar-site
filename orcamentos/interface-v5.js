/* Granilar Sul Orçamentos — Interface V5. Sem alterar regras ou dados. */
(() => {
  'use strict';
  function init() {
    const $ = id => document.getElementById(id);
    const app = $('app');
    if (!app || app.dataset.interfaceV5 === 'true') return;
    const nav = app.querySelector('nav.quick-nav'), stats = app.querySelector('.stat-grid');
    const editor = $('orcamento'), history = $('historico'), clients = $('clientes');
    if (!nav || !stats || !editor || !history || !clients) return;

    app.dataset.interfaceV5 = 'true';
    const overview = document.createElement('section');
    overview.id = 'inicio';
    overview.className = 'workspace-view';
    overview.innerHTML = `
      <div class="v5-heading"><div><div class="v5-overline">VISÃO GERAL</div><h2>Seu espaço de trabalho</h2>
      <p class="muted">Gerencie clientes e propostas em um só lugar, com praticidade e organização.</p></div>
      <span class="v5-sync">● Dados compartilhados com a equipe</span></div>
      <div class="v5-overview-grid">
        <section class="panel v5-action-card"><div class="v5-overline">ACESSO RÁPIDO</div>
        <h3>O que vamos fazer hoje?</h3><p class="muted">Comece um orçamento personalizado ou acompanhe uma proposta já criada.</p>
        <div class="v5-buttons"><button id="v5-start" type="button">＋ Criar orçamento</button>
        <button id="v5-browse" class="light" type="button">Ver orçamentos</button></div>
        <p class="v5-brand-note">Granilar Sul Marmoraria<br><strong>Qualidade, Compromisso, Confiança.</strong> 28 anos de tradição.</p></section>
        <section class="panel v5-recent-card"><div class="row"><h3>Últimas propostas</h3>
        <button class="light" type="button" id="v5-all">Ver todas</button></div>
        <p class="muted">Orçamentos mais recentes da equipe.</p><div id="v5-recent"></div></section></div>`;
    overview.querySelector('.v5-heading').after(stats);
    editor.parentNode.insertBefore(overview,editor);

    nav.classList.add('v5-nav');
    nav.innerHTML = `
      <button class="v5-tab" type="button" data-view="inicio" aria-selected="true">Visão geral</button>
      <button class="v5-tab" type="button" data-view="orcamento" aria-selected="false">＋ Novo orçamento</button>
      <button class="v5-tab" type="button" data-view="historico" aria-selected="false">Orçamentos</button>
      <button class="v5-tab" type="button" data-view="clientes" aria-selected="false">Clientes</button>`;
    const views = { inicio:overview, orcamento:editor, historico:history, clientes:clients };
    for (const el of Object.values(views)) el.classList.add('workspace-view');
    function show(name,scroll=true) {
      if (!views[name]) name='inicio';
      for (const [id,el] of Object.entries(views)) el.hidden=id!==name;
      nav.querySelectorAll('.v5-tab').forEach(b => b.setAttribute('aria-selected',String(b.dataset.view===name)));
      if (scroll) window.scrollTo({top:0,behavior:'smooth'});
    }
    nav.querySelectorAll('.v5-tab').forEach(b=>b.addEventListener('click',()=>show(b.dataset.view)));
    $('v5-start').addEventListener('click',()=>{ $('newQuote').click();show('orcamento'); });
    $('v5-browse').addEventListener('click',()=>show('historico'));
    $('v5-all').addEventListener('click',()=>show('historico'));

    // Editor: reaproveita exatamente os campos, totais e botões originais.
    const sections = [...editor.children];
    const editorTop = document.createElement('div');
    editorTop.className='v5-heading v5-editor-heading';
    const editorTitle=editor.querySelector(':scope > .row');
    if (editorTitle) editorTop.append(editorTitle);
    const desc=document.createElement('p');
    desc.className='muted';
    desc.textContent='Informações do cliente, peças e condições comerciais, reunidas numa proposta só.';
    editorTop.append(desc);
    const layout=document.createElement('div');
    layout.className='v5-editor-layout';
    const main=document.createElement('div');main.className='panel v5-editor-fields';
    const side=document.createElement('aside');side.className='panel v5-editor-side';
    side.innerHTML='<div class="v5-summary-head"><h3>Resumo financeiro</h3><p class="muted">Atualizado automaticamente.</p></div>';
    const summary=editor.querySelector(':scope > .summary-card');
    const alert=editor.querySelector(':scope > .inline-alert');
    const actions=editor.querySelector(':scope > .actions');
    for (const node of sections) {
      if (node===editorTitle) continue;
      if (node===summary || node===alert || node===actions) side.append(node);
      else main.append(node);
    }
    const hint=document.createElement('div');
    hint.className='v5-summary-hint';
    hint.textContent='Os orçamentos salvos ficam disponíveis para os usuários autorizados.';
    side.append(hint);
    layout.append(main,side);
    editor.replaceChildren(editorTop,layout);
    editor.classList.remove('panel');

    // Títulos claros; os IDs continuam intactos para o JavaScript existente.
    const heading=editorTitle?.querySelector('h2');
    if(heading) heading.classList.add('v5-form-title');
    const itemTitle=[...main.querySelectorAll('h3')].find(h=>h.textContent.includes('Itens do projeto'));
    if(itemTitle) itemTitle.textContent='Peças e serviços';
    const conditionLabel=main.querySelector('#paymentTerms')?.closest('div')?.querySelector('label');
    if(conditionLabel) conditionLabel.textContent='Forma e condições de pagamento';
    $('newQuote').textContent='Começar novo';

    // Filtro prático dos clientes existentes.
    const clientTable=clients.querySelector('.table-scroll');
    if(clientTable) {
      const filter=document.createElement('div');
      filter.className='v5-client-filter';
      filter.innerHTML='<label for="v5-searchClients">Buscar cliente</label><input id="v5-searchClients" type="search" placeholder="Nome, telefone ou e-mail">';
      clientTable.before(filter);
      filter.querySelector('input').addEventListener('input',ev=>{
        const term=ev.target.value.toLocaleLowerCase('pt-BR').trim();
        $('customers').querySelectorAll('tr').forEach(row=>{row.hidden=!!term&&!row.textContent.toLocaleLowerCase('pt-BR').includes(term)});
      });
    }

    // Histórico leva para o editor antes do processamento do clique original.
    $('history').addEventListener('click',event=>{
      if(event.target.closest('button')) show('orcamento');
    },true);
    // Recentes são somente uma visualização dos registros já carregados.
    function refreshRecent(){
      const target=$('v5-recent');target.replaceChildren();
      const rows=[...$('history').querySelectorAll('tr')].filter(tr=>tr.querySelector('button'));
      if(!rows.length){const p=document.createElement('p');p.className='v5-empty';p.textContent='Ainda não há orçamentos cadastrados.';target.append(p);return}
      for(const row of rows.slice(0,5)){
        const cells=[...row.querySelectorAll('td')],button=document.createElement('button');
        button.type='button';button.className='v5-recent-row';
        const name=document.createElement('span'),price=document.createElement('span'),sub=document.createElement('small');
        name.textContent=cells[1]?.textContent||'Orçamento';sub.textContent=(cells[0]?.textContent||'')+' · '+(cells[4]?.textContent||'');
        price.className='v5-recent-price';price.textContent=cells[3]?.textContent||'';
        const left=document.createElement('span');left.append(name,sub);
        button.append(left,price);button.onclick=()=>row.querySelector('button')?.click();target.append(button);
      }
    }
    const observer=new MutationObserver(refreshRecent);
    observer.observe($('history'),{childList:true});refreshRecent();
    show('inicio',false);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
