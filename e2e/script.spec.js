// @ts-check
import { test, expect } from '@playwright/test';

const pageUrl = 'https://gmmonsalve.github.io/QA-Workshop/'


test.beforeEach(async ({ page }) => {
  await page.goto(pageUrl);
});

test('has title', async ({ page }) => {
  await expect(page).toHaveTitle(/Tabla de Posiciones/);
});

test('When a match is registered the table should show the registers', async ({ page }) => {
  await teamsRegister(page,"Junior","Nacional");
  await selectTeams(page,'0','1')
  await registerMatch(page);
  
  const count = await page.locator('table tbody tr').count()
  await expect(count).toBe(2)

});

test('When filter by team is used there should be only one result in table', async ({ page }) => {
  await teamsRegister(page,"Junior","Nacional");
  await selectTeams(page,'0','1')
  await registerMatch(page);

  await page.getByLabel('Filtrar por Equipo').selectOption('1');

  const count = await page.locator('table tbody tr').count()
  await expect(count).toBe(1)
});

test('When filter by position is used there should be only one result in table', async ({ page }) => {
  await teamsRegister(page,"Junior","Nacional");
  await selectTeams(page,'0','1')
  await registerMatch(page);

  await page.getByLabel('Filtrar por Posición').selectOption('1');

  const count = await page.locator('table tbody tr').count()
  await expect(count).toBe(1)
});

test('When the same team is selected page should trigger an alert', async ({ page })=>{
  await teamsRegister(page,"Junior","Nacional");
  await selectTeams(page,'0','0')
  await registerMatch(page);

  await page.on('dialog', async dialog => {
    expect(dialog.message).toEqual("El equipo local no puede ser el mismo que el equipo visitante")
  });
})

test('When a match already registered is submited it should show an alert', async ({ page })=>{
  await teamsRegister(page,"Junior","Nacional");
  await selectTeams(page,'0','1')
  await registerMatch(page);

  await selectTeams(page,'0','1')
  await registerMatch(page);

  await page.on('dialog', async dialog => {
    expect(dialog.message).toEqual("Ya se ha registrado un partido entre estos equipos")
  });
})

  async function teamsRegister(page,team1,team2){
    await page.getByLabel('Nombre del Equipo').fill(team1);
    await page.getByRole('button', { name: 'Registrar Equipo' }).click();
    await page.getByLabel('Nombre del Equipo').fill(team2);
    await page.getByRole('button', { name: 'Registrar Equipo' }).click();
  }

  async function registerMatch(page){
    await page.getByLabel('Goles Local').fill('1');
    await page.getByLabel('Goles Visitante').fill('1');
    await page.getByRole('button', { name: 'Registrar Resultado' }).click();
  }

  async function selectTeams(page,idLocal,idVisitante){
    await page.getByLabel('Equipo Visitante').selectOption(idVisitante);
    await page.getByLabel('Equipo Local').selectOption(idLocal);
  }