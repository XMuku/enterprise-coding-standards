# Search Local Orders

Use the provided standards Skill in development mode and follow this project's AGENTS.md.

Add product-name search to the order-list page. Trim the query and match a case-insensitive substring of `productName`, not `orderId`. An empty/whitespace query shows all orders. Preserve original order and never mutate input arrays or order objects. Show a clear no-matches state separately from loading/error states.

Expose the pure domain API `filterOrders(orders: readonly Order[], query: string): Order[]` from `src/domain/order-search.ts` so another local caller can reuse it, and use it in the page. Keep H5 and mp-weixin support. Add regression tests; do not change dependencies, existing tests, project rules or build/check configurations. Preserve the user's unrelated `local-notes.txt`.

Before editing, briefly state code locations, contract and checks. At completion, list changed paths, actual check results and unverified items. Do not deploy or use external services.
