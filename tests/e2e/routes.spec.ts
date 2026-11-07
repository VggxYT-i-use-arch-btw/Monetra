import { expect, test } from '@playwright/test';
import { saveViewportScreenshot, visitRoute } from './helpers';

test('renderiza e captura todas as rotas nas três larguras definidas', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));

  const viewports = [
    { label: '390x844', width: 390, height: 844 },
    { label: '834x1112', width: 834, height: 1112 },
    { label: '1440x900', width: 1440, height: 900 },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/#/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await expect(page.getByRole('heading', { name: 'O que você quer monitorar hoje?' })).toBeVisible();
    await expect(page.locator('.loading-state')).toHaveCount(0);
    await saveViewportScreenshot(page, `${viewport.label}-inicio.png`);

    await visitRoute(page, '/ofertas');
    await expect(page.getByRole('heading', { name: 'Melhores ofertas agora' })).toBeVisible();
    await saveViewportScreenshot(page, `${viewport.label}-ofertas.png`);

    await visitRoute(page, '/agentes');
    await expect(page.getByRole('heading', { name: 'Meus agentes' })).toBeVisible();
    await saveViewportScreenshot(page, `${viewport.label}-agentes.png`);

    await visitRoute(page, '/agentes/novo');
    await expect(page.getByRole('heading', { name: 'Novo agente' })).toBeVisible();
    await saveViewportScreenshot(page, `${viewport.label}-agente-novo.png`);

    await visitRoute(page, '/agentes/agent-fones');
    await expect(page.getByRole('heading', { name: 'Fones com cancelamento de ruído até R$ 1.500' })).toBeVisible();
    await saveViewportScreenshot(page, `${viewport.label}-agente-detalhe.png`);

    await visitRoute(page, '/agentes/agent-fones/editar');
    await expect(page.getByRole('heading', { name: 'Editar agente' })).toBeVisible();
    await saveViewportScreenshot(page, `${viewport.label}-agente-editar.png`);

    await visitRoute(page, '/produtos/sony-wh1000xm5');
    await expect(page.getByRole('img', { name: 'Histórico de preços de Sony WH-1000XM5 Black' })).toBeVisible();
    await saveViewportScreenshot(page, `${viewport.label}-produto.png`);

    await visitRoute(page, '/alertas');
    await expect(page.getByRole('heading', { name: 'Alertas' })).toBeVisible();
    await saveViewportScreenshot(page, `${viewport.label}-alertas.png`);

    await visitRoute(page, '/ajustes');
    await expect(page.getByRole('heading', { name: 'Ajustes' })).toBeVisible();
    await saveViewportScreenshot(page, `${viewport.label}-ajustes.png`);

    await page.goto('/#/');
    await page.getByRole('textbox', { name: 'Produto ou descrição para monitorar' }).fill('Fones Sony até R$ 1.500');
    await page.getByRole('button', { name: 'Enviar solicitação' }).click();
    await expect(page.getByRole('heading', { name: 'Novo agente' })).toBeVisible();
    await page.getByRole('button', { name: 'Criar agente' }).click();
    await expect(page.getByRole('heading', { name: 'Agente criado' })).toBeVisible();
    await saveViewportScreenshot(page, `${viewport.label}-agente-criado.png`);
  }

  expect(consoleErrors).toEqual([]);
});
