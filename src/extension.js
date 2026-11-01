'use strict';
const vscode = require('vscode');
const { parsePackageJson, parseRequirements, queryOsv } = require('./parser');
let coll, status;
function depsFor(doc) {
  const f = doc.fileName.replace(/\\/g, '/').split('/').pop();
  if (f === 'package.json') return parsePackageJson(doc.getText());
  if (/^requirements.*\.txt$/.test(f)) return parseRequirements(doc.getText());
  return null;
}
async function scan(doc) {
  const deps = depsFor(doc); if (!deps) return;
  status.text = '$(sync~spin) Advisory: scanning'; status.show();
  const diags = []; let hits = 0, errors = 0;
  await Promise.all(deps.map(async d => {
    try {
      const vulns = await queryOsv(d);
      if (!vulns.length) return;
      hits++;
      const line = doc.lineAt(Math.min(d.line, doc.lineCount - 1));
      const dg = new vscode.Diagnostic(line.range,
        `${d.name}@${d.version}: ${vulns.length} known advisor${vulns.length > 1 ? 'ies' : 'y'} — ` +
        vulns.slice(0, 3).map(v => v.id + (v.summary ? ' (' + v.summary + ')' : '')).join('; '),
        vscode.DiagnosticSeverity.Warning);
      dg.source = 'OSV'; diags.push(dg);
    } catch { errors++; }
  }));
  coll.set(doc.uri, diags);
  status.text = hits ? `$(warning) Advisory: ${hits} affected` : '$(shield) Advisory: clean';
  status.tooltip = `${deps.length} pinned deps checked via OSV.dev${errors ? `, ${errors} errors` : ''}`;
}
function activate(ctx) {
  coll = vscode.languages.createDiagnosticCollection('agentPackageAdvisory');
  status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 50);
  status.command = 'agentPackageAdvisory.scan'; status.text = '$(shield) Advisory';
  ctx.subscriptions.push(coll, status,
    vscode.commands.registerCommand('agentPackageAdvisory.scan', () => {
      const e = vscode.window.activeTextEditor;
      if (e) scan(e.document); else vscode.window.showInformationMessage('Open a package.json or requirements.txt first.');
    }),
    vscode.workspace.onDidOpenTextDocument(scan),
    vscode.workspace.onDidSaveTextDocument(scan));
  vscode.workspace.textDocuments.forEach(scan);
}
function deactivate() {}
module.exports = { activate, deactivate };
