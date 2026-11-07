# Monetra by Boreas

Aplicação web responsiva para acompanhar preços e identificar ofertas. O projeto usa Vite, React, TypeScript estrito, React Router com `HashRouter` e CSS próprio. Os dados são simulados no navegador.

## Executar localmente

```sh
npm ci
npm run dev
```

Para compilar, use `npm run build`. Os testes são executados com `npm test` e `npm run test:e2e`.

## Publicar no GitHub Pages

O workflow publica a pasta `dist/` ao enviar alterações para `main`. Nas configurações do repositório, escolha **Settings > Pages > Source = GitHub Actions**.

URL após a publicação: `https://<user>.github.io/<repo>/`.

## Rotas

- `/#/` — Início
- `/#/ofertas` — Melhores ofertas
- `/#/agentes` — lista e filtros de agentes
- `/#/agentes/novo` — criação de agente
- `/#/agentes/novo/criado` — confirmação de criação
- `/#/agentes/:id` — detalhes do agente
- `/#/agentes/:id/editar` — edição
- `/#/produtos/:id` — histórico, estatísticas e lojas
- `/#/alertas` — alertas filtráveis
- `/#/ajustes` — canais, aparência e plano

## Dados simulados

`src/api` implementa a camada mock substituível por um backend. Produtos, preços, alertas e análise de texto são simulados; não há scraping nem autenticação. O botão de teste do Discord envia um POST real do navegador para a URL informada. Para integrar um backend, preserve os tipos e as assinaturas da API e substitua suas implementações por chamadas HTTP.

Agentes, alertas, ajustes e o webhook do Discord ficam no `localStorage` do navegador. Qualquer pessoa com acesso a esse navegador pode ler o webhook salvo. O webhook inicial é apenas um placeholder. Alertas reais e armazenamento seguro do segredo precisam de um backend.

## Referências visuais

Os quatro boards estão em `docs/reference/` como cópias WebP reduzidas. Capturas de teste ficam fora do controle de versão.
