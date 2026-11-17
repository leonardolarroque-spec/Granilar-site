/* Granilar Sul — qualificação leve, guia de inspiração e cliques contextualizados. */
(() => {
 'use strict';
 const $=s=>document.querySelector(s);
 const track=(event,fields)=>{window.dataLayer=window.dataLayer||[];window.dataLayer.push({event,...fields})};
 function init(){
  if(document.body.dataset.gsGrowth==='ready')return;
  const guide=$('#gs-material-guide-form');
  const tiles=[...document.querySelectorAll('#galeria .gallery-grid .tile')];
  if(!guide||!tiles.length)return;
  document.body.dataset.gsGrowth='ready';

  // Cada foto real leva à sua página, sem interferir no botão existente de ampliar.
  const routes={
   '07':'cozinha-granito-preto-sao-gabriel',
   '08':'cozinha-granito-branco-dallas',
   '09':'cozinha-granito-verde-ubatuba',
   '10':'banheiro-granito-preto-via-lactea',
   '11':'cozinha-quartzo-branco',
   '12':'cozinha-quartzo-calacatta-gold'
  };
  let linked=0;
  for(const tile of tiles){
    const img=tile.querySelector('img.surface');if(!img)continue;
    const match=(img.getAttribute('src')||'').match(/imagem-(\d{2})\.jpg$/i);
    const slug=match&&routes[match[1]];if(!slug)continue;
    const label=tile.querySelector('.label')?.textContent.trim()||img.alt;
    const link=document.createElement('a');
    link.className='gs-project-detail-link';
    link.href='/projetos/'+slug+'/';
    link.textContent='Ver projeto ↗';
    link.setAttribute('aria-label','Ver detalhes do projeto '+label);
    link.addEventListener('click',()=>track('granilar_projeto_aberto',{projeto:slug,origem:'galeria'}));
    tile.append(link);linked++;
  }
  const gallery=$('#galeria .gallery-grid');
  if(gallery&&linked>0){
    const hint=document.createElement('p');hint.className='gs-gallery-hint';
    hint.textContent='Explore os projetos em detalhe ou amplie as fotografias.';
    gallery.after(hint);
  }

  const catalog=[
    {name:'Branco Itaúnas',type:'Granito',img:'/assets/granilar-final-20261029/imagem-13.jpg'},
    {name:'Branco Dallas',type:'Granito',img:'/assets/granilar-final-20261029/imagem-14.jpg'},
    {name:'Verde Ubatuba',type:'Granito',img:'/assets/granilar-final-20261029/imagem-15.jpg'},
    {name:'Preto Via Láctea',type:'Granito',img:'/assets/granilar-final-20261029/imagem-16.jpg'},
    {name:'Preto São Gabriel',type:'Granito',img:'/assets/granilar-final-20261029/imagem-17.jpg'},
    {name:'Amarelo Ornamental',type:'Granito',img:'/assets/granilar-final-20261029/imagem-18.jpg'},
    {name:'Amarelo Icaraí',type:'Granito',img:'/assets/granilar-final-20261029/imagem-19.jpg'},
    {name:'Branco Paraná',type:'Mármore',img:'/assets/granilar-final-20261029/imagem-20.jpg'},
    {name:'Quartzo Branco',type:'Quartzo',img:'/assets/granilar-final-20261029/imagem-21.jpg'},
    {name:'Calacatta Gold',type:'Quartzo',img:'/assets/granilar-final-20261029/imagem-22.jpg'}
  ];
  const picks={
    claro:['Branco Itaúnas','Branco Dallas','Quartzo Branco'],
    escuro:['Preto São Gabriel','Preto Via Láctea','Verde Ubatuba'],
    veios:['Calacatta Gold','Branco Paraná','Preto Via Láctea'],
    terroso:['Amarelo Ornamental','Amarelo Icaraí','Verde Ubatuba'],
    indeciso:['Branco Dallas','Preto São Gabriel','Calacatta Gold']
  };
  const names={
    ambiente:{cozinha:'Cozinha',banheiro:'Banheiro ou lavabo',gourmet:'Área gourmet',outro:'Outro ambiente'},
    estilo:{claro:'Claro e discreto',escuro:'Escuro e marcante',veios:'Veios em destaque',terroso:'Tons naturais',indeciso:'Ainda não sei'},
    prioridade:{praticidade:'Rotina e praticidade',visual:'Impacto visual',investimento:'Planejamento do investimento',orientacao:'Preciso de orientação'}
  };
  const results=$('#gs-guide-results'),list=$('#gs-guide-suggestions'),blurb=$('#gs-guide-result-description'),send=$('#gs-guide-whatsapp');
  if(!results||!list||!blurb||!send)return;
  guide.addEventListener('submit',event=>{
    event.preventDefault();if(!guide.reportValidity())return;
    const data=new FormData(guide);
    const ambiente=String(data.get('ambiente')||''),estilo=String(data.get('estilo')||''),prioridade=String(data.get('prioridade')||'');
    if(!names.ambiente[ambiente]||!names.estilo[estilo]||!names.prioridade[prioridade])return;
    const choices=(picks[estilo]||picks.indeciso).map(n=>catalog.find(c=>c.name===n)).filter(Boolean);
    list.replaceChildren();
    for(const m of choices){
      const card=document.createElement('div');card.className='gs-guide-suggestion';
      const img=document.createElement('img');img.src=m.img;img.alt='Textura ilustrativa: '+m.name;img.loading='lazy';img.decoding='async';
      const title=document.createElement('strong');title.textContent=m.name;
      const caption=document.createElement('small');caption.textContent=m.type+' · Referência visual';
      card.append(img,title,caption);list.append(card);
    }
    const subject=names.ambiente[ambiente],look=names.estilo[estilo],goal=names.prioridade[prioridade];
    blurb.textContent='Para '+subject.toLocaleLowerCase('pt-BR')+' com estilo '+look.toLocaleLowerCase('pt-BR')+', estas são algumas texturas para começar a explorar. A equipe confirma a indicação técnica, opções e preço conforme o seu projeto.';
    const message='Olá! Usei o guia de pedras da Granilar Sul e gostaria de orientação para meu projeto.\n'+
      'Ambiente: '+subject+'\nEstilo desejado: '+look+'\nPrioridade: '+goal+
      '\nMateriais que quero conhecer: '+choices.map(x=>x.name).join(', ')+
      '\nPosso compartilhar fotos e medidas para avaliarmos as opções?';
    send.href='https://wa.me/5551993099097?text='+encodeURIComponent(message);
    send.dataset.ambiente=ambiente;send.dataset.estilo=estilo;
    results.hidden=false;
    track('granilar_guia_pedras_concluido',{ambiente,estilo,prioridade});
    results.focus({preventScroll:true});
    if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)results.scrollIntoView({block:'nearest'});
    else results.scrollIntoView({behavior:'smooth',block:'nearest'});
  });
  send.addEventListener('click',()=>track('granilar_guia_whatsapp',{
    ambiente:send.dataset.ambiente||'nao_informado',estilo:send.dataset.estilo||'nao_informado'
  }));
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();