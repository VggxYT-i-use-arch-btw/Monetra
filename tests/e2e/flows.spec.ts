import { expect, test } from '@playwright/test';

const missingProduct = 'Não encontramos esse produto. Tente descrever o que você procura.';
const agentName = 'Fones com cancelamento de ruído até R$ 1.500';

async function expectBlankForm(page: import('@playwright/test').Page): Promise<void> {
  await expect(page.getByRole('heading', { name: 'Novo agente' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Categoria/ })).toContainText('Selecionar');
  await expect(page.getByRole('button', { name: /Faixa de preço/ })).toContainText('Qualquer preço');
  await expect(page.getByRole('button', { name: /Marcas/ })).toContainText('Todas as marcas');
  await expect(page.getByRole('button', { name: /Lojas/ })).toContainText('0 lojas selecionadas');
}

test('cria, pausa, remove e abre produtos com os dados corretos', async ({ page }) => {
  await page.goto('/#/');
  const request = page.getByRole('textbox', { name: 'Produto ou descrição para monitorar' });
  await request.fill('Fone Sony com cancelamento de ruído até R$ 1.500');
  await page.getByRole('button', { name: 'Enviar solicitação' }).click();
  await expect(page.getByText('Entendendo sua solicitação...')).toBeVisible();
  await expect(page).toHaveURL(/#\/agentes\/novo$/);

  await expect(page.getByRole('button', { name: /Categoria/ })).toContainText('Fones');
  await expect(page.getByRole('button', { name: /Faixa de preço/ })).toContainText('Até R$ 1.500');
  await expect(page.getByRole('button', { name: /Marcas/ })).toContainText('Sony');
  await expect(page.getByRole('button', { name: /Lojas/ })).toContainText('5 lojas selecionadas');

  await page.getByRole('button', { name: /Faixa de preço/ }).click();
  await expect(page.locator('#max-price')).toHaveValue('1.500');
  await page.getByRole('button', { name: 'Aplicar' }).click();
  await expect(page.getByRole('button', { name: /Faixa de preço/ })).toContainText('Até R$ 1.500');

  await page.getByRole('button', { name: 'Criar agente' }).click();
  await expect(page.getByRole('heading', { name: 'Agente criado' })).toBeVisible();
  await expect(page.getByText('Verificamos 5 lojas a cada 6 h.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Ver agente' }).click();
  await expect(page.getByRole('heading', { name: agentName })).toBeVisible();
  const createdId = page.url().split('/').at(-1) ?? '';
  await page.goto('/#/agentes');
  const createdRow = page.locator(`[data-agent-id="${createdId}"]`);
  const options = createdRow.getByRole('button', { name: `Opções de ${agentName}` });
  await options.click();
  await page.getByRole('menuitem', { name: 'Pausar' }).click();
  await expect(createdRow.locator('.row-status-text')).toHaveText('Pausado');
  await createdRow.getByRole('button', { name: `Opções de ${agentName}` }).click();
  await expect(page.getByRole('menuitem', { name: 'Retomar' })).toBeVisible();
  await page.getByRole('menuitem', { name: 'Excluir' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Excluir agente' }).click();
  await expect(page.locator(`[data-agent-id="${createdId}"]`)).toHaveCount(0);
  const persisted = await page.evaluate((id) => {
    const raw = localStorage.getItem('monetra.data');
    if (!raw) return true;
    const data = JSON.parse(raw) as { agents?: { id?: string }[] };
    return data.agents?.some((agent) => agent.id === id) ?? true;
  }, createdId);
  expect(persisted).toBe(false);

  await page.goto('/#/produtos/sony-wh1000xm5');
  await expect(page.getByRole('status', { name: 'Carregando produto e histórico' })).toBeVisible();
  await expect(page.locator('.product-price')).toHaveText(/1\.349,00/);
  await expect(page.getByRole('img', { name: 'Histórico de preços de Sony WH-1000XM5 Black' })).toBeVisible();
  await expect(page.locator('#root')).not.toBeEmpty();

  await page.goto('/#/');
  await page.getByRole('textbox', { name: 'Produto ou descrição para monitorar' }).fill('https://www.kabum.com.br');
  await page.getByRole('button', { name: 'Enviar solicitação' }).click();
  await expect(page.getByText(missingProduct)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'O que você quer monitorar hoje?' })).toBeVisible();

  await page.getByRole('button', { name: 'Novo agente' }).click();
  await expectBlankForm(page);
  await page.goto('/#/agentes');
  await page.getByRole('link', { name: 'Novo agente' }).click();
  await expectBlankForm(page);

  await page.goto('/#/agentes/novo/criado');
  await expect(page).toHaveURL(/#\/agentes$/);
  await expect(page.getByText('Não encontramos os dados do agente criado.', { exact: false })).toBeVisible();
  await expect(page.getByText(/Verificamos 5 lojas/)).toHaveCount(0);
  await expect(page.locator('a[href*="/agentes/undefined"]')).toHaveCount(0);
});
