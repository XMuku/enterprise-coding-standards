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

## 编码 Agent 增量扩展

首次相关写入前读取 [共享执行契约](docs/agent/04-agent-contract.md)，明确任务边界、AC、真实路径/名称/依赖、接口字段与检查范围；局部修改可简述，不强制创建完整 spec。复杂任务按 [功能](templates/spec/feature-spec.md) 或 [修复](templates/spec/bugfix-spec.md) 模板记录。

按需求、spec/简述、设计、实现、验证、意图复核、交付的顺序执行。运行任务相关的既有 lint、单元测试与风险检查；不以本包检查代替业务应用验证。注释解释意图、边界与取舍，提交消息沿用项目规则，不强制新增 Git 流程。

既有企业标准优先，本扩展不得覆盖它们。保留他人改动，不手改生成物，不泄露凭证、生产资料或个人路径，不生成不安全 SQL/反序列化，不降低检查制造通过。按既有风险状态报告实际结果；开发授权不包含提交、推送或部署。MCP/A2A 不作为基础要求。

维护本包继续使用上方已有维护规则；业务采用见 [启用指南](docs/agent/01-enable-guide.md)，不能把维护入口直接复制进 Spring 项目。
