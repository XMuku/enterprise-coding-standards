# uni-app Example Constraints

- Preserve Vue 3, TypeScript and uni-app H5 / mp-weixin support. Do not replace this with a web-only Vue app.
- Pages live in `src/pages`, reusable UI in `src/components`, domain rules in `src/domain`, API adapters in `src/api`, shared contracts in `src/types`.
- Keep camelCase JSON fields, PascalCase Vue component filenames and explicit types. Do not use `any` or disable lint/type/test checks to pass.
- Keep the mock adapter explicit. This example does not contact a backend or require an account. Do not add remote services or dependencies for a small feature.
- Before edits, briefly identify affected locations, contracts and intended checks. Read only applicable standards.
- Run `npm run check`. H5 and mp-weixin builds are separate gates; neither proves real-device interaction.
- Preserve user changes; do not alter project rules, package scripts, dependency locks or existing tests merely to satisfy a task. Add regression tests for new behavior.
