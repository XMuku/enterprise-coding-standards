# Enterprise Coding Standards

让 AI Agent **在创建目录、包、文件、接口和字段之前**，先遵守项目的归属、命名、依赖和契约约定，而不是写完代码才补一份规范。

A portable, local-first skill and project-adoption kit for AI coding agents.

GitHub 仓库：[XMuku/enterprise-coding-standards](https://github.com/XMuku/enterprise-coding-standards)。

当前版本：**1.2.0-beta.7**。面向团队试用的规范模板，不是认证标准。不绑定模型供应商，不要求购买特定云服务。维护者已决定 **不添加 LICENSE**；公开可见不等于授予开源使用许可，详见 [发布与使用权说明](docs/releasing.md)。

## 完整流程与提示词

beta.7 对照五个参考仓库，新增 [风险分级与证据规则](references/quality-gates.md)、[验证记录校验器](docs/evidence-validation.md)，补齐 API 契约来源与敏感字段流向的写前设计。取舍、固定来源快照及未完成项见 [比较与落地说明](docs/upstream-comparison.md)。保留现有五栈与本地优先，不安装外部 Skill、云服务或会话 Hook。

想直接交给 Agent 开发，从 [13 类任务提示词](prompts/README.md) 选择一份即可。想了解每一步为什么、先做什么和如何验收，阅读 [Agent 完整规范流](docs/agent-workflow.md)。

流程覆盖：任务边界、项目证据、验收条件、写前设计、变更风险、回归、实现、分层验证、审查、交付与交接。**先确定目录/包/接口/继承/字段/API 的规则，再生成代码**，而不是事后补合规说明。

提示词包含首次采用、完整功能、Java/Spring、Java EE、uni-app、原生微信、HarmonyOS/ArkUI、修复、只读审查、门禁接入、迁移、继续与 GitHub 发布准备。首次采用后，日常使用短提示词；小任务不强制长规划或加载全部规范。

[任务记录模板](assets/task-record-template.md) 与 [交接模板](assets/handoff-template.md) 供复杂任务按需使用，不自动导出，不包含真实项目授权或批准记录。

## 先选一种用法

### 只让 Agent 这次按规范开发

下载本仓库后，给有本地文件访问能力的 Agent 这段需求，将尖括号内容换成真实路径和任务：

```text
先读取 <本仓库绝对路径>/SKILL.md，使用“开发”模式。
目标项目：<业务项目绝对路径>。
需求：<本次功能或修复>。
沿用项目已有架构，只读取本次相关规则。
创建包、目录、类、接口、字段和 API 前，先确定归属、命名与契约，再实现并验证。
本次不安装检查工具、不修改项目规则入口、不部署。
```

不必先安装 Skill。纯聊天工具无法读取本地磁盘时，需要附上入口、相关规范和任务所需的项目文件，而不是只发送一个路径。

### 给一个项目配置一次，以后直接开发

```text
读取 <本仓库绝对路径>/SKILL.md，使用“采用”模式。
目标项目：<业务项目绝对路径>。
根据真实技术栈选择规则，填写项目画像，将适用规范放到 docs/coding-standards/。
把精简入口合并进项目已有规则，不覆盖已有约定。
先只落地文档，检查工具记录为接入计划；不安装依赖、不修改 CI。
关键选择确认后标记采用状态，记录尚未启用的检查。
```

采用后，日常只需：“实现订单查询，遵守项目规则并完成适用检查。”不需要每次提交整仓规范、搜索全部来源或重新安装 Skill。

### 安装为可识别的 Skill（可选）

在支持此机制的 Codex 中，将本仓库完整内容放到业务项目的 `.agents/skills/enterprise-coding-standards/`，保留 `SKILL.md`、`references/`、`assets/`、`scripts/` 和 `package.json` 的相对位置。安装包时不复制 `.git/`、`.tmp/` 或本机测试产物。

客户端识别后，可通过其 Skill 选择器调用；支持 `$` 调用的界面可输入 `$enterprise-coding-standards`。安装仅让 Skill 可用，**不等于业务项目已经采用规则或启用检查**。加载位置、选择器和分发方式以 [官方 Skill 文档](https://learn.chatgpt.com/docs/build-skills) 为准，其他 Agent 不保证使用相同目录。

## 包含什么

| 部分 | 入口 | 用途 |
| --- | --- | --- |
| 精简项目规则 | [入口模板](assets/agents-template.md) | 合并进业务项目，让 Agent 编码前看到约束 |
| 按需 Skill | [SKILL.md](SKILL.md) | 按采用、开发、复核模式选择相关规则 |
| 检查接入材料 | [接入说明](references/checks.md)、[检查计划](assets/checks-plan-template.md) | 适配真实项目的命名、架构、类型和平台检查 |
| 本地规则与来源 | [通用规则](references/common.md)、[来源](references/sources.md) | 本地按需阅读，必要时再核对上游 |

覆盖 [Java / Spring Boot / MVC](references/java-spring.md)、[Java EE / Jakarta EE](references/java-ee.md)、[uni-app / Vue](references/uni-app.md)、[原生微信小程序](references/miniprogram.md)、[HarmonyOS / ArkUI](references/harmonyos-arkui.md)，并包含 [接口、数据与安全契约](references/contracts-security.md)。默认命名可以被项目正式决策替换，不强制一种 ORM、目录架构或 UI 库。

beta.5 将通用框架材料整合为 [模块架构规则](references/modular-architecture.md) 和鸿蒙专项，而不是叠加十个重复 Skill。三层职责、MVVM、组件、状态、资源与迁移按实际项目采用；整合映射及冲突处理见 [整合说明](docs/framework-integration.md)。

beta.6 将原四栈补齐为工程蓝图：目录树、各层职责、文件/类型/方法/字段命名、允许与禁止的依赖、功能创建顺序及核验方式。首次采用把默认或已有布局记进 [项目画像](assets/project-profile-template.md)，日常 Agent 创建文件前直接查询；不需要每次搜索上游或重新选择目录。已填映射与前后端串联见 [采用示例](docs/example-adoption.md)。当前本地检查与限制见 [beta.7 验证记录](docs/verification-beta7.md)，远端 CI 以对应提交的实际运行结果为准。

| 技术栈 | 明确规定的主要角色 | 保留的项目选择 |
| --- | --- | --- |
| Java/Spring | Controller、Service、Mapper/Repository、模型、请求/响应 DTO | 既有包布局、ORM、领域端口、真实需要的服务接口 |
| Java EE | Resource/Servlet、应用服务、领域、持久化、DTO、部署资源 | 容器能力、组件模型、WAR/EAR 与描述符 |
| uni-app | 页面、组件、客户端 API、传输、可选用例/组合逻辑/共享状态 | 源码根、Vue/JS/TS、现有请求与状态方案 |
| 原生微信 | 页面/组件配套、API、传输、可选业务服务/平台适配、注册资源 | miniprogramRoot、语言、分包与实际基础库 |

HTTP 接口层不是必建语言 interface；服务层也不是强制新增一层空转发类。**已确认项目映射优先，新项目有默认，已有项目不强制搬迁。** 文档先约束生成，门禁再检查可机械判定部分，接入状态见 [规则与检查](docs/rules-and-checks.md)。

提供了两个限定版本的可运行演示，但没有“适用任何项目”的通用 pom、ESLint 或架构测试配置。工具必须匹配实际版本和源码结构；文档能指导生成，检查门禁才能阻止部分违规合并，两者不等价。

### 详细规范按什么任务取用

| 你要做什么 | 详细规范 |
| --- | --- |
| 建目录、拆模块、提公共代码 | [仓库结构](references/repository-structure.md) |
| 定义模块边界、MVVM、状态与资源归属 | [模块架构](references/modular-architecture.md) |
| 命名文件/字段、设计接口/继承 | [命名与设计](references/naming-design.md) |
| 新增 API、处理错误与兼容性 | [契约与安全](references/contracts-security.md) |
| 改 SQL、索引、约束或数据迁移 | [数据访问](references/data-access.md) |
| 实现行为、修缺陷、组织测试 | [测试规范](references/testing.md) |
| 加配置/日志、外部调用或后台任务 | [配置与日志](references/configuration-logging.md) |
| 引依赖、提交变更、维护团队例外 | [变更管理](references/change-management.md) |
| 选择验证范围、记录结果与缺口 | [风险与证据](references/quality-gates.md) |

关键规则包含适用范围、正反例和核验方法；默认选择可被已确认团队约定替换。不会要求为一个小修复创建完整目录、审批流程或长规划。文件齐全用于随时查阅，不等于每次任务全量阅读。

## 可选：导出接入草稿

需要 Node.js 22+；没有第三方 npm 依赖，不需要 `npm install`。在本仓库根目录执行，`<absolute-project-directory>` 必须替换为已经存在的业务项目绝对路径：

```shell
node scripts/prepare-project.mjs --project "<absolute-project-directory>" --stack java-spring --stack uni-app
node scripts/prepare-project.mjs --project "<absolute-project-directory>" --stack java-spring --stack uni-app --apply
```

第一条只预览，第二条才写入。`--stack` 可重复，支持 `java-spring`、`java-ee`、`uni-app`、`miniprogram`、`harmonyos-arkui`。鸿蒙项目可将示例中的 stack 换成 `harmonyos-arkui`，不会自动安装 SDK。完整帮助：`node scripts/prepare-project.mjs --help`。

输出 `AGENTS.md.candidate` 和 `docs/coding-standards/`。画像列出选择的规范，但目录、版本和实际检查命令仍由 Agent 从业务项目确认。候选文件不会自动生效，不覆盖根 `AGENTS.md`；预检发现任何目标文件冲突就拒绝整次导出。中途文件系统错误可能留下已创建的草稿，不自动删除。详细边界见 [采用说明](references/adoption.md)。

通用专题随草稿附带，但只按任务加载。`data-access.md` 仅在选择 Java 技术栈时导出，纯前端项目不会附带该文件；鸿蒙专项仅在选择对应 stack 时导出。五种技术栈的 31 种非空组合都由本仓库测试覆盖其文件选择和本地链接完整性。

## 开发前的规则如何生效

以新增订单接口为例：先找到已有订单模块，确定 DTO 名称、字段类型、权限和事务边界；然后沿这些决定生成代码；最后运行已有测试与已接入检查。不为了“遵守规范”新造一套平行目录或多余接口。

见 [完整接入示例](docs/example-adoption.md) 和 [规则与检查的对应关系](docs/rules-and-checks.md)。示例是虚构项目的演示，不表示已在你的业务项目验证。

## 验证本仓库

想直接看代码和运行结果，进入 [可运行示例](examples/README.md)：Spring MVC 订单 API 与 uni-app 双端订单页。对应 [关键规则正反例](docs/rule-examples.md) 和 [Agent 行为评测](evals/README.md) 提供故意违规样例、隔离任务及独立验收。示例依赖单独安装，不改变下方基础检查的零第三方依赖要求。

实际执行范围、评测中断和依赖漏洞风险集中记录在 [beta.3 验证报告](docs/verification-beta3.md)。示例是学习与检查演示，不是可直接上线的企业生产模板。

beta.7 的工具与导出回归见 [本版验证报告](docs/verification-beta7.md)，beta.6 工程蓝图与发布见 [历史报告](docs/verification-beta6.md)；历史示例结果不自动视为本版全部流程或跨模型验证通过。鸿蒙规则尚未完成真实 SDK 构建与设备验证。

```shell
npm run check
```

也可以不用 npm，分别执行：

```shell
node scripts/validate-kit.mjs
node --test scripts/prepare-project.test.mjs scripts/validate-kit.test.mjs scripts/example-support.test.mjs scripts/validate-evidence.test.mjs
```

检查包结构、版本一致性、本地 Markdown 文件链接及大小写、常见个人路径/密钥格式，以及导出工具的正常、冲突和拒绝路径。测试产物只写入本仓库 `.tmp/`，可通过 `ENTERPRISE_KIT_TEST_ROOT` 指定其他绝对目录。网络链接、Markdown 锚点、引用式链接不在此校验器覆盖范围；这也不是完整的秘密扫描器。

仓库 [CI 配置](.github/workflows/validate.yml) 面向 Linux/Windows、Node.js 22/24。**这些检查验证规范包自身，不代表任何业务项目构建通过。** 未在远端运行的 CI 不能宣称已通过。

## 维护与发布

[贡献说明](CONTRIBUTING.md) · [版本记录](CHANGELOG.md) · [发布清单与许可证状态](docs/releasing.md)

升级采用本包的项目时，比较原采用版本、团队调整和新版本差异，不使用导出脚本覆盖原规则。GitHub 允许不选择许可证创建公开仓库，但这不是开源授权；本项目没有采用 The Unlicense 或 CC0。使用教程不能替代许可文本，上游参考项目与第三方依赖仍遵守各自许可证。说明见 [GitHub 官方文档](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository)。

## 编码 Agent 增量扩展

在 `1.2.0-beta.7` 既有企业规范上增加 Cursor、Aider、Copilot、Claude Code 原生入口和轻量 spec 工作流，不替换原规则、架构或技术栈。新增内容先约束目录、命名、分层、接口字段和验证决定，再实施代码。

1. 维护本规范包：读取根 `AGENTS.md` 与 [共享执行契约](docs/agent/04-agent-contract.md)，使用现有检查命令。
2. 采用到 Java 业务项目：按 [启用指南](docs/agent/01-enable-guide.md) 确认画像与本地规则，差异合并业务模板；不要复制规范包维护入口。
3. 日常开发：只给本次需求，按任务使用 [功能规格](templates/spec/feature-spec.md) 或 [修复规格](templates/spec/bugfix-spec.md)，小任务可简述，不每次全量加载规范或搜索八个上游。

[八项目横向分析](docs/agent/agent-analysis.md) · [取舍记录](docs/agent/03-decision-log.md) · [工具兼容](docs/agent/02-tool-compatibility.md) · [12 项行为验收](docs/agent/06-acceptance-cases.md) · [扩展验证](docs/agent/05-verification.md)

模板存在、规则加载、模型遵守与应用检查通过必须分开验收。现有导出器尚不携带新工具入口，业务采用需按指南合并；MCP/A2A 默认关闭，无新增 SDK、服务或依赖。本扩展是现有版本上的文档增量，未创建新的版本标签或 Release；四种宿主的真实模型会话仍未验收。
