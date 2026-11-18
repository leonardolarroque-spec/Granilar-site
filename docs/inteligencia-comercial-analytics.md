# Granilar Sul — Integração de eventos e inteligência comercial

Atualizado em 18/11/2026.

## O que já existe
- LP principal, LP Decor e projetos possuem GTM `GTM-NNWD5M6K` no código.
- Os eventos de interação são enviados ao `window.dataLayer`; isso **não comprova**, por si só, que chegam ao GA4.
- O painel privado em `/orcamentos/` usa exclusivamente os registros autenticados de propostas do Supabase, respeitando RLS.
- Na última verificação, o conector Supermetrics para GA4 (`GAWA`) estava **não autenticado**; portanto visitantes e cliques aparecem como não disponíveis (—), não como zero.

## Eventos para configurar no GTM/GA4
| Evento no dataLayer | O que significa | Como interpretar |
| --- | --- | --- |
| `orcamento_iniciado` | Formulário da LP abriu uma mensagem no WhatsApp | Tentativa de contato; **não** comprova conversa iniciada ou orçamento enviado |
| `granilar_whatsapp_click` | Clique em link de WhatsApp na LP principal | Clique, não lead confirmado |
| `granilar_servico_contato` | Clique de contato em cartão de serviço | Interesse por serviço |
| `granilar_projeto_aberto` | Abertura de página de projeto a partir da galeria | Interesse por projeto |
| `granilar_projeto_interesse` | Clique no WhatsApp de uma página individual | Interesse por uma referência de projeto |
| `granilar_guia_pedras_concluido` | Guia de materiais concluído | Interação de qualificação, sem preço ou decisão técnica |
| `granilar_guia_whatsapp` | Clique no WhatsApp após concluir o guia | Intenção de contato |
| `decor_clique_mercado_livre` | Clique da Decor rumo à loja oficial | **Não** significa compra |
| `decor_foto_selecionada` | Foto do produto escolhida | Engajamento visual |
| `decor_foto_ampliada` | Ampliação de fotografia do produto | Engajamento visual |
| `decor_duvida_aberta` | Pergunta aberta na seção FAQ | Interesse em informação |

### Atenção: evento legado duplicado
A LP principal também possui o evento legado `clique_whatsapp`. Ele pode representar o **mesmo clique** que `granilar_whatsapp_click`. **Não some os dois** ao criar relatórios. Para relatórios novos, prefira uma única definição canônica, mantendo a compatibilidade das tags antigas até verificar o GTM.

## Como concluir a conexão
1. Confirmar que a propriedade GA4 do domínio está configurada.
2. No [Google Tag Manager](https://tagmanager.google.com/), verificar quais tags de GA4 e acionadores estão publicados. Configurar eventos personalizados para as ações acima, se necessário.
3. Em **Prévia/Tag Assistant** e **GA4 DebugView**, confirmar se cada ação dispara uma vez e na página correta.
4. Conectar Google Analytics 4 no Supermetrics e selecionar a propriedade da Granilar Sul.
5. Somente depois de confirmar dados e permissões, integrar uma fonte de relatórios ao painel privado. **Não colocar tokens privados ou credenciais GA4 no frontend.**

## Convenções comerciais
- `lead_source` é uma origem **informada pela equipe** e pode ficar vazia. Não equivale à atribuição do GA4/Google Ads.
- `next_followup_on` é uma data opcional para organização visual; não envia lembretes automaticamente.
- Propostas com status `aprovado` não devem ser contadas como receita recebida sem verificação financeira.
- "Taxa de aprovação" é `aprovadas / (aprovadas + recusadas)` no período; caso não existam decisões, exibir —.
- Dados de clientes e propostas só podem ser carregados para usuários autorizados via Supabase RLS.

Referências: [Documentação Google sobre eventos no GTM](https://support.google.com/tagmanager/answer/13034206?hl=pt-BR).
