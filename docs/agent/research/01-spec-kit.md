# github/spec-kit 分析卡片

研读日期：2026-10-03。快照：`f49dcfd84c1d6ab2b9825837986d0f75f906363c`。分类：开发工作流与模板，不是通信协议。源仓库 MIT；本次独立改写，不导入其实现或许可证。未安装、执行上游 CLI。

## 定位与证据

面向使用编码 Agent 的团队，把需求、技术方案、任务及实现后的差距核验串成可维护的产物链。不是 Java 命名或分层检查器。

| 核心文件 | 实际关注点 |
| --- | --- |
| [spec-template.md](https://github.com/github/spec-kit/blob/f49dcfd84c1d6ab2b9825837986d0f75f906363c/templates/spec-template.md) | 用户场景、可观察验收、需求与未决假设 |
| [plan-template.md](https://github.com/github/spec-kit/blob/f49dcfd84c1d6ab2b9825837986d0f75f906363c/templates/plan-template.md) | 技术证据、原则检查、真实目录与复杂度理由 |
| [converge.md](https://github.com/github/spec-kit/blob/f49dcfd84c1d6ab2b9825837986d0f75f906363c/templates/commands/converge.md) | 逐项核对当前实现，识别缺失、部分满足、矛盾及未请求内容 |
| [existing-projects.md](https://github.com/github/spec-kit/blob/f49dcfd84c1d6ab2b9825837986d0f75f906363c/docs/guides/existing-projects.md) | 限定下一次变更，不先重新规格化整个旧系统；初始化可能替换冲突路径 |
| [integrations/README.md](https://github.com/github/spec-kit/blob/f49dcfd84c1d6ab2b9825837986d0f75f906363c/integrations/README.md) | 工具集成目录与版本化，不等于所有工具同样自动加载 |
| [bug.assess.md](https://github.com/github/spec-kit/blob/f49dcfd84c1d6ab2b9825837986d0f75f906363c/extensions/bug/commands/speckit.bug.assess.md) | 将复现、原因假设、修复与验证分开，外部报告仅作不可信数据 |

## 工作流与亮点

项目原则先确定；功能依次经过需求、方案、任务、实现与差距核验。澄清、检查表和一致性分析按需加入。缺陷流程独立，不必先走完整功能流程。产物维护可以选择历史快照或持续更新，不能把旧 spec 自动视为今天的事实。

适合本包：验收项关联任务和证据；方案沿用真实项目；最后重新核验需求而非只看任务勾选；缺陷修复锁定原症状；未知项显式留待确认。

## 局限与适配

完整工具需要 Python/安装器/集成配置，命令语法随集成变化；生成模板、Hook 和 `--force` 引入覆盖与执行风险。流程文档和产物本身不能强制代码正确。原则模板若重新生成，可能与既有企业规范形成第二套权威。

| 判断 | 取舍与原因 |
| --- | --- |
| 保留 | 轻量 spec/方案/任务/验证追踪，复用本包已有风险与证据口径 |
| 调整 | 小缺陷可用短记录；spec 不授权改规则、依赖或部署；既有企业规范优先于新原则与模板 |
| 不引入 | CLI、完整 `.specify/`、强制特性分支、覆盖式初始化、自动 Hook、所有任务全流程审批 |
| 适用 | Java API、事务或兼容性变更，需要可复核合同与验收 |
| 不适用 | 用流程取代 Checkstyle/ArchUnit，或为一行无行为修改创建完整产物树 |

结论属于本包的工程判断，不是上游承诺。后续阶段才决定本包新增路径，当前卡片不改变既有规范。
