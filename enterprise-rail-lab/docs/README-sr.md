# Kako da pokreneš projekat na svom Windows laptopu

**Northstar Rail** je nova, izmišljena enterprise-style aplikacija. Nije povezana sa Deutsche Bahn niti sa DBE Academy.

## Najlakše: zaseban VS Code folder

1. Raspakuj `enterprise-rail-lab.zip` u `C:\Users\delfu\enterprise-rail-lab`.
2. Otvori taj folder kroz **File → Open Folder** u VS Code.
3. Pokreni ove komande u PowerShell terminalu:

```powershell
npm.cmd ci
npx.cmd playwright install chromium
npm.cmd run test:unit
npm.cmd run test:ci
```

Pokretanje aplikacije:

```powershell
npm.cmd start
```

Otvori http://127.0.0.1:43910/. Demo login: `alice@example.test` / `demo-pass`. Aplikacija i svi sistemi plaćanja su simulacije.

## Pregled primera

- `tests\api.spec.js` — cene, broj mesta, rezervacija, plaćanje, izdavanje karte, odbijanje, idempotentnost.
- `tests\security.spec.js` — 401, 403, tuđe rezervacije, promenjeni tokeni, ovlašćenja support-a.
- `tests\ui.spec.js` — stvaran browser, login, kupovina simulirane karte, negativni scenariji.
- `docs\requirements.md` — poslovna pravila koja QA treba da proveri pre nego što AI generiše assertions.

## Prvi Playwright AI agent zadatak

Koristi Planner na `docs\requirements.md` da napravi test plan za NRS-06 i NRS-07, pa Generator da napravi zaseban test. Healer može analizirati neuspele testove, ali ne sme izmeniti očekivanja da bi dobio zelen rezultat.

**Važno:** Lokalni `.vscode\mcp.json` iz ranijeg DBE projekta ne moraš da kopiraš. Ako već imaš Playwright MCP i Test Agents u VS Code-u, možeš ih koristiti i nad ovim folderom nakon odobravanja workspace alata.
