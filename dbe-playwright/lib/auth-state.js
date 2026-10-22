const path = require('node:path');
const fs = require('node:fs');
const authStatePath = path.resolve(__dirname, '..', 'playwright', '.auth', 'user.json');
function hasAuthState() {
  if (!fs.existsSync(authStatePath)) return false;
  try {
    const state = JSON.parse(fs.readFileSync(authStatePath, 'utf8'));
    return Array.isArray(state.cookies) && Array.isArray(state.origins);
  } catch { return false; }
}
module.exports = { authStatePath, hasAuthState };
