# Maintaining This Repository

This file governs the standards kit itself, not the business projects adopting it.

- Keep `SKILL.md` concise. Put task-specific rules in `references/`, exportable drafts in `assets/`, and contributor explanations in `docs/`.
- Preserve project-specific decisions. Do not turn defaults into universal framework, ORM, package-layout, or cloud requirements.
- Keep root scripts dependency-free and compatible with Node.js 22+. Examples may declare their own pinned build dependencies. Test Linux and Windows path semantics; never overwrite existing destination files.
- Run `npm run check` after changes. For export behavior, test both successful and rejected operations, not just text snapshots.
- For examples or evaluation changes, also run the applicable example/negative checks; keep evaluation outputs isolated and distinguish infrastructure failures from behavior results.
- Synchronize `package.json`, Skill metadata, profile template, sources and changelog when changing versions.
- Keep personal paths, credentials and local work artifacts out of distributable content. Do not claim repository checks validate consuming applications.
- Keep detailed workflow explanations in `docs/` and selectable task requests in `prompts/`; do not make every task load the whole library. Preserve the distinction between pre-code guidance and executable checks.
- The maintainer has chosen to publish without a LICENSE. Preserve `private: true` and `license: UNLICENSED`; do not add a license or describe public visibility as an open-source grant. Respect third-party notices independently.
