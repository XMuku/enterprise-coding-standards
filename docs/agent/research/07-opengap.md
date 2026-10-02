# open-gitagent/opengap 分析卡片

研读日期：2026-10-03。快照：`d7a8e2edb54b942d6b4635cdd8b919ebd23e5da5`。分类：Git 原生 Agent 定义格式与适配 CLI，不是 A2A 通信协议。源仓库 MIT；规范标注 `0.1.0`，CLI 包标注 `0.5.0`，二者不可混用。未安装或执行上游程序。

## 定位与核心文件

把身份、规则、能力、知识、工作流和职责写成可版本管理的 Agent 定义，再导出给不同宿主。适用于需要管理可移植 Agent 定义的团队，不等于仅复制文件即可得到完整、隔离的运行环境。

| 核心文件 | 实际关注点 |
| --- | --- |
| [SPECIFICATION.md](https://github.com/open-gitagent/opengap/blob/d7a8e2edb54b942d6b4635cdd8b919ebd23e5da5/spec/SPECIFICATION.md) | agent.yaml、SOUL.md、RULES.md、DUTIES.md；继承、配置覆盖和校验约定 |
| [agent-yaml.schema.json](https://github.com/open-gitagent/opengap/blob/d7a8e2edb54b942d6b4635cdd8b919ebd23e5da5/spec/schemas/agent-yaml.schema.json) | 清单必填字段、版本和命名约束 |
| [cursor.ts](https://github.com/open-gitagent/opengap/blob/d7a8e2edb54b942d6b4635cdd8b919ebd23e5da5/src/adapters/cursor.ts) | 全局 .mdc 与按需规则导出；另有可选 MCP 配置 |
| [copilot.ts](https://github.com/open-gitagent/opengap/blob/d7a8e2edb54b942d6b4635cdd8b919ebd23e5da5/src/adapters/copilot.ts) | 导出自定义 Agent 和技能，不是通用仓库指令文件的等价替代 |
| [claude-code.ts](https://github.com/open-gitagent/opengap/blob/d7a8e2edb54b942d6b4635cdd8b919ebd23e5da5/src/adapters/claude-code.ts) | CLAUDE.md 导出和父内容合并；部分继承路径会复制文件 |
| [validate.ts](https://github.com/open-gitagent/opengap/blob/d7a8e2edb54b942d6b4635cdd8b919ebd23e5da5/src/commands/validate.ts) | 清单和引用存在性检查；不能据此证明实际职责隔离或合规 |
| [validate-tool-output.sh](https://github.com/open-gitagent/opengap/blob/d7a8e2edb54b942d6b4635cdd8b919ebd23e5da5/examples/full/hooks/scripts/validate-tool-output.sh) | 该示例读入输入后固定返回允许，没有实现实质内容校验 |

## 工作流与亮点

定义清单、身份和规则，增加必要能力与知识，校验结构，按目标工具导出，再由宿主执行。版本管理、少量常驻规则、按需知识和职责交接可降低漂移。独立编写者、审查者的责任边界值得借鉴，但同一 Agent 自述切换角色不是独立审查。

## 局限与适配

继承的深合并与规则并集不自动解决语义冲突。声明权限不提供文件或凭证隔离；示例钩子和静态校验不证明真实门禁。金融监管名称、记录留存期限、全量输入输出日志及模型偏好均不能直接推广为所有企业 Java 项目的强制规则。运行时、外部依赖、持久记忆和自动委托会扩大维护与数据边界。

| 判断 | 取舍与原因 |
| --- | --- |
| 保留 | 原始规则单一权威、版本与来源记录、按需加载、交接范围和证据 |
| 调整 | 角色权限写成任务约束；真实隔离和独立审查需另有证据；现有企业规则优先于派生内容 |
| 不引入 | agent.yaml/SOUL.md 强制结构、CLI、适配器实现、自动钩子、持久记忆、模型绑定和监管默认值 |
| 适用 | 多工具团队希望共享同一套规则但保持各工具原生入口 |
| 不适用 | 把 Git 版本化或静态 schema 校验当作安全执行、企业合规认证或 Java 检查替代 |

本次采用原创文档化约束，不复制适配器代码，不引入其运行时。
