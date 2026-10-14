# Plan generation checks

Run deterministic rule checks from the repository root with Node.js:

```sh
node --test tests/plan-engine.test.cjs
```

The fixtures are synthetic, not Lemon's actual learning evidence. Eighteen cases cover: reference versus measured provenance; identical task scope/quantity/difficulty/quality; recent incomplete or low-quality work; no linear extrapolation; required work overflow; same-subject extracurricular load; missing homework details; duplicate/completed exclusion; the 500-character parent observation; explicit split permission and remaining work; teaching budgets; one improvement focus; and exact time accounting.

## Implementation boundaries

- `docs/plan-engine.js` is a pure local rules engine. It makes no model or network requests and never writes measured results.
- `docs/plan-generator.js` renders/edit-selects proposals. Date/task/history changes invalidate a proposal; there is no silent replan.
- `LemonTaskPlanner` in `docs/task-ruler.js` owns candidate storage and adoption. It retains the original task-ruler key and legacy data. Adoption appends only selected, non-duplicate tasks; actual/quality/result fields remain blank. A split creates a separate remainder candidate rather than swallowing required scope.
- Estimates use adult explicit adjustment, otherwise up to three quality-preserved same-condition measurements in the preceding 60 days, otherwise a matching provisional reference upper bound. No match means a visible unknown, not a made-up number. Quality or completion regression blocks an unjustified faster reference.
- Fixed classes affect discretionary load, not invented class durations. Known course schedules without actual assignment scope stay pending. Unknown textbook progress is not used to invent assignments.
- Existing agreed tasks reserve their original budget and remain untouched. If a required part cannot fit, it remains visible as pending/remaining; accepting another selected part does not imply the full day is complete.

## Browser verification for this change

Native Chromium DOM checks exercised staged tasks with empty time, generate/edit/adopt, measurement feedback driving the next day's estimate, stale proposals, duplicate protection, date changes, reload, and 500→100+400 remainder preservation. Screens were inspected at 1440, 768 and 390 CSS pixels without horizontal overflow.

This environment prohibited browser URL navigation. The browser checks therefore rendered the exact local build in an `about:blank` fixture with explicit storage/fetch doubles. They are not a live production-network or cross-device synchronization test. GitHub Pages deployment status and the shipped file hashes are verified separately. The rules do not yet prove educational outcomes; those require Lemon's real subsequent feedback.
