const { execFileSync } = require('node:child_process');
const path = require('node:path');
let files;
try {
  const repoRoot = path.resolve(__dirname, '..', '..');
  files = execFileSync('git', ['-C', repoRoot, 'ls-files', '-z'], { encoding:'utf8' }).split('\0').filter(Boolean);
} catch (e) {
  console.error('Git repository is required for tracking safety check.'); process.exit(1);
}
const bad = files.filter(p => {
  p = p.replace(/\\/g, '/');
  return ((/(^|\/)\.env($|\.)/.test(p) && !p.endsWith('.env.example')) ||
    /(^|\/)playwright\/\.auth\//.test(p) ||
    /(^|\/)testergebnisse\//.test(p) ||
    /(^|\/)link-report\.html$/.test(p) ||
    /(^|\/)(test-results|playwright-report|screenshots|blob-report)\//.test(p) ||
    /(^|\/)(storage-state|auth-state)[^/]*\.json$/.test(p));
});
if (bad.length) { console.error('Sensitive tracked paths:\n'+bad.join('\n')); process.exit(1); }
console.log('No known sensitive artifact paths are tracked.');
