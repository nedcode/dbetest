const { test, expect } = require('@playwright/test');

test('01 – Login mit gültigen Daten', async ({ page }) => {
  await page.goto('index.php');

  await page.locator('#email').fill('testuser@test.de');
  await page.locator('#password').fill('Passwort123');
  await page.getByRole('button', { name: 'Einloggen' }).click();

  await expect(page).toHaveURL(/\/welcome\.php(?:[?#].*)?$/);
  await expect(page.locator('body')).toContainText('Login erfolgreich!');
});

test('02 – Login mit falschen Daten', async ({ page }) => {
  await page.goto('index.php');

  await page.locator('#email').fill('testuser@test.de');
  await page.locator('#password').fill('FalschesPasswort');
  await page.getByRole('button', { name: 'Einloggen' }).click();

  await expect(page.locator('body')).toContainText(
    'Ungültige Zugangsdaten!'
  );
});

test('03 – Login mit leeren Feldern', async ({ page }) => {
  await page.goto('index.php');

  await page.locator('#email').fill('');
  await page.locator('#password').fill('');
  await page.getByRole('button', { name: 'Einloggen' }).click();

  await expect(page.locator('body')).toContainText(
    'Bitte alle Felder ausfüllen!'
  );
});

test('04 – Navigation zur Kontaktseite', async ({ page }) => {
  await page.goto('index.php');

  await page.getByRole('link', {
    name: 'Kontakt',
    exact: true
  }).click();

  await expect(page).toHaveURL(/\/contact\.php(?:[?#].*)?$/);
});

test('05 – Navigation zur Startseite', async ({ page }) => {
  await page.goto('contact.php');

  await page.getByRole('link', {
    name: 'Startseite',
    exact: true
  }).click();

  await expect(page).toHaveURL(/\/index\.php(?:[?#].*)?$/);
});

test('06 – Kontaktformular mit leeren Pflichtfeldern', async ({ page }) => {
  await page.goto('contact.php');

  await page.locator('#name').fill('');
  await page.locator('#email').fill('');
  await page.getByRole('button', { name: 'Absenden' }).click();

  await expect(page.locator('body')).toContainText(
    'Bitte Name und E-Mail eingeben!'
  );
});

test('07 – Kontaktformular mit ungültiger E-Mail', async ({ page }) => {
  await page.goto('contact.php');

  await page.locator('#name').fill('Testnutzer');
  await page.locator('#email').fill('abc');
  await page.getByRole('button', { name: 'Absenden' }).click();

  await expect(page.locator('body')).toContainText(
    'Ungültige E-Mail!'
  );
});

test('08 – Kontaktformular korrekt ausgefüllt', async ({ page }) => {
  await page.goto('contact.php');

  await page.locator('#name').fill('Testnutzer');
  await page.locator('#email').fill('abc@test.de');
  await page.locator('#message').fill(
    'Testnachricht für die Übungsaufgabe.'
  );
  await page.getByRole('button', { name: 'Absenden' }).click();

  await expect(page.locator('body')).toContainText(
    'Nachricht erfolgreich gesendet!'
  );
});