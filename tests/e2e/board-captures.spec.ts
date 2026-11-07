import { expect, test } from '@playwright/test';
import { saveViewportScreenshot } from './helpers';

test('captura os estados mostrados nos dezesseis quadros de referência', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.getByRole('heading', { name: 'O que você quer monitorar hoje?' })).toBeVisible();
  await expect(page.locator('.loading-state')).toHaveCount(0);
  await saveViewportScreenshot(page, 'board-01-inicio.png');

  await page.getByRole('textbox', { name: 'Produto ou descrição para monitorar' }).fill('Fones Sony até R$ 1.500');
  await page.getByRole('button', { name: 'Enviar solicitação' }).click();
  await expect(page.getByText('Entendendo sua solicitação...')).toBeVisible();
  await saveViewportScreenshot(page, 'board-02-entendendo.png');
  await expect(page.getByRole('heading', { name: 'Novo agente' })).toBeVisible();
  await saveViewportScreenshot(page, 'board-03-novo-agente.png');
  await page.getByRole('button', { name: 'Criar agente' }).click();
  await expect(page.getByRole('heading', { name: 'Agente criado' })).toBeVisible();
  await saveViewportScreenshot(page, 'board-04-agente-criado.png');

  await page.goto('/#/produtos/sony-wh1000xm5');
  await expect(page.getByRole('img', { name: 'Histórico de preços de Sony WH-1000XM5 Black' })).toBeVisible();
  await page.locator('.price-chart').evaluate((chart) => {
    const bounds = chart.getBoundingClientRect();
    chart.dispatchEvent(new PointerEvent('pointermove', {
      bubbles: true,
      clientX: bounds.left + bounds.width * .75,
      clientY: bounds.top + bounds.height * .5,
    }));
  });
  await expect(page.locator('.chart-tooltip')).toBeVisible();
  await saveViewportScreenshot(page, 'board-05-produto-sony.png');
  await page.getByRole('button', { name: '90 dias' }).click();
  await expect(page.getByRole('button', { name: '90 dias' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('img', { name: 'Histórico de preços de Sony WH-1000XM5 Black' })).toBeVisible();
  await page.evaluate(() => document.querySelector('.verdict-label')?.scrollIntoView({ block: 'start' }));
  await saveViewportScreenshot(page, 'board-06-oferta-genuina.png');

  await page.goto('/#/produtos/dyson-v8-absolute');
  await expect(page.getByText('Preço inflado antes')).toBeVisible();
  await saveViewportScreenshot(page, 'board-07-preco-inflado.png');
  await page.goto('/#/produtos/nespresso-essenza-mini');
  await expect(page.getByText('Dados insuficientes')).toBeVisible();
  await page.getByRole('button', { name: '7 dias' }).click();
  await expect(page.getByRole('button', { name: '7 dias' })).toHaveAttribute('aria-pressed', 'true');
  await saveViewportScreenshot(page, 'board-08-dados-insuficientes.png');

  await page.evaluate(() => localStorage.clear());
  await page.goto('/#/agentes');
  await expect(page.getByRole('heading', { name: 'Meus agentes' })).toBeVisible();
  await expect(page.locator('.loading-state')).toHaveCount(0);
  await saveViewportScreenshot(page, 'board-09-agentes.png');
  await page.getByRole('button', { name: 'Opções de Fones com cancelamento de ruído até R$ 1.500' }).first().click();
  await saveViewportScreenshot(page, 'board-10-menu-agente.png');

  await page.goto('/#/alertas');
  await expect(page.getByRole('heading', { name: 'Alertas' })).toBeVisible();
  await expect(page.locator('.loading-state')).toHaveCount(0);
  await saveViewportScreenshot(page, 'board-11-alertas.png');
  await page.evaluate(() => {
    const raw = localStorage.getItem('monetra.data');
    if (!raw) return;
    const data = JSON.parse(raw) as { alerts?: unknown[] };
    data.alerts = [];
    localStorage.setItem('monetra.data', JSON.stringify(data));
  });
  await page.reload();
  await expect(page.getByText('Ainda não há alertas')).toBeVisible();
  await saveViewportScreenshot(page, 'board-12-alertas-vazio.png');

  await page.goto('/#/ajustes');
  await expect(page.getByRole('heading', { name: 'Ajustes' })).toBeVisible();
  await expect(page.locator('.loading-state')).toHaveCount(0);
  await saveViewportScreenshot(page, 'board-13-ajustes.png');

  await page.goto('/#/agentes');
  await expect(page.locator('.row-open')).toBeVisible();
  await page.locator('.row-open').filter({ hasText: 'Aspiradores sem fio' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await saveViewportScreenshot(page, 'board-14-erro-loja.png');

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/#/');
  await expect(page.getByRole('heading', { name: 'O que você quer monitorar hoje?' })).toBeVisible();
  await expect(page.locator('.loading-state')).toHaveCount(0);
  await saveViewportScreenshot(page, 'board-15-inicio-desktop.png');

  await page.goto('/#/ajustes');
  await expect(page.getByRole('button', { name: 'Claro' })).toBeVisible();
  await page.getByRole('button', { name: 'Claro' }).click();
  await page.goto('/#/');
  await expect(page.locator('.loading-state')).toHaveCount(0);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await saveViewportScreenshot(page, 'board-16-inicio-claro.png');
});
