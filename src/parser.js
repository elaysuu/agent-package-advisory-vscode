'use strict';
// Parse package.json / requirements.txt into [{name, version, ecosystem, line}]
function parsePackageJson(text) {
  const out = []; let json;
  try { json = JSON.parse(text); } catch { return out; }
  const lines = text.split(/\r?\n/);
  for (const sec of ['dependencies', 'devDependencies', 'optionalDependencies']) {
    const deps = json[sec] || {};
    for (const [name, spec] of Object.entries(deps)) {
      const m = String(spec).match(/(\d+\.\d+\.\d+[\w.+-]*)/);
      if (!m) continue;
      const esc = name.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
      let line = lines.findIndex(l => new RegExp('"' + esc + '"\\s*:').test(l));
      out.push({ name, version: m[1], ecosystem: 'npm', line: Math.max(line, 0) });
    }
  }
  return out;
}
function parseRequirements(text) {
  const out = [];
  text.split(/\r?\n/).forEach((raw, i) => {
    const l = raw.split('#')[0].trim();
    const m = l.match(/^([A-Za-z0-9][A-Za-z0-9._-]*)(?:\[[^\]]*\])?\s*==\s*([A-Za-z0-9.+!-]+)/);
    if (m) out.push({ name: m[1], version: m[2], ecosystem: 'PyPI', line: i });
  });
  return out;
}
async function queryOsv(dep, fetchImpl = globalThis.fetch) {
  const r = await fetchImpl('https://api.osv.dev/v1/query', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ version: dep.version, package: { name: dep.name, ecosystem: dep.ecosystem } })
  });
  if (!r.ok) throw new Error('OSV HTTP ' + r.status);
  const j = await r.json();
  return (j.vulns || []).map(v => ({ id: v.id, summary: v.summary || '', aliases: v.aliases || [] }));
}
module.exports = { parsePackageJson, parseRequirements, queryOsv };
