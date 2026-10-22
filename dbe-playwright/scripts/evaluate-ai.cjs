// Offline, deterministic evaluation of example AI outputs. Not a live model benchmark.
const { classifyRisk } = require('../lib/qe-domain.cjs');
const dataset=[
 {id:'e1',input:'critical',expected:'block',actual:'block'},
 {id:'e2',input:'high',expected:'block',actual:'block'},
 {id:'e3',input:'medium',expected:'review',actual:'review'},
 {id:'e4',input:'low',expected:'monitor',actual:'monitor'},
 {id:'e5',input:'critical',expected:'block',actual:'review'}
];
const outcomes=dataset.map(d=>({...d,reference:classifyRisk(d.input),pass:d.expected===d.actual}));
const accuracy=outcomes.filter(x=>x.pass).length/outcomes.length;
const falseApprovals=outcomes.filter(x=>x.expected==='block'&&x.actual!=='block').length;
const report={type:'offline-fixture-demo',cases:outcomes.length,accuracy,falseApprovals,outcomes};
console.log(JSON.stringify(report,null,2));
if (outcomes.some(x=>x.reference!==x.expected)) process.exitCode=1;
