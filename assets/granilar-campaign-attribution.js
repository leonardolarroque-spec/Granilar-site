/* Granilar Sul — atribuição de origem para contatos de campanhas.
 * Não confunde clique em WhatsApp com conversa iniciada, orçamento ou venda.
 * Registra apenas UTMs de campanha; não armazena identificação de pessoas.
 */
(() => {
  'use strict';
  const names = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];
  const clean = value => /^[a-zA-Z0-9_\-]{1,70}$/.test(value || '') ? value : '';
  const incoming = new URLSearchParams(window.location.search);
  let tags = {};
  try {
    tags = JSON.parse(window.sessionStorage.getItem('gs_campaign_attribution') || '{}');
  } catch (_) { tags = {}; }
  if (incoming.has('utm_source')) {
    tags = {};
    for (const name of names) tags[name] = clean(incoming.get(name));
    try { window.sessionStorage.setItem('gs_campaign_attribution', JSON.stringify(tags)); } catch (_) {}
  }
  function label() {
    if (tags.utm_source !== 'google' || tags.utm_medium !== 'cpc' || !tags.utm_campaign) return '';
    return 'Origem do contato: Google Ads | Campanha: ' + tags.utm_campaign +
      (tags.utm_content ? ' | Anúncio/link: ' + tags.utm_content : '');
  }
  window.granilarCampaignAttribution = Object.freeze({
    label,
    campaign: () => tags.utm_campaign || '',
    content: () => tags.utm_content || ''
  });
  document.addEventListener('click', event => {
    const anchor = event.target.closest('a[href*="wa.me/"]');
    if (!anchor) return;
    const source = label();
    if (!source) return;
    try {
      const target = new URL(anchor.href);
      const original = target.searchParams.get('text') || '';
      if (!original.includes('Origem do contato: Google Ads')) {
        target.searchParams.set('text', (original ? original + '\n\n' : '') + source);
        anchor.href = target.toString();
      }
    } catch (_) { /* never block WhatsApp */ }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'granilar_whatsapp_origem_campanha',
      utm_campaign: tags.utm_campaign,
      utm_content: tags.utm_content || 'sem_variante'
    });
  }, true);
})();