const assert = require('assert');
const { parsePackageJson, parseRequirements, queryOsv } = require('../src/parser');
(async () => {
  const p = parsePackageJson('{\n "dependencies": {\n  "lodash": "4.17.15",\n  "x": "latest"\n }\n}');
  assert.deepStrictEqual(p, [{ name: 'lodash', version: '4.17.15', ecosystem: 'npm', line: 2 }]);
  const r = parseRequirements('# c\nrequests==2.19.0\nflask>=1.0\nDjango[x]==2.2.0 # pin\n');
  assert.strictEqual(r.length, 2); assert.strictEqual(r[1].line, 3);
  const v = await queryOsv(p[0]);
  console.log('lodash@4.17.15 advisories:', v.length, v.map(x => x.id).join(', '));
  assert.ok(v.length > 0);
  console.log('ALL TESTS PASSED');
})().catch(e => { console.error(e); process.exit(1); });
