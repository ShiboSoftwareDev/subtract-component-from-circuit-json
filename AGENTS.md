# Repository conventions

- Follow the current [tscircuit handbook](https://github.com/tscircuit/handbook),
  especially `guides/code.md` and `guides/bootstrapping-repos.md`.
- Keep exactly one `test(...)` declaration in each `*.test.ts` or `*.test.tsx`
  file. Split additional cases into clearly named files.
- Give circuit behavior a visual SVG snapshot wherever practical. A comparison
  snapshot must visibly label its original and transformed sides.
- Use real upstream fixtures when a test claims to cover a named board. Pin the
  upstream revision so the test remains reproducible.
- Use Bun for dependency installation, scripts, and tests.
