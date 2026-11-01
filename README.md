# Agent Package Advisory

**Install:** [Open VSX — elaysuu.agent-package-advisory](https://open-vsx.org/extension/elaysuu/agent-package-advisory)

Checks pinned dependencies in `package.json` and `requirements*.txt` against the public [OSV.dev](https://osv.dev) vulnerability database when you open or save the file, and shows a warning on each affected line.

- Command: **Agent Package Advisory: Scan dependencies**
- Status bar item shows clean / number of affected packages (click to rescan)
- No account, no API key. Package names and versions are sent to `api.osv.dev`; nothing else.

**Limits:** only exact versions are checked (`==` in requirements, the first `x.y.z` in an npm range). Lockfiles and transitive deps are not scanned. Absence of a warning is not a security guarantee.

## Pro / Team
Need CI checks or team-wide agent config audits? See [Agent Advisory Gate Pro](https://setrov.gumroad.com/l/zdojns) and the [agent-config-audit Team pack](https://setrov.gumroad.com/l/cpclzn).

## License
MIT
