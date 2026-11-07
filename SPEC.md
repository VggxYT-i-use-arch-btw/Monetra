You are building Monetra (by Boreas), a price-tracking web app: AI agents watch product prices over time and surface genuine deals for one product or a product line. Build the FRONT END ONLY, fully functional. No backend, no auth, no real scraping. All data comes from a mock layer that a backend can replace later.

## 1. Visual source of truth

The design boards are in docs/reference. List the folder first, since file names may differ. There are four board images, each with four phones:
- Board 1: screens 1 to 4 (home, understanding the request, new agent, agent created)
- Board 2: screens 5 to 8 (product chart, genuine deal, inflated price, not enough data)
- Board 3: screens 9 to 12 (my agents, row menu open, alerts, empty alerts)
- Board 4: screens 13 to 16 (settings, check failed sheet, desktop home, light home)

Open every board and read the text in each phone. Do not guess from memory. The boards are about 3840 x 2160. If small text is unreadable at full size without downscaling, split each board into tiles: one vertical crop per phone (four per board), plus a top crop if you need the status bar or headings. Save tiles to docs/reference/tiles/ and never modify the originals. If you cannot open or crop images, stop and tell me. Do not build from memory.

The boards are the visual reference for layout, spacing, colors, typography, components, icon style and Portuguese copy, except for the corrections below.

## 2. Corrections (the boards contain errors; fix these in the app)

- Tab bar: four tabs on every screen that has one: Início, Agentes, Alertas, Ajustes. Ignore the five-tab bar (Descobrir, Criar, Perfil) in screens 1 and 2.
- No English UI text anywhere. Agent names must be "Fones com cancelamento de ruído até R$ 1.500", "Máquinas de café Nespresso" and "Aspiradores sem fio". The settings title is "Ajustes".
- Agent product counts: 5, 3 and 4 products, consistently.
- Timestamps always use "Verificado há 12 min", "Verificado há 1 h" and "Verificado há 2 h". Never "atrás".
- Home input placeholder: "Cole o link de um produto ou descreva o que você procura...".
- Home deals section title: "Melhores ofertas agora", with "Ver todas".
- Screen 16 is not a separate layout. The light theme is the same home screen with the color tokens swapped.
- Desktop screen 15: the right column uses the same deal list as the mobile home.
- Screen 14's background header is "Meus agentes".
- Plan usage must be computed from data, not hardcoded. Screen 13's "2 de 3" contradicts screen 9's three agents.

## 3. Design system

Dark theme (default): background #0C0C0D, surfaces #161618, hairlines #26262A (1px), primary text #EDEBE6, secondary #8C8A85, tertiary #5B5955. Sage #9FB8A4 is for positive states only. Brick #C8705F is for price increases, errors and destructive actions only.

Light theme: background #F4F2EE, surfaces #FBFAF7, hairlines #DAD7D0, text #161616 / #6B6962 / #9A978F, sage #4F6B57, brick #A4523F.

Type: a high-contrast serif for headings with tight tracking (Playfair Display or Newsreader). A grotesk sans for body (Inter Tight or Geist). A monospace with tabular numerals for prices, times and small labels (JetBrains Mono or IBM Plex Mono).

Other rules: radius 14px on sheets and inputs, 999px on pills and buttons, 8px spacing grid. Section titles are text, then a dotted leader, then a right-aligned action. Segmented controls are a pill container with one raised active pill. Primary button: full-width off-white pill with dark text. Secondary: 1px outlined pill. Icons: one 1.5px rounded line set (lucide-react is fine). Store names are plain text, never logos.

Charts: hand-built SVG, no chart library. 1.5px sage line, sage area fill at 8% opacity, #26262A gridlines, no axis box.

Prices: Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }), giving R$ 1.349,00. Dates in pt-BR, e.g. "14 de out".

Avoid: gradients, glassmorphism, drop shadows, emoji, stat-card rows, generic SaaS dashboard looks.

## 4. Stack and structure

Vite + React + TypeScript + React Router. Plain CSS with variables. Set `<html lang="pt-BR">`.

Mock API in src/api with these functions: interpretRequest(text), listAgents(), getAgent(id), createAgent(input), updateAgent(id, patch), setAgentStatus(id, 'ativo' | 'pausado'), deleteAgent(id), getProduct(id), getPriceHistory(productId, range), listDeals(), listAlerts(filter), getSettings(), updateSettings(patch), testWebhook(url), connectChannel(channel, value). Persist agents, alerts and settings in localStorage. Add 200 to 600 ms of simulated latency. interpretRequest is a rules-based stub behind this single function, so an AI call can replace it later.

## 5. Routes

- / : Início
- /ofertas : all deals
- /agentes : Meus agentes
- /agentes/novo : new agent form (prefilled from the interpreter or blank)
- /agentes/novo/criado : agent created
- /agentes/:id : agent detail (not on the boards; reuse the same components)
- /agentes/:id/editar : same form as new agent, primary button "Salvar"
- /produtos/:id : product detail
- /alertas
- /ajustes

Below 900px: bottom tab bar, and the hamburger on home opens the same nav as a drawer. At 900px and above: 240px sidebar with a collapse toggle to a 72px icon rail, state persisted.

## 6. Seed data (must match the boards)

Sony WH-1000XM5 Black: stores Magalu R$ 1.349,00 (lowest), Kabum R$ 1.429,90, Shopee R$ 1.459,00, Mercado Livre R$ 1.499,00, Amazon R$ 1.549,90. Generate 90 days of daily prices, falling from about R$ 1.629,00 with a dip, ending at the lowest current price. Tune the generator so the computed 90-day min, median and max are exactly R$ 1.349,00, R$ 1.629,00 and R$ 1.899,00. Tracked for 90 days.

Dyson V8 Absolute: Amazon R$ 2.899,00, Magalu R$ 2.949,00. Advertised "from" price R$ 3.499,00 (17% off). 90-day average about R$ 2.790,00, with one spike at the start of the window toward R$ 3.499,00, then flat near the average. Tracked for 90 days.

Nespresso Essenza Mini: Kabum R$ 449,00 only. Tracked for 4 days.

Agents:
- "Fones com cancelamento de ruído até R$ 1.500": Ativo, 5 products (Sony and four others), checked 12 min ago, stores 5, frequency 6 h, brands Sony and Bose, channel Discord.
- "Máquinas de café Nespresso": Pausado, 3 products, checked 1 h ago.
- "Aspiradores sem fio": Erro, 4 products, checked 2 h ago. Error store: Shopee.

Alerts:
- Sony WH-1000XM5 Black, R$ 1.499,00 → R$ 1.349,00, -10%, Magalu, 8 min ago, tag "Mínima histórica".
- Sony WH-1000XM5 Black, R$ 1.549,90 → R$ 1.429,90, -8%, Kabum, 3 h ago, tag "Oferta genuína".
- Nespresso Essenza Mini, R$ 499,00 → R$ 449,00, -10%, Kabum, 5 h ago, no tag.

Settings: Discord connected with a placeholder webhook. E-mail and Telegram not connected. Plan: Gratuito, limits 3 agents and 20 monitored products.

## 7. Functional behavior (everything here must work)

Início
- Submitting text shows "Entendendo sua solicitação..." with a progress bar and extracted filter pills. Then it opens /agentes/novo with fields prefilled. The stub extracts category (fones, cafeteira, aspirador), price cap ("até R$ X"), brands from a known list (Sony, Bose, Nespresso, Dyson) and sets all five stores by default.
- A pasted product link (starts with http) shows loading, then opens the matching seeded product if the domain belongs to one of the five stores. Otherwise show "Não encontramos esse produto. Tente descrever o que você procura."
- Empty submit: focus the input, do not navigate.
- Up arrow submits. "+" opens a blank /agentes/novo. Bell opens /alertas.
- "Agentes ativos" rows open agent detail. Shows agents with status Ativo or Erro. "Ver todos" opens /agentes.
- Deal rows open product detail. "Ver todas" opens /ofertas.

Novo agente
- Each row opens a picker. Categoria: single select. Faixa de preço: BRL input that accepts "1500", "1.500" and "1.500,00". Marcas: multi-select chips plus free-text add. Lojas: multi-select of the five stores, at least one required. Frequência: 1 h / 6 h / 24 h segmented.
- Alertar por: Discord, E-mail and Telegram toggles. Turning Discord on without a saved webhook sends the user to Ajustes. Turning E-mail or Telegram on opens a connect sheet.
- "Criar agente" stays disabled until a category and at least one store are set. It creates an Ativo agent and goes to /agentes/novo/criado.

Agente criado
- The summary and the sentence use real values: store count, frequency and channels. "Ver agente" goes to agent detail. "Voltar ao início" goes to /.

Meus agentes
- Todos / Ativos / Pausados filters work. An empty filter shows the empty state with "Criar agente".
- Row tap opens agent detail. Erro rows open the error sheet from screen 14 instead. "Ver agente" in the sheet opens detail. "Dispensar" closes it.
- Three-dot menu: Editar opens the edit form. Pausar / Retomar toggles status and the label flips. Excluir opens a confirm sheet, then deletes and returns to the list.
- "Novo agente" opens /agentes/novo.

Agent detail
- Name, status, last check, frequency, stores and channels. Its product list shows current price and a verdict badge per product, and each row opens product detail. Actions: Editar, Pausar / Retomar, Excluir.

Produto
- Serif title, back arrow, share button (navigator.share, falling back to copy link with a "Link copiado" toast).
- Big monospace price = lowest current store price, with the store name below.
- Three stats: "Menor em 90 dias", "Mediana", "Maior", all computed from the series.
- Range control: 7 dias / 30 dias / 90 dias / Tudo. It updates the series, x-axis labels and y-axis ticks. Default: 30 dias.
- Chart tooltip: mouse hover or touch drag shows price, date and a vertical crosshair with a dot on the line.
- If the advertised "from" price exists, draw a dashed line labeled "Referência" at that price.
- Verdict, computed in this order:
  1. Dados insuficientes if tracked days < 14. Sentence: "Acompanhamos este produto há X dias. Precisamos de pelo menos 14 dias para avaliar promoções."
  2. Preço inflado antes if the "from" price is more than 15% above the 90-day average and the current price is not below that average. Sentence: "O desconto mostra X%, mas a média em 90 dias foi R$ ..."
  3. Oferta genuína if the current price is at or below the 90-day minimum, or at or below 85% of the median. Sentence: "Menor preço em 90 dias e X% abaixo da mediana."
  4. Otherwise a neutral verdict with no badge: "Preço dentro da faixa dos últimos 90 dias."
- Store rows sorted by price. The lowest gets a sage "Menor preço" label and the solid "Ir para a loja" pill. Others get a text link. Links open the store home pages (magazineluiza.com.br, kabum.com.br, shopee.com.br, mercadolivre.com.br, amazon.com.br) in a new tab with rel="noopener noreferrer".
- Under 14 days: chart shows only tracked points on a hatched baseline with "Ainda coletando dados deste produto." One store row.

Alertas
- Todos / Ofertas genuínas / Mínimas históricas filters work.
- Each alert: product name, monospace price change (new price primary, old tertiary), sage drop %, store, relative time, tag if any. Row tap opens product detail.
- Empty state (no alerts, or none matching the filter): screen 12 with "Criar agente" to /agentes/novo.

Ajustes
- Discord: shows Conectado or Não conectado. Connected shows the masked webhook input with a reveal toggle and a "Salvar" button when changed. Validate that the URL starts with https://discord.com/api/webhooks/ and has an id and token, showing an inline error in brick otherwise.
- "Testar webhook" sends a real POST with a test message from the browser. If the browser blocks it, show "O navegador não conseguiu enviar o teste. O teste real será feito pelo backend."
- E-mail and Telegram rows open a connect sheet. "Conectar" saves and shows Conectado in sage. Add "Desconectar".
- Aparência: Escuro / Claro / Sistema, persisted, applied immediately.
- Plano: "Plano gratuito" in serif. Agentes and Produtos monitorados with bars computed from data. "Ver planos" opens a sheet with Gratuito (current) and Pro, where Pro's button reads "Em breve" and is disabled. No payments.

## 8. Quality bar

- Mobile first. Check at 390 x 844, 834 x 1112 and 1440 x 900.
- All visible text in pt-BR except brand and product names. No English strings, no lorem ipsum, no placeholder copy.
- Every interactive element has a visible focus state and an accessible name. Respect prefers-reduced-motion.
- Every list has loading skeletons, an empty state with one clear action, and an error state where relevant.
- Tests: unit tests for the parser, verdict rules, price and date formatting, and series min/median/max. One end-to-end test: home, type request, create agent, agent appears in list, pause, delete.
- `npm run build` and typecheck pass with zero errors.

## 9. Verify against the boards

Take screenshots of every route at 390 x 844 and 1440 x 900. Save them to tiles/compare/ and compare each with its board tile. List every visible difference, then fix the ones you can. Do not stop at "looks similar".

## 10. Deliver

- README: how to run, route map, which parts are mocked, and how to swap the mock API for a backend.
- Final message: a checklist of what works, what is mocked, and any board deviation you kept on purpose, with the reason.

Do not add features beyond this list. If a screen is needed that the boards do not show, reuse the existing components and say so.
Use sub-agents to complete the task as fast as you can