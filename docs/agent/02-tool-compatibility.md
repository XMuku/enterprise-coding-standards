# 工具兼容与加载边界

核对日期：2026-10-03。兼容依据是官方文档和所读 Aider 固定源码，不是四个工具的本次现场运行。已查证入口与未运行行为分开，结果见 [本次验证](05-verification.md)。官方约定可能变化，升级时复核。

| 工具 | 原生入口/机制 | 本扩展 | 实际启用条件 | 当前证据 |
| --- | --- | --- | --- | --- |
| Cursor Agent | `.cursor/rules/*.mdc`；元数据控制应用范围 | description、空 globs、布尔 alwaysApply:true；@ 引用 | 项目打开、规则未禁用、适用功能 | 文档+静态格式；现场 not-run |
| Aider | `.aider.conf.yml` 的 read、CLI --read 或 /read | 明确列出普通 .aider.rules 和共享契约 | 项目根启动、配置/参数未被覆盖、只读文件存在 | 官方文档+固定源码；现场 not-run |
| Copilot | `.github/copilot-instructions.md`；功能支持另核对 | 短 Markdown 指令、按需读取路径 | 支持的宿主/功能且指令启用 | 官方文档+路径；现场 not-run |
| Claude Code | CLAUDE.md 与 @path 导入 | 导入 AGENTS 和共享契约 | 项目指令允许、导入可解析、无排除策略 | 官方文档+路径；现场 not-run |

官方依据：[Cursor Rules](https://cursor.com/docs/context/rules)、[Copilot 仓库指令](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions)、[Claude Code 项目记忆](https://code.claude.com/docs/en/memory)、[Aider conventions](https://aider.chat/docs/usage/conventions.html)、[Aider YAML 配置](https://aider.chat/docs/config/aider_conf.html)。Aider 源码细节见 [固定卡片](research/08-aider.md)。

## AGENTS.md 不是统一解析标准

Cursor 支持 AGENTS 和原生项目规则，但规则主要作用于 Agent，并不保证 Tab 等功能应用。Copilot 各功能对 Agent 指令、仓库指令和路径指令的支持不同；本扩展不依赖一个 AGENTS 文件覆盖所有功能。

Claude Code 官方文档说明：直接读取 AGENTS 需要 `v2.1.277+` 且受已有 CLAUDE/本地入口、项目指令设置及内置插件状态影响。`v2.1.281` 之前部分会话（包括某些 Bedrock 或关闭遥测的会话）仍只读取 CLAUDE；升级后的首个会话也可能存在过渡限制。本扩展因此保留 `CLAUDE.md` 导入兼容方案，而非只按一个最低版本判断生效。设置禁用项目指令时导入也不构成绕过。只描述当前官方条件，不把文档版本当用户已安装版本。

CLAUDE 原生导入便于复用，但被导入正文仍占启动上下文，不会因为拆成多文件而省掉 token。这里只导入维护入口和必要契约，专题规范按任务读取，不导入完整研究卡片或全部规则库。版本限制与上下文行为依据同一官方项目记忆文档，升级时复核。

Aider 不因 AGENTS.md 或 .aider.rules 的名字自动加载它们；read 列表是必要机制。配置与 CLI/环境可能覆盖默认，启动目录影响相对 read 路径。保持只读，不把规则加入可编辑文件集合。

## 语法与引用

.mdc 采用 YAML frontmatter 与 Markdown 正文，`alwaysApply` 必须是布尔值。规则不能靠不存在的 `mode` 字段获得只读权限。Claude @ 导入位于非代码正文，使用仓库内相对路径；Copilot 和 Aider 中普通 Markdown 链接不是递归导入。

根入口指向规范包；`templates/agent/business/` 入口指向采用后的业务路径，两者不得混用。模板存放位置本身不启用业务规则。合并现有入口、确认画像和目标路径后再验收；不存在的文件不是已加载内容。

## 运行验收与局限

Cursor 检查当前规则状态；Aider 用 `/ls` 确认只读集合并核对有效选项；Copilot 在支持的 Chat 响应检查指令引用；Claude 用 `/context` 检查记忆加载。方法也可能随版本变化，先查所用宿主。

再执行 [启用指南](01-enable-guide.md) 的只读走查与代表性开发任务，保存首次写入前输出、差异和真实检查。模型声称“已读”不足以证明运行时加载；加载记录不足以证明行为遵守。文本是软约束，真实授权、CI、文件保护和可信证据不由本扩展实现。

可用 [行为验收用例](06-acceptance-cases.md) 分别记录加载、写前行为与应用检查；各宿主/功能逐一验收，不把一个会话的成功泛化到其他工具或版本。
