# 编码 Agent 增量扩展设计

日期：2026-10-03。前置产物：[横向分析](agent-analysis.md) 与 8 张分析卡片已完成。本页先确定方案，再编写入口、模板和交付材料。除已批准的根入口追加及本次发布导航追加外，只新增文档/纯文本配置，不新增代码、脚本、依赖或服务。

## 权威与边界

本包既有 references、采用流程、风险状态和项目决策机制保持不变。新增内容只解释 Agent 如何在首次写入前找到、应用并验证这些规则，不能创建新的“宪法”覆盖它们。`约束/默认/建议` 沿用 [规则维护](../../references/change-management.md)。运行环境与用户授权不由本包改写。

基础流程采用需求、轻量 spec、写前设计、最小实现、分层验证、意图复核和交付；小改用行内记录，不要求文档数量。新增 spec 使用原有 AC 编号和检查状态，不创建平行证据体系。多 Agent 是按需协作方式，不是采用前提。

## 根入口的已批准追加

现有根 [AGENTS.md](../../AGENTS.md) 管理的是规范包维护，不是 Java 业务项目。目标同时要求扩展根入口和禁止修改已有规范，因此最初只提供候选追加段。维护者于 2026-10-03 明确授权“仅追加”，现已在根文件末尾追加共享契约入口与必要底线，全部原文保留，不替换或改写原维护规则。

Cursor、Aider、Copilot、Claude Code 的新增原生入口直接指向根 AGENTS 与共享契约。只读取根 AGENTS 的消费者也能看到首次写入前读取契约的要求，但 Markdown 链接不是所有工具的自动导入。`AGENTS.md.candidate` 仅保留为已批准追加段记录，不再次加载或合并。原文保留与宿主实际加载分别验证，见 [验证记录](05-verification.md)。

## 目录规划

| 扩展位置 | 职责 | 启用范围 |
| --- | --- | --- |
| `AGENTS.md` | 原维护入口末尾的已批准追加段 | 原维护规则不变，指向共享契约 |
| `README.md` | 发布时末尾追加的新模块导航 | 全部原文保留，不改变版本声明 |
| `AGENTS.md.candidate` | 已批准追加段的追溯记录 | 不自动加载，不重复追加 |
| `.cursor/rules/enterprise-coding-rules.mdc` | Cursor 原生常驻薄入口 | 规范包维护；Java 示例任务按相关规则 |
| `.aider.rules`、`.aider.conf.yml` | 普通规则文件与显式 read 配置 | 从规范包根启动 Aider |
| `.github/copilot-instructions.md` | Copilot 仓库指令 | 支持该机制的宿主/功能 |
| `CLAUDE.md` | Claude 原生导入入口 | 项目指令未被禁用的会话 |
| `docs/agent/04-agent-contract.md` | 共享写前流程和安全边界 | 维护本包；业务复制后使用业务路径 |
| `templates/agent/business/` | 业务项目候选入口与宿主模板 | 填写画像、合并已有入口后生效 |
| `templates/spec/feature-spec.md`、`bugfix-spec.md` | 功能/修复规格 | 按任务规模选用 |
| `templates/spec/agent-handoff.md` | 多 Agent 交接 | 真正使用多个参与者时 |
| `docs/agent/examples/` | 已填写的 Java 文档走查 | 说明模板用法，不产生业务代码 |
| `docs/agent/01-enable-guide.md` | 采用和各宿主启用步骤 | 人工/Agent 首次采用 |
| `docs/agent/02-tool-compatibility.md` | 官方加载约定与验证边界 | 维护入口时复核 |
| `docs/agent/03-decision-log.md` | 保留、调整、拒绝记录 | 可追踪维护 |
| `docs/agent/agent-analysis.md` | 主横向报告 | 按需参考 |
| `docs/agent-analysis.md` | 报告链接入口 | 不重复正文 |
| `docs/agent/research/` | 八张固定快照卡片 | 不常驻上下文 |
| `docs/agent/extensions/` | MCP/A2A 高级参考 | 默认关闭，不带 SDK/配置 |
| `docs/agent/delivery/` | 变更清单、可复用 PR 正文、已采用 README 段记录 | 发布材料本身不授权远端动作；本次依明确推送请求执行 |
| `docs/agent/05-verification.md` | 本次实测与缺口 | 不把静态检查冒充行为验收 |
| `docs/agent/06-acceptance-cases.md` | 12 项行为用例与隔离组装复核 | 适用宿主逐项验收，不自动启动模型 |

除根 AGENTS 与 README 的末尾追加外，其余 121 个既有文件、规范正文、脚本、示例业务代码、版本和五类专项均不修改；两个追加文件的原文也全部保留。现有导出脚本不自动携带新增目录；业务采用明确手工复制新增契约、模板和所选工具入口，不伪装成导出器升级。README 导航是在维护者要求完善并推送后采用，不创建 Release 或标签。

## 两种采用对象

维护规范包：保留 Node.js 22+ 和现有 `npm run check`；不把整个包改造为 Spring 应用。变更示例或评测时仍按原有 AGENTS 追加相关检查。

业务 Java 项目：先按 [项目采用](../../references/adoption.md) 准备并确认 `docs/coding-standards/`，再从业务模板合并入口。源码目录、JDK、Spring/容器、ORM、测试命令和扫描范围来自项目画像；没有实证不填版本或假命令。Java EE 与 Spring 分别采用，不混用注入/事务模型。前端仅按真实任务保留选用，不强制导入。

## 加载与执行策略

共享契约只保留写前必要约束与按需路由，详细命名、数据、安全、测试仍链接到既有规则。薄入口只重复关键保护和读取要求，防止宿主未追踪链接时丢失底线；不常驻八张卡片、完整流程手册或上游源码。

Cursor 用原生 .mdc；Aider 用 read 清单并关闭自动提交/自动检查，显式运行项目验证；Copilot 用原生仓库指令且要求按任务读取相关规则；Claude 用 CLAUDE.md 导入。规则注入、模型遵守、执行门禁分别验收，任何入口都不是沙箱。

## 验收计划

| ID | 检查 | 完成证据 |
| --- | --- | --- |
| EXT-01 | 增量与隐私 | 其余 121 个原文件无差异，根入口与 README 原文逐字节保留且只有末尾追加，新文件类型与隐私扫描 |
| EXT-02 | 规范包回归 | 原有 npm run check，实际退出码/测试数量 |
| EXT-03 | 原生语法与路径 | 官方约定、YAML 类型、导入/read 路径、候选复制映射 |
| EXT-04 | 模板走查 | 新功能与 bugfix 的已填写 Java 案例，AC/测试/风险映射 |
| EXT-05 | 规则冲突与边界 | self 审查，优先级、Java/EE、保护、安全、检查状态核对 |
| EXT-06 | 实际工具与行为 | 各宿主加载记录和首次写入前输出；本次未执行则 not-run |
| EXT-07 | 交付完整性 | 清单和实际新增文件一致，可复制 PR 文本及未完成项 |
| EXT-08 | 业务草稿隔离组装 | Spring/Java EE 导出、实际引用/复制完整性、拒绝覆盖及缺失/大小写负例；不当作已采用或宿主行为 |

不安装四种工具或调用付费模型来假装完成加载验收；如当前环境不能执行，提供可重现的人工验收步骤并如实记录。高级协议只验收文档隔离与安全边界，不运行网络服务。
