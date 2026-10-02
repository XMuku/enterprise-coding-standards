# chithudas/agentos-kit 分析卡片

研读日期：2026-10-03。快照：`75a9fbcd6fd9d6d095d5ca9c8ce199a62d5e3b94`。分类：多角色交付契约与编排设计。源仓库 MIT；未运行安装器、状态服务器或上游案例。

## 定位与核心文件

给编排者提供角色、任务图、输入输出合同与审查流程；框架文档不是已经运行的调度器。仓库还带可执行安装器和状态服务，不能概括成完全无运行代码。

| 核心文件 | 实际关注点 |
| --- | --- |
| [AGENT_CONTRACT.md](https://github.com/chithudas/agentos-kit/blob/75a9fbcd6fd9d6d095d5ca9c8ce199a62d5e3b94/AGENT_CONTRACT.md) | 单任务范围、阻断、真实结果、只读审查与禁止破坏操作 |
| [agents/backend.md](https://github.com/chithudas/agentos-kit/blob/75a9fbcd6fd9d6d095d5ca9c8ce199a62d5e3b94/agents/backend.md) | API 合同、文件范围与数据库前置交接 |
| [REVIEW_PIPELINE.md](https://github.com/chithudas/agentos-kit/blob/75a9fbcd6fd9d6d095d5ca9c8ce199a62d5e3b94/REVIEW_PIPELINE.md) | 范围、测试、按标记审查和放行角色区分 |
| [workflows/bugfix.md](https://github.com/chithudas/agentos-kit/blob/75a9fbcd6fd9d6d095d5ca9c8ce199a62d5e3b94/workflows/bugfix.md) | 复现后最小修复与原症状回归，不搭车重构 |
| [bin/cli.js](https://github.com/chithudas/agentos-kit/blob/75a9fbcd6fd9d6d095d5ca9c8ce199a62d5e3b94/bin/cli.js) | 安装目录与项目根状态文件的实际写入；存在目标时的保护 |

## 工作流与亮点

从项目目标生成有依赖的任务；实现角色输出文件与测试结果；审查角色只提供有触发条件的发现；编排者检查范围和验收。后继任务需要前序合同/数据结果时顺序执行，独立只读审查才适合并行。

适合本包：任务明确输入、允许路径、依赖、验收和缺口；自检不冒充独立审查；阻断有具体恢复条件；发现无关问题另列，不顺手修复。

## 局限与适配

“全角色评审”和统一 JSON 输出对普通 Java 小改动成本偏高。没有可信执行器时，测试布尔值仍是声明而非证据。自然语言 file_scope 不会成为文件系统隔离。多角色文档没有证明 Cursor/Aider 等能自动发现它们。

| 判断 | 取舍与原因 |
| --- | --- |
| 保留 | 有依赖的任务拆分、责任交接、真实结果和按风险审查 |
| 调整 | 用 Markdown 表格复用既有检查 ID/快照，不另建 JSON 状态系统；只需当前任务相关角色 |
| 不引入 | 35 角色全集、Dashboard/状态服务器、模型提供商配置、MCP 权限框架、统一强制 JSON 输出 |
| 适用 | Java 后端 API/数据库协作、限定范围的实现与独立审查 |
| 不适用 | 用文档模拟已完成编排，或让同一 Agent 生成并批准自己的审查结果 |

只采纳设计思想，不复制系统提示词，也不把上游案例成绩列成本包验证成绩。
