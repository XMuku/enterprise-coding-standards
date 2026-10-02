# 编码 Agent 启用指南

本扩展在 `1.2.0-beta.7` 既有规范上新增文本入口、规格和采用材料。不是新运行框架、检查器安装包或自动部署器。基础模块无新增依赖；四种工具由使用者自行选择已有环境，本指南不要求全装。文本生效、模型遵守和检查通过是三件事。

## 先选择使用对象

| 对象 | 正确入口 | 不能直接做的事 |
| --- | --- | --- |
| 维护本规范仓库 | 根 AGENTS.md、原生工具入口、共享执行契约 | 改造成 Spring 工程，复制业务包树 |
| Java 业务项目 | 已合并项目入口、确认画像、本地规范、业务工具模板 | 把本包维护命令当业务命令，覆盖现有规则 |
| 只读分析/提示词采用 | 明确提供相关规则和任务边界 | 默认改代码、接 CI、安装依赖或发布 |

根 AGENTS.md 已按维护者“仅追加”的授权加入扩展入口，全部原维护内容保留。四种新增原生入口直接读取根规则和 [共享契约](04-agent-contract.md)；其他消费者按根入口要求在首次写入前读取契约。`AGENTS.md.candidate` 只是已批准追加段的追溯记录，不自动加载，也不需要再次合并。文本链接不代表递归导入，实际加载仍按下文验收，证据见 [验证](05-verification.md)。

## 在规范包中启用

从仓库根启动工具。先确认当前差异、授权范围和根维护规则，不每次加载调研卡片、全部 references 或完整手册。修改规范包用现有 `npm run check`，示例/评测变化按根维护规则补检查；本次扩展没有修改既有脚本或检查配置。

Cursor：使用 [.mdc](../../.cursor/rules/enterprise-coding-rules.mdc)，`alwaysApply: true`；在规则界面确认被启用及当前会话应用情况。它引用根 AGENTS 与共享契约，不保证所有 AI 功能采用规则。

Aider：根 [.aider.conf.yml](../../.aider.conf.yml) 的 `read` 显式加载三个只读文件。工作目录必须是仓库根，因为 read 的相对路径从启动目录解析。推荐显式配置，仍核对环境变量/命令行覆盖和最终加载列表：

```sh
aider --config .aider.conf.yml
```

会话中用 `/ls` 检查只读列表，任务需要的 references 再用 `/read references/naming-design.md` 等加入。不要 `/add` 规范作为可编辑源码。关闭自动 lint/test 只是避免隐式副作用，验证责任没有取消；显式运行已查证命令。自动提交关闭，`git-commit-verify: true` 不代表用户已授权提交。

Copilot：使用 [.github/copilot-instructions.md](../../.github/copilot-instructions.md)。在支持该机制的宿主启用项目指令并检查响应引用；指令要求先读共享契约，Markdown 链接不是自动 import。不同 Chat/CLI/cloud/review/补全功能支持不同，不据此承诺全覆盖。

Claude Code：根 [CLAUDE.md](../../CLAUDE.md) 用原生 `@` 导入根 AGENTS 和共享契约。启动后核对 `/context` 中的项目记忆；项目指令被策略禁用时不会生效。新版 AGENTS 直接加载条件与旧版区别见 [兼容说明](02-tool-compatibility.md)；保留 CLAUDE 入口，不依赖条件性的自动回退。

## 在业务项目采用

1. 明确目标项目与“文档采用”授权，先读其已有规则、构建和同类实现，确认 [采用流程](../../references/adoption.md)。保留既有差异和入口，不建 override 绕过规则。
2. 按已有导出工具的预览/拒绝覆盖流程准备本地规范，或按 [原有模板](../../assets/agents-template.md) 手工采用；选择实际 java-spring 或 java-ee，不同时机械采用两套组件模型。首次采用原工具仍只准备草稿，不完成采用。
3. 填写 `docs/coding-standards/project-profile.md` 的真实 JDK/框架或容器、ORM、源码根、角色路径、命名、允许依赖、扫描/注册和测试命令；填写检查计划、来源和例外。关键未知标待确认。
4. 将本扩展 [共享契约](04-agent-contract.md) 作为新增 `docs/coding-standards/agent-contract.md` 保存；已有文件存在时比较合并，不覆盖。契约没有本机路径和专属维护命令，可供业务采用。
5. 把 [业务 AGENTS 候选](../../templates/agent/business/AGENTS.md.candidate) 与项目入口差异合并，删除候选说明。不要把规范包根 AGENTS 或候选追加段复制进去。
6. 根据所用工具逐项合并下表入口，不复制整个规范包隐藏配置。确认目标文件存在、没有模板占位或重复冲突后采用；每项检查接入状态仍独立记录。
7. 可把所需 spec 模板作为 `docs/agent-specs/templates/` 下团队模板保存，填写后的任务记录按团队规则放置；不要求采用 OpenGAP 清单、SOUL、运行时或 spec-kit CLI。
8. 先做下方只读写前走查，再在实际授权的代表性任务中核对首次写入顺序与检查证据。不以规则文件数量判断采用成功。

现有 `scripts/prepare-project.mjs` 不携带本次新文件，也不会合并工具入口；不加参数暗示它已升级。它拒绝覆盖已有目标，升级采用用差异合并，不重跑强制覆盖。

| 业务模板源 | 目标项目位置 | 特别注意 |
| --- | --- | --- |
| `templates/agent/business/AGENTS.md.candidate` | `AGENTS.md` 的合并内容 | 保留正式约束、补齐画像后采用 |
| `templates/agent/business/enterprise-coding-rules.mdc` | `.cursor/rules/enterprise-coding-rules.mdc` | @ 路径指向目标项目，不指向规范包 |
| `templates/agent/business/.aider.rules` | `.aider.rules` | 普通文件；需 read 配套 |
| `templates/agent/business/.aider.conf.yml` | `.aider.conf.yml` 的合并配置 | read 路径完整，从目标项目根启动 |
| `templates/agent/business/copilot-instructions.md` | `.github/copilot-instructions.md` 的合并内容 | 原有项目指令不可覆盖 |
| `templates/agent/business/CLAUDE.md.template` | `CLAUDE.md` 的合并内容 | 导入不放代码块/反引号内 |

业务 Aider 的只读入口为五个基础文件；Java 专项和相关专题按任务显式加入。例如 Spring API 任务从业务项目根启动：

```sh
aider --config .aider.conf.yml --read docs/coding-standards/java-spring.md --read docs/coding-standards/naming-design.md --read docs/coding-standards/contracts-security.md --read docs/coding-standards/testing.md
```

SQL/事务任务另加 data-access.md；Java EE 用 java-ee.md 替换 java-spring.md，并带目标容器事实。路径须已采用存在；不是让 Aider 自动下载缺失规范。必需规则不在只读上下文时先补读，不让模型凭文件名猜内容。根据保密策略评估模型接收的代码、历史和仓库地图；不把整目录通配加载当作省事方案。

## 日常如何提问

写前只读走查，可直接交给已启用的 Agent：

```text
只读走查，不创建或修改文件。依据本项目已合并入口、画像和相关企业规范，
为“新增订单摘要查询”输出：AC、实际角色/文件路径与名称、允许依赖、
接口和字段含义/单位/null/权限/兼容、检查 ID 与真实命令。
说明不需要新建的接口、基类和目录；未知关键事实标待确认。
不要以规范包检查代替本应用验证，不访问生产或外发敏感资料。
```

已明确授权的开发任务：

```text
在既定任务范围内实现本 spec。首次相关源码写入前给出简短的路径/命名/
依赖/契约/验证决定；遵守已采用企业规范，保留现有修改。
完成实现、有效回归和授权环境内的真实检查，逐项复核 AC，
报告 pass/fail/blocked/not-run/not-applicable 与缺口。
不要改无关架构、安装外部服务、自动提交/推送/部署。
```

选择 [功能模板](../../templates/spec/feature-spec.md)、[修复模板](../../templates/spec/bugfix-spec.md) 或行内记录即可。已填写案例见 [Java 功能](examples/java-feature.md) 与 [Java 修复](examples/java-bugfix.md)。复杂流程沿用 [原有手册](../agent-workflow.md)，不另造同义流程。

## 启用后怎样验收

- 加载：记录工具版本、启动相对目录、入口/只读列表和策略状态，不输出个人路径或凭证。
- 写前：核对 AC、真实路径/命名/依赖/字段和检查计划出现在首次代码写入之前；最终自述不是证据。
- 保护：检查目标差异只涉及授权路径，既有改动与生成物未被覆盖；只读任务无文件变化。
- 执行：真实命令发现非空源码/测试，覆盖相关失败与拒绝路径；静态语法检查不证明工具实际载入。
- 报告：保留缺口，self 不冒充 independent-agent；正式门禁由可信执行环境实现，文本不是沙箱。

更新上游来源时先比较固定快照和官方加载变化，不自动重生成/覆盖入口。MCP/A2A 按 [MCP](extensions/mcp.md) / [A2A](extensions/a2a.md) 独立评审，默认不启用，不影响基础开发。

具体验收任务、12 项正反场景、四种宿主的证据要求及记录方式见 [行为验收用例](06-acceptance-cases.md)。先加载与只读验证，再做授权副本中的代表性任务；离线草稿组装不能替代宿主行为验收。

## 常见启用问题

| 现象 | 先核对什么 | 安全处理与边界 |
| --- | --- | --- |
| 已下载仓库，但 Agent 不按规范写代码 | 是否采用到业务项目，入口作用域、宿主/功能与设置 | 下载不等于采用；按目标项目合并入口，先做只读验收，不直接覆盖规则 |
| Aider 找不到规则或没有 .aider.rules | 启动目录、有效配置、read 列表及实际文件 | 从目标项目根显式配置；补齐已采用文件，不把规范加入可编辑集合 |
| Claude 能读 CLAUDE，却不读 AGENTS | 版本、项目指令设置、内置插件及会话条件 | 保留原生导入；部分旧会话需兼容处理，见兼容说明，不绕过组织策略 |
| Cursor 中规则未应用 | .mdc 扩展名、元数据类型、作用域、规则状态 | 在适用 Agent 会话验证；不把 .md 文件放入规则目录后当作 .mdc，也不以补全结果证明加载 |
| Copilot 找到入口，却未使用详细规范 | 当前功能支持、指令引用、相关文件是否真的读取 | 原生入口要求按需读取；普通链接不保证导入，不扩大到全部上下文 |
| 重复导出报拒绝覆盖 | 已有目标文件、此前采用版本和团队调整 | 这是保护行为；做差异合并，不删除已有目录后重跑、不添加强制覆盖参数 |
| 画像仍有待确认，但 Agent 要直接写代码 | 未知是否影响本任务的路径、契约、安全或验证 | 先查相关事实；关键未知只限制相关危险写入，其余安全分析可继续，不虚构批准 |
| 工具报告零测试、没命令或环境不可用 | 测试发现配置、真实命令、覆盖和副作用 | 按真实 fail/blocked/not-run 报告；不删测试、关规则或用规范包检查代替应用验证 |
| 一个很小的修复产生大量规划文件 | 是否误把完整 spec/多角色作为强制流程 | 简短写前决定即可，保留有效回归；不常驻研究卡片、运行时和协议说明 |
| 跨宿主效果不同或升级后失效 | 分别记录版本、模式、入口/设置与动作证据 | 逐宿主重验适用用例，不能用旧会话的通过替代新版本或另一个工具 |

定位问题按“文件/路径 → 宿主加载 → 写前行为 → 应用检查”顺序进行。前三项尚未证明时不要写成整体通过；不为排查外发全量仓库、原始会话或凭证。
