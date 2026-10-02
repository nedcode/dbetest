const { test, expect } = require('@playwright/test');

const API = 'https://jsonplaceholder.typicode.com';
const DBE =
  'https://storage01.dbe.academy/232.02.webdev/test-023.login/';

// Dodaje odgovor servera u HTML report.
async function record(response, testInfo) {
  const text = await response.text();

  await testInfo.attach('HTTP odgovor', {
    body: Buffer.from(JSON.stringify({
      url: response.url(),
      status: response.status(),
      body: text
    }, null, 2)),
    contentType: 'application/json'
  });

  return text;
}

test('API 01 - GET: procitaj post', async ({ request }, testInfo) => {
  // 1. Posalji zahtev.
  const response = await request.get(`${API}/posts/1`);

  // 2. Sacuvaj odgovor u reportu.
  const text = await record(response, testInfo);

  // 3. Proveri status i format odgovora.
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type'])
    .toContain('application/json');

  // 4. Pretvori JSON tekst u objekat i proveri podatke.
  const data = JSON.parse(text);

  expect(data.id).toBe(1);
  expect(data.userId).toBe(1);
  expect(typeof data.title).toBe('string');
  expect(data.title.length).toBeGreaterThan(0);
});

test('API 02 - GET: nepostojeci post', async ({ request }, testInfo) => {
  const response = await request.get(`${API}/posts/999999`);

  await record(response, testInfo);

  expect(response.status()).toBe(404);
});

test('API 03 - POST: napravi post', async ({ request }, testInfo) => {
  const sent = {
    title: 'Nenad API test',
    body: 'Moja test poruka',
    userId: 1
  };

  const response = await request.post(`${API}/posts`, {
    data: sent
  });

  const text = await record(response, testInfo);

  expect(response.status()).toBe(201);

  const data = JSON.parse(text);

  expect(data).toMatchObject(sent);
  expect(data.id).toBe(101);
});

test('API 04 - DELETE: obrisi post', async ({ request }, testInfo) => {
  const response = await request.delete(`${API}/posts/1`);

  const text = await record(response, testInfo);

  expect(response.status()).toBe(200);
  expect(JSON.parse(text)).toEqual({});
});

// DBE vraca HTML: ovo su HTTP testovi PHP forme.
test('HTTP 05 - DBE: uspesan login bez browsera',
  async ({ request }, testInfo) => {
    const response = await request.post(`${DBE}index.php`, {
      form: {
        email: 'testuser@test.de',
        password: 'Passwort123'
      }
    });

    const html = await record(response, testInfo);

    // Playwright automatski prati preusmeravanje.
    expect(response.status()).toBe(200);
    expect(response.url())
      .toMatch(/\/welcome\.php(?:[?#].*)?$/);
    expect(html).toContain('Login erfolgreich!');
  }
);

test('HTTP 06 - DBE: pogresna lozinka bez browsera',
  async ({ request }, testInfo) => {
    const response = await request.post(`${DBE}index.php`, {
      form: {
        email: 'testuser@test.de',
        password: 'FalschesPasswort'
      }
    });

    const html = await record(response, testInfo);

    expect(response.status()).toBe(200);
    expect(html).toContain('Ungültige Zugangsdaten!');
  }
);