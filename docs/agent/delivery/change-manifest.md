# 编码 Agent 扩展变更清单

基线：`1.2.0-beta.7`，提交 `5136da7bc9b4773ab8386e86dcd63a7c22021300`。维护者已明确要求完善后推送到现有 GitHub 仓库。本次发布文档与配置增量，不改版本、不创建标签/Release 或远端 PR；只允许正常快进，不强推。根 AGENTS 与 README 原文保留检查见 [验证记录](../05-verification.md)。

## 新增文件

| 路径 | 作用 |
| --- | --- |
| `AGENTS.md.candidate` | 已批准并追加到根入口的追溯记录，不自动加载 |
| `.cursor/rules/enterprise-coding-rules.mdc` | Cursor 原生规则 |
| `.aider.rules` | 普通只读规则文件 |
| `.aider.conf.yml` | Aider 原生 read 和保守执行选项 |
| `.github/copilot-instructions.md` | Copilot 原生仓库指令 |
| `CLAUDE.md` | Claude 原生导入 |
| `docs/agent-analysis.md` | 横向报告链接入口 |
| `docs/agent/00-extension-design.md` | 第三阶段目录与取舍设计 |
| `docs/agent/01-enable-guide.md` | 规范包/业务项目启用 |
| `docs/agent/02-tool-compatibility.md` | 官方语法与加载边界 |
| `docs/agent/03-decision-log.md` | 27 项保留/调整/拒绝与发布决策 |
| `docs/agent/04-agent-contract.md` | 共享写前执行契约 |
| `docs/agent/05-verification.md` | 第六阶段实际结果和缺口 |
| `docs/agent/06-acceptance-cases.md` | 12 项宿主行为验收、证据记录与离线组装复核 |
| `docs/agent/agent-analysis.md` | 主横向报告 |
| `docs/agent/research/01-spec-kit.md` | spec-kit 固定快照卡片 |
| `docs/agent/research/02-best-practice.md` | best-practice 固定快照卡片 |
| `docs/agent/research/03-agentos-kit.md` | agentos-kit 固定快照卡片 |
| `docs/agent/research/04-staffforge.md` | StaffForge 固定快照卡片 |
| `docs/agent/research/05-a2a.md` | A2A 固定快照卡片 |
| `docs/agent/research/06-mcp.md` | MCP 固定快照卡片 |
| `docs/agent/research/07-opengap.md` | OpenGAP 固定快照卡片 |
| `docs/agent/research/08-aider.md` | Aider 固定快照卡片 |
| `docs/agent/examples/java-feature.md` | 功能 spec 已填写走查 |
| `docs/agent/examples/java-bugfix.md` | 修复 spec 虚构回归走查 |
| `docs/agent/extensions/mcp.md` | 默认关闭的工具协议参考 |
| `docs/agent/extensions/a2a.md` | 默认关闭的 Agent 通信参考 |
| `templates/agent/business/AGENTS.md.candidate` | 业务根入口候选 |
| `templates/agent/business/enterprise-coding-rules.mdc` | 业务 Cursor 模板 |
| `templates/agent/business/.aider.rules` | 业务 Aider 规则模板 |
| `templates/agent/business/.aider.conf.yml` | 业务 Aider 配置模板 |
| `templates/agent/business/copilot-instructions.md` | 业务 Copilot 模板 |
| `templates/agent/business/CLAUDE.md.template` | 业务 Claude 模板 |
| `templates/spec/feature-spec.md` | 功能规格 |
| `templates/spec/bugfix-spec.md` | 修复规格 |
| `templates/spec/agent-handoff.md` | 可选多 Agent 交接 |
| `docs/agent/delivery/change-manifest.md` | 本清单 |
| `docs/agent/delivery/pr-description.md` | 可复制 PR 正文 |
| `docs/agent/delivery/readme-paragraph.md` | 已追加的 README 导航段记录 |

共 39 个新增文本/配置文件；最终数量以验证时的实际文件集合核对。没有业务代码、新脚本、依赖、运行时或协议服务。

## 既有文件的批准追加

| 路径 | 批准的修改范围 |
| --- | --- |
| `AGENTS.md` | 仅在末尾追加“编码 Agent 增量扩展”；全部原文逐字节保留 |
| `README.md` | 仅在末尾追加新模块导航和验证边界；全部原文逐字节保留 |

除这两个追加外，其余 121 个既有文件保持不变，包括规范正文、源码、配置、SKILL、CHANGELOG、package 和 CI。不移动、不删除、不覆盖已有内容。原版本不变，因此本次属于该基线上的文档增量，不冒充新发行版。

维护者于 2026-10-03 明确授权“仅追加”，根入口选择已解决，并在后续明确要求完善后推送。README 导航段已采用；未来版本同步/导出器接入不在本次实现范围。四种工具的实际模型会话仍 not-run，不把静态检查替代行为验收。

## 提交与 PR 建议

团队有正式提交规则时优先采用。无额外规则时建议：

```text
docs(agent): add enterprise pre-code adapters and spec templates
```

本次选择单个可审阅提交，将文档与模板作为同一增量交付；不强制采用者照搬提交数量或分支策略。逐项暂存清单中的 39 个新增文件与两个追加文件，不盲目加入全部工作区。发布到既有仓库 main，不改变可见性或许可证。复制 [PR 正文](pr-description.md) 前核对实际状态，不能把 not-run 改成 pass。

远端结果以 [提交记录](https://github.com/XMuku/enterprise-coding-standards/commits/main/) 和 [Actions](https://github.com/XMuku/enterprise-coding-standards/actions) 的对应提交为准；本文件描述范围与流程，不预写远端成功或 CI 通过。

## 部署与采用摘要

先审阅 [决策](../03-decision-log.md) 与 [加载边界](../02-tool-compatibility.md)，再按 [启用指南](../01-enable-guide.md) 选择维护规范包或业务项目。业务采用先用原有流程确认画像和本地规则，再手工复制新增共享契约、所选 spec 与业务工具模板，差异合并现有入口。不安装八个上游项目，不一次全量灌入模型，不以文档复制宣称检查门禁已安装。
