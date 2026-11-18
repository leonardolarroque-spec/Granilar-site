# Granilar Sul — revisão de frontend com base em `frontend-design`
Data: 18/11/2026. Escopo: LP principal, Granilar Sul Decor e painel de orçamentos/Inteligência Comercial.

Referência: https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md

## Brief de direção
- **Público principal:** pessoas em Porto Alegre e região que procuram soluções sob medida em granito, mármore e quartzo, de projetos funcionais a sofisticados.
- **Marca:** 28 anos de tradição; “Qualidade, Compromisso, Confiança”. Não apresentar a empresa como exclusiva de luxo.
- **Trabalho do site:** mostrar execução real, permitir explorar materiais e conduzir a um orçamento contextualizado, com contato direto por WhatsApp.
- **Decor:** uma peça real (Bandeja Gold 40 × 25 cm), fotos confiáveis, informação simples e compra na loja oficial do Mercado Livre.
- **Painel:** consulta rápida e legível de propostas, retornos, origens e dados GA4 com contexto; não confundir cliques com contatos nem aprovações com receita.

## Design system revisado
### Principal
- Pedra / grafite `#26343A`
- Vinho institucional `#902F3E`
- Calcário claro `#F3F1EC`
- Branco `#FFFFFF`
- Texto secundário `#65736F`
- Bronze suave `#CFB58C`
- Tipos: **Oswald** (títulos editoriais com influência de oficina), **Inter** (leitura/controles). Reutilizar arquivos de fonte já carregados.
- Layout: foto ampla na abertura; um serviço principal com foto real do portfólio; demais serviços como lista editorial em duas colunas; galeria de projetos e guia de pedras com operações preservadas.

### Decor
- Off-white `#FBFAF7`
- Areia/pedra `#F1ECE5`
- Texto escuro `#302F2B`
- Vinho `#7B303D`
- Linhas `#DDD5CA`
- Tipos: **Georgia** para hierarquia editorial e **Inter** para fichas e controles. Sem novas requisições de fontes.
- Layout: duas fotografias da peça com hierarquia clara; faixa de informação sem quatro caixas repetidas; ficha de produto e FAQ com divisores discretos.

### Sistema privado
- Interface pragmática. Uma única ênfase escura no KPI **Valor em negociação**, mantendo os demais indicadores mais neutros.
- Menos sombras e cantos arredondados repetidos; rótulos e informações pequenas com contraste e tamanho mais adequados.
- Todos os ajustes visuais do painel ficaram dentro de `@media screen`, sem interferir nas regras de impressão/PDF.

## Diagnóstico antes dos ajustes
1. **Identidade padronizada em excesso.** Excesso de cartões similares, numeração decorativa em serviços, rótulos em caixa alta e sombras repetidas. Prioridade: alta.
2. **Hierarquia visual da LP.** A fotografia de abertura competia com um segundo logotipo; títulos e CTA não tinham uma direção visual tão característica. Prioridade: alta.
3. **Decor excessivamente segmentada.** Quatro cartões de informação, molduras de fotos e indicadores visuais competiam com a Bandeja Gold. Prioridade: alta.
4. **Painel com cartões de mesma importância.** Dificultava encontrar rapidamente o valor em negociação e ações pendentes. Prioridade: média.
5. **Manutenção de CSS.** As LPs acumulam camadas de estilos (`premium`, `navigation`, `visuals`, `growth`). Em outra fase é recomendável consolidar as regras para reduzir conflito e facilitar manutenção. Prioridade: média.

## Melhorias aplicadas e verificadas no repositório
- Arquivo `assets/granilar-art-direction.css`, carregado na LP principal.
- Arquivo `decor/decor-art-direction.css`, carregado na Decor.
- Arquivo `orcamentos/design-review.css`, carregado apenas em tela no app interno.
- LP principal: títulos mais distintivos; retirada do segundo logotipo do hero; banner de bancada em serviço principal; lista editorial para os demais serviços; galeria com menos decoração; melhor respiro e controles no celular.
- Alteração de “Materiais disponíveis” para “Pedras e acabamentos” para não prometer estoque sem verificação.
- Decor: fotos e produto com mais destaque; retirados selos puramente decorativos; faixa de características simplificada; CTA “Conhecer a Bandeja Gold”; menu “Bandeja Gold”; FAQ mais limpo.
- Painel: valor em negociação visualmente destacado; melhor contraste/tipografia de indicadores; sombras reduzidas; foco visível.
- Os dados reais, Supabase, RLS, eventos GTM/GA4, WhatsApp, Mercado Livre, CNAME e o modelo de impressão foram preservados.

## QA realizado
- Inspecionadas as versões no GitHub.
- Estrutura HTML válida nas três páginas modificadas.
- Sem IDs repetidos, âncoras quebradas, imagens sem `alt` ou arquivos locais referenciados ausentes nessas páginas.
- Scripts inline passaram em verificação de sintaxe; novos CSS têm chaves balanceadas e regras de `prefers-reduced-motion`.
- Google Tag Manager presente nas duas LPs; `noindex` preservado no sistema interno.
- GitHub Pages confirmou execução de implantação bem-sucedida no último commit da revisão.
- **Limite:** não foi possível fazer inspeção visual pixel a pixel em navegador real autenticado nem teste responsivo por captura de tela nesta execução.

## Próxima etapa recomendada
1. **Fotos reais** da oficina, de montagem e de acabamento, com autorização, especialmente para substituir a imagem ilustrativa principal.
2. **Páginas de projetos com dados verdadeiros** por obra: materiais, medidas, desafios, acabamento e fotos de antes/depois quando disponíveis. Hoje as seis páginas são referências visuais.
3. **Decor:** link direto validado para o anúncio da Bandeja Gold em vez de apenas para a loja geral no Mercado Livre, quando estiver disponível.
4. **QA de dispositivo:** conferir iPhone pequeno (320–390px), 768px e desktop de 1440px; testar menu, filtros de projeto, guia de pedras, formulário e PDF.
5. **CSS:** consolidar as camadas atuais em arquivos de estilo mais coesos e rodar auditoria de Core Web Vitals antes de abrir novos efeitos.
6. **Métricas de resultado:** medir cliques e eventos no GA4, mas distinguir intenção de contato de lead e venda. Qualquer alteração comercial deve ser baseada em resultados.

**Decisão:** reforçar o que é real, reduzir ornamentos, respeitar o alcance amplo da marca (do funcional ao sofisticado) e manter o percurso de compra/orçamento evidente.
