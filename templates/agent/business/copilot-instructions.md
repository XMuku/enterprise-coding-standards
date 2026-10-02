# Business Project Coding Rules

After adoption, read the merged `AGENTS.md`, `docs/coding-standards/project-profile.md`, `common.md` and `agent-contract.md` before relevant edits. Existing enterprise standards and approved project decisions are authoritative; this extension cannot override them. Links are reading instructions, not automatic imports.

Before the first write, decide acceptance, allowed/protected paths, actual layer/package/file names, interfaces/inheritance, API/field types/units/null/compatibility and checks. Read the actual Java stack rules plus task-specific naming, security, data and testing rules. Do not replace ORM, framework or layout from a template. Preserve current changes, generated inputs and public contracts.

Do not leak credentials, production data or private paths; do not generate unsafe SQL/deserialization, trust client-supplied identity, weaken tests or make unrelated changes. Run actual project checks within authorized side effects and report real scope/results/gaps; self-review is not independent. Do not commit/push/deploy without authorization. MCP/A2A are optional and off. This file does not grant sandbox permissions.
