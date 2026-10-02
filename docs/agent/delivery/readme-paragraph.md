# 已采用 README 导航段

本段已在本次完善并推送的任务中追加到 README 末尾，原文保留。本文件用于追溯，不要再次追加。下列链接按仓库根 README 位置编写，不按本文件位置解析。

```markdown
## 编码 Agent 增量扩展

在 `1.2.0-beta.7` 既有企业规范上增加 Cursor、Aider、Copilot、Claude Code 原生入口和轻量 spec 工作流，不替换原规则、架构或技术栈。新增内容先约束目录、命名、分层、接口字段和验证决定，再实施代码。

1. 维护本规范包：读取根 `AGENTS.md` 与 [共享执行契约](docs/agent/04-agent-contract.md)，使用现有检查命令。
2. 采用到 Java 业务项目：按 [启用指南](docs/agent/01-enable-guide.md) 确认画像与本地规则，差异合并业务模板；不要复制规范包维护入口。
3. 日常开发：只给本次需求，按任务使用 [功能规格](templates/spec/feature-spec.md) 或 [修复规格](templates/spec/bugfix-spec.md)，小任务可简述，不每次全量加载规范或搜索八个上游。

[八项目横向分析](docs/agent/agent-analysis.md) · [取舍记录](docs/agent/03-decision-log.md) · [工具兼容](docs/agent/02-tool-compatibility.md) · [12 项行为验收](docs/agent/06-acceptance-cases.md) · [扩展验证](docs/agent/05-verification.md)

模板存在、规则加载、模型遵守与应用检查通过必须分开验收。现有导出器尚不携带新工具入口，业务采用需按指南合并；MCP/A2A 默认关闭，无新增 SDK、服务或依赖。本扩展是现有版本上的文档增量，未创建新的版本标签或 Release；四种宿主的真实模型会话仍未验收。
```
