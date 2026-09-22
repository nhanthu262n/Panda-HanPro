# PanTutor Milestone 1 — Vocabulary Intelligence Data Model

## Priority roadmap

1. Standardize Evidence Schema.
2. Build the five-dimension Learner Model: FORM, SOUND, MEANING, USAGE, PRODUCTION.
3. Separate SM-2 review timing from mastery diagnosis.
4. Build an Explainable Adaptive Engine and Next Best Action.
5. Add Vocabulary-to-Problem-Solving.
6. Add learner Reflection and AI Learning Mirror.
7. Enable teachers to approve, edit, or reject recommendations.
8. Complete provenance and label mnemonic content correctly.
9. Tighten Firebase authorization.
10. Connect Generative AI only to permitted functions.

## Milestone 1 implementation

- Extended the existing normalization flow in `js/app-02.js`; no parallel vocabulary database was introduced.
- Preserved every legacy field and added `character_intelligence`, `usage_intelligence`, `pedagogy`, and `provenance`.
- Added null-safe normalization and legacy fallbacks from `chietu_vi/chietu_en`, `cumtu`, `examples`, `mc`, `unscramble`, and `fill`.
- Added six enriched samples: 方便, 情况, 安排, 联系, 需要, 其实.
- Added visible provenance status to the vocabulary detail card.
- Mnemonics are explicitly labelled as learning aids, not historical etymology.
- Existing SM-2 statistics and functions were not changed.

## Automated checks

Run `node tests/test-vocabulary-intelligence.js` from the project root. The test validates the 2,254-record load, schema safety, six sample records, search index presence, legacy fallbacks, legacy card/quiz fields, and SM-2 isolation.

Result on 2026-09-22: **28/28 checks passed** and JavaScript syntax validation passed. A headless browser smoke test could not be executed in this workspace because the Playwright browser binary was not installed; load-sensitive behavior is covered by the normalization, search-index, detail-data, legacy-quiz, and SM-2 compatibility checks above.
