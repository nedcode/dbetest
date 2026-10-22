function validDate(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s+'T00:00:00Z');
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0,10) === s;
}
function validateEvent(v) {
  if (!v || typeof v !== 'object') return 'invalid_payload';
  if (typeof v.title !== 'string' || !v.title.trim() || v.title.trim().length > 100) return 'invalid_title';
  if (!validDate(v.date)) return 'invalid_date';
  return null;
}
function mayReadEvent(actor, event) {
  return !!actor && !!event && (actor.role === 'admin' || event.ownerId === actor.id);
}
function classifyRisk(level) {
  return ({critical:'block',high:'block',medium:'review',low:'monitor'})[level] || 'unknown';
}
module.exports = { validDate, validateEvent, mayReadEvent, classifyRisk };
