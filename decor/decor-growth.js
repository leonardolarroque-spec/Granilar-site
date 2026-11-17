/* Granilar Sul Decor — eventos informativos de interesse, sem afirmar compras realizadas. */
(() => {
 'use strict';
 function init(){
  if(document.body.dataset.decorGrowth==='ready')return;
  document.body.dataset.decorGrowth='ready';
  const push=(event,fields)=>{window.dataLayer=window.dataLayer||[];window.dataLayer.push({event,...fields})};
  document.addEventListener('click',e=>{
   const thumb=e.target.closest('.product-thumb-strip .thumb');
   if(thumb){
    const n=[...thumb.parentElement.querySelectorAll('.thumb')].indexOf(thumb);
    push('decor_foto_selecionada',{produto:'bandeja_gold_40x25',foto:n+1});
   }
   const zoom=e.target.closest('.gsd-zoom-product');
   if(zoom)push('decor_foto_ampliada',{produto:'bandeja_gold_40x25'});
  });
  document.querySelectorAll('#cuidados details').forEach((d,index)=>{
   d.addEventListener('toggle',()=>{
    if(d.open)push('decor_duvida_aberta',{produto:'bandeja_gold_40x25',pergunta:index+1});
   });
  });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();