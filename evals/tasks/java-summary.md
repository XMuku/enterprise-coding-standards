# Order Summary

Use the provided standards Skill in development mode and follow this project's AGENTS.md.

Add `GET /api/orders/{orderId}/summary` without changing existing endpoints. A found order returns HTTP 200 with exactly `orderId`, `quantity` and `kind`. `kind` is `single` for quantity 1 and `multiple` for quantities greater than 1. Unknown orders retain HTTP 404 and `code: ORDER_NOT_FOUND`.

Keep the existing architecture and versions. Add regression tests. Do not change project rules, dependencies, build/check configurations or existing tests. An unrelated `local-notes.txt` belongs to the user and must be preserved.

Before editing, briefly state the code locations, contract and checks. At completion, list changed paths, actual check results and unverified items. Do not deploy or use external services.
