# StaffForge 框架分析卡片

研读日期：2026-10-03。快照：`df0ebc6dc5c14bd1068a7a37ecc902e0fe511bba`。分类：多角色编排、规则合成与工具适配。源仓库 GPL-3.0；本次只比较设计，不复制适配器、角色提示词或运行库。

## 定位与核心文件

维护角色定义并输出工具原生文件，将规则发现、合成与适配分开。不是一份规则文件即可实现所有平台同样的权限和调度。

| 核心文件 | 实际关注点 |
| --- | --- |
| [configuration-scopes.md](https://github.com/StaffForge/StaffForge-AI-Agent-Framework/blob/df0ebc6dc5c14bd1068a7a37ecc902e0fe511bba/docs/configuration-scopes.md) | 项目/全局作用域、合成顺序与平台条件差异；规则不授予权限 |
| [PROJECT_RULES.md](https://github.com/StaffForge/StaffForge-AI-Agent-Framework/blob/df0ebc6dc5c14bd1068a7a37ecc902e0fe511bba/PROJECT_RULES.md) | 固定 Git Flow、专门 VCS 角色及覆盖关系，与本包存在冲突 |
| [Cursor 适配器](https://github.com/StaffForge/StaffForge-AI-Agent-Framework/blob/df0ebc6dc5c14bd1068a7a37ecc902e0fe511bba/adapters/cursor/index.mjs) | 从通用正文输出 mdc；不能把非原生元数据当权限隔离 |
| [Aider 适配器](https://github.com/StaffForge/StaffForge-AI-Agent-Framework/blob/df0ebc6dc5c14bd1068a7a37ecc902e0fe511bba/adapters/aider/index.mjs) | 聚合正文输出 `.aider.rules.md`，文件生成不证明加载 |
| [Copilot 适配器](https://github.com/StaffForge/StaffForge-AI-Agent-Framework/blob/df0ebc6dc5c14bd1068a7a37ecc902e0fe511bba/adapters/copilot/index.mjs) | 项目中立上下文与特定角色定义分开 |
| [java.md](https://github.com/StaffForge/StaffForge-AI-Agent-Framework/blob/df0ebc6dc5c14bd1068a7a37ecc902e0fe511bba/agents/java.md) | Java 专长与工具权限分开，版本要求须独立核对 |
| [ARCHITECTURE.md](https://github.com/StaffForge/StaffForge-AI-Agent-Framework/blob/df0ebc6dc5c14bd1068a7a37ecc902e0fe511bba/ARCHITECTURE.md) | 注册表、合成、适配及运行职责，不等于所有导出有端到端证明 |

## 工作流与亮点

发现规范与角色，按作用域合成，再针对平台输出文件；任务由编排者按能力与依赖分派，验证和版本控制分别处理。可借鉴“统一权威规范、薄平台入口、原生限制单独解释”，避免维护四套不同的企业标准。

## 局限与适配

角色全集、路由、模型选择、遥测和 VCS 事务过重；固定英语、默认 Git Flow/分支、项目 addendum 覆盖基础规则等不能原样用于本包。源码中的输出路径只是该框架设计，不是对应工具官方自动加载证据。Java 技术建议不能绕过真实 JDK/框架版本。

| 判断 | 取舍与原因 |
| --- | --- |
| 保留 | 规则与权限分离、项目上下文不冒充编排角色、按工具提供薄入口 |
| 调整 | 平台文件逐项按官方文档核对；本包既有企业规范优先，新入口只路由和补流程 |
| 不引入 | GPL 实现、完整角色库、自动 VCS 委托、遥测、固定语言/架构/模型预算、框架特有 override 顺序 |
| 适用 | 企业 Java 标准在多工具之间共享，而非重复生成整套标准 |
| 不适用 | 把导出文件名当作自动激活证明；把 frontmatter 当作沙箱权限 |

本包会独立编写最小配置，运行机制以工具官方文档和本地验证为准，不沿用此框架的兼容宣传作为事实。
