# Order Example Rules

- Preserve `com.example.order` and its `web -> application -> persistence/model` boundary. Web code cannot access persistence directly; inner layers cannot depend on web code.
- Keep Java names consistent with existing files. Do not introduce a second architecture, ORM, service-interface pair, or shared base class for a small task.
- API JSON uses camelCase, validation failures return HTTP 400 with `code: VALIDATION_ERROR`, and missing orders return HTTP 404 with `code: ORDER_NOT_FOUND`.
- This is a local in-memory demonstration, not a production persistence/authentication service. Keep the server bound to loopback.
- Before editing, state the affected locations, contract decision and intended checks briefly. Do not produce a long design document.
- Run `mvn verify` from this directory using available Maven. Do not weaken Checkstyle, architecture rules, tests or project configuration to pass a task.
- Only read relevant standards from a provided Skill. Preserve unrelated files; report checks not run honestly.
