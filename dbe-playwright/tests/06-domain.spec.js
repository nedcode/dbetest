const { test, expect } = require('@playwright/test');
const { validDate, validateEvent, mayReadEvent, classifyRisk } = require('../lib/qe-domain.cjs');
test.describe('QE Lab domain and boundary checks @ci', () => {
  for (const [date,expected] of [
    ['2024-02-29',true],['2025-02-29',false],['2026-02-30',false],
    ['2026-12-31',true],['2026-00-10',false],['2026-13-01',false],
    ['2026-1-01',false],['abc',false],['',false],['2026-04-31',false],
    ['2026-01-01T00:00:00Z',false]
  ]) test('date '+JSON.stringify(date), () => expect(validDate(date)).toBe(expected));
  for (const [title,date,expected] of [
    ['Training','2026-10-22',null],['','2026-10-22','invalid_title'],
    [' ','2026-10-22','invalid_title'],['a'.repeat(101),'2026-10-22','invalid_title'],
    ['Good','2026-02-30','invalid_date'],['Good',null,'invalid_date']
  ]) test('event validation '+JSON.stringify([title,date]), () => {
    expect(validateEvent({title,date})).toBe(expected);
  });
  for (const [actor,event,expected] of [
    [{id:'a',role:'user'},{ownerId:'a'},true],
    [{id:'b',role:'user'},{ownerId:'a'},false],
    [{id:'z',role:'admin'},{ownerId:'a'},true],
    [null,{ownerId:'a'},false],
    [{id:'a',role:'user'},null,false]
  ]) test('authorization '+JSON.stringify([actor,event]), () => {
    expect(mayReadEvent(actor,event)).toBe(expected);
  });
  for (const [level,expected] of [['critical','block'],['high','block'],['medium','review'],['low','monitor'],['other','unknown']])
    test('risk classification '+level, () => expect(classifyRisk(level)).toBe(expected));
});
