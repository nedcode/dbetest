const { test, expect } = require('@playwright/test');
test.describe('Public page accessibility smoke @external',()=>{
  test('document has non-empty title',async({page})=>{
    await page.goto('https://www.dbe.academy/',{waitUntil:'domcontentloaded'});
    expect((await page.title()).trim().length).toBeGreaterThan(0);
  });
  test('html declares a language',async({page})=>{
    await page.goto('https://www.dbe.academy/',{waitUntil:'domcontentloaded'});
    const lang=await page.locator('html').getAttribute('lang');
    expect(lang && lang.trim().length).toBeGreaterThan(0);
  });
});
