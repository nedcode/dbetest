const { test, expect } = require('@playwright/test');
const { classifyRisk } = require('../lib/qe-domain.cjs');
const cases=[
 {level:'critical',expected:'block'},
 {level:'high',expected:'block'},
 {level:'medium',expected:'review'},
 {level:'low',expected:'monitor'},
 {level:'unexpected',expected:'unknown'}
];
test.describe('Independent risk oracle for offline AI eval @ci',()=>{
  for(const c of cases) test('expected '+c.level,()=>{
    expect(classifyRisk(c.level)).toBe(c.expected);
  });
});
