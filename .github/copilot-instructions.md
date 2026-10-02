# Enterprise Coding Standards

This repository maintains the standards kit, not a Java application. Follow the root `AGENTS.md` and existing enterprise standards; this extension does not override them. Before the first relevant write, read `docs/agent/04-agent-contract.md` and only the task-specific rules it identifies. Do not assume Markdown links import their contents.

Confirm scope, acceptance, actual file/package paths, names, dependencies, API/field semantics and checks before editing. Preserve existing changes and generated inputs. Do not leak secrets, production data or private absolute paths; do not generate unsafe SQL/deserialization, weaken tests or change unrelated files. Use actual project commands and report failures, blockers and unrun checks. Self-review is not independent review.

For kit changes use the verified scripts in `package.json` and the root maintenance rules. For Java example changes read `references/java-spring.md` or `references/java-ee.md` as applicable, plus the existing rules relevant to the task. Do not replace ORM, framework, layout or container semantics because of a template. MCP/A2A are optional and disabled. Development instructions do not authorize commit, push, deployment or publication.
