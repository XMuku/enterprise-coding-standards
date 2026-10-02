# 五个参考仓库的取舍与落地

核对日期：2026-10-02。本次阅读 README、目录与下列具体文件，不代表运行或审计了这些仓库全部工具。以下是针对本包的设计比较，不是按星数排名，也不表示上游认可本项目。没有安装这些 Skill、克隆整仓进分发包或复制其实现。

## 逐项比较

| 来源与固定快照 | 已观察到的特点 | 本包原有基础与本次补齐 | 不照搬的部分 |
| --- | --- | --- | --- |
| [casa-de-vops/terraform-code-standards](https://github.com/casa-de-vops/terraform-code-standards/tree/bdf5e355ec2ac03563f6fc6328dfecc487fa0a1c) | 目录/命名按主题分开；[工作流](https://github.com/casa-de-vops/terraform-code-standards/blob/bdf5e355ec2ac03563f6fc6328dfecc487fa0a1c/.github/workflows/azure-template.yml) 区分 validate、plan、apply，并指定环境与权限 | 已有草稿预览和不覆盖保护；补 GATE-04，把验证、计划、真实执行分开，外部环境关注权限与并发 | 不新增 Terraform/Azure 技术栈、云凭证或自动 apply；其浮动 latest/main 引用不替代本包已有固定版本策略 |
| [future-architect/coding-standards](https://github.com/future-architect/coding-standards/tree/5688fc9b59b007a44c928afc338b26f9f05a8346) | Java/SQL 按版本或方言组织；[OpenAPI 3.0.3 规范](https://github.com/future-architect/coding-standards/blob/5688fc9b59b007a44c928afc338b26f9f05a8346/documents/forOpenAPISpecification/OpenAPI_Specification_3.0.3.md) 说明前提、理由、具体命名与示例 | 已有五栈蓝图、默认/约束区分；补 API-03，声明契约唯一来源、生成方向与版本兼容，扩展规则作者的反适用场景 | 不把其 schema-first、YAML 排版或受限客户端假设强加给所有项目；不逐段翻译 |
| [selvarajmurugesan90/ops-engineering-skills](https://github.com/selvarajmurugesan90/ops-engineering-skills/tree/59bee31e760775948bc8a1199efac484df704fc6) | [编写指南](https://github.com/selvarajmurugesan90/ops-engineering-skills/blob/59bee31e760775948bc8a1199efac484df704fc6/spec/authoring-guide.md) 明确触发条件、前置环境、失败模式和实例；[迁移专题](https://github.com/selvarajmurugesan90/ops-engineering-skills/blob/59bee31e760775948bc8a1199efac484df704fc6/plugins/database-operations/skills/database-schema-migration-with-liquibase-and-flyway/SKILL.md) 关注共享迁移历史与真实数据库验证 | 已有按需路由和 DB-04/05，不重复新增迁移 Skill；补维护检查表和可区分的成熟度/执行证据 | 不整体安装数百个 Skill；兼容性声明与格式校验不算所有 Agent 的行为验证；不为模板统一强制八个章节 |
| [Romandredan/1c-quality-gate](https://github.com/Romandredan/1c-quality-gate/tree/b705145729732683ae04c7d4e7579628537a1892) | [质量流程](https://github.com/Romandredan/1c-quality-gate/blob/b705145729732683ae04c7d4e7579628537a1892/skills/quality-gate/SKILL.md) 按变更特征调节深度；[证据校验器](https://github.com/Romandredan/1c-quality-gate/blob/b705145729732683ae04c7d4e7579628537a1892/tools/evidence-validator.mjs) 区分检查、跳过、未验证与工具可用性 | 已有正反例与状态文字；补 GATE-01/02/03/05、独立计划、JSON 记录一致性与文件哈希校验 | 不复制 BSL/XML 规则、外部 MCP、自动下载器或宿主 Stop Hook；本包不声称拥有相同会话强制门禁 |
| [databricks-solutions/genie-code-skills-demo](https://github.com/databricks-solutions/genie-code-skills-demo/tree/8d41b1077f3ba1827bb9ab3b154e176ac3119a62) | [README](https://github.com/databricks-solutions/genie-code-skills-demo/blob/8d41b1077f3ba1827bb9ab3b154e176ac3119a62/README.md) 分开 Skill、指令模板与可选 MCP；[数据专题](https://github.com/databricks-solutions/genie-code-skills-demo/blob/8d41b1077f3ba1827bb9ab3b154e176ac3119a62/skills/pii-management/SKILL.md) 在生成前考虑敏感字段 | 已有四部分和本地优先；补 SEC-01 的字段用途、允许流向、脱敏与保留决策，保持模板默认未运行 | 不带 Databricks 账号、Unity Catalog、固定湖仓层次、其 SQL 或部署脚本；不把字段名匹配、散列或标注当作完整隐私保护 |

## 本次真正改变了什么

1. **写前约束**：[风险与证据](../references/quality-gates.md) 将风险原因、受影响边界、检查范围在相关写入前确定；不要求小改动写长报告。
2. **可执行校验**：[使用说明](evidence-validation.md) 和独立 Node.js 工具拒绝漏项、空覆盖、状态矛盾、过期标识与失配文件。模板保留未运行状态，不产生虚假成功证据。
3. **契约和数据设计**：[契约与安全](../references/contracts-security.md) 补 schema/code-first 的项目选择、错误和安全契约同步、敏感字段流向。不是换框架或增加所有表的必填字段。
4. **规范自身维护**：[贡献说明](../CONTRIBUTING.md) 区分规则来源、项目默认、反适用场景、机械检查和人工判断；新增 PR 自检项，防止只维护宣传性通过声明。

新参考文件随五栈草稿导出，但只在相关任务读取。校验器和 JSON 示例不自动写进业务项目，不改变现有开发工具，也不安装外部依赖。已有采用项目通过差异合并升级。

## 来源许可与复用边界

本次记录的来源许可：casa-de-vops 为 Apache-2.0，Future 为 CC-BY-4.0，ops-engineering-skills 为 Apache-2.0，1c-quality-gate 为 MIT；以相应快照的许可证与文件声明为准。来源链接、作者归属和版本保留在本页，不把这些许可套用于本包。

Databricks 使用其 [DB License](https://github.com/databricks-solutions/genie-code-skills-demo/blob/8d41b1077f3ba1827bb9ab3b154e176ac3119a62/LICENSE.md)，其中将使用范围关联到 Databricks Services。它不是这里可以直接当成 MIT/Apache 模板复制的材料。本次只比较公开设计，不引入或改编其代码、SQL、Skill 文本或部署资产。若未来需要再分发任何上游内容，另行审查授权与所需声明；这是仓库取舍，不替代法律意见。

## 仍然缺少的内容

| 后续事项 | 为什么本次没有宣称完成 |
| --- | --- |
| 可信运行器适配、自动快照和签名 | 当前只校验声明与文件一致性，无法证明 Agent 没有伪造原始记录 |
| 真实项目与独立 Agent 评测扩充 | 工具单元测试不等于五栈开发流程、所有提示词或跨模型验证 |
| Java EE、微信原生、HarmonyOS 可运行案例 | 保留专项规范，但不能用现有 Spring/uni-app 演示代表所有栈 |
| 示例依赖治理 | 既有前端依赖审计风险仍在，新增流程不会自动消除漏洞 |
| 组织级门禁与批准流程 | 需要实际项目维护者、CI 权限和交付政策，不由一份 Skill 自行授权 |

优先补可信运行器与代表性真实任务，而不是继续堆积未经验证的 Skill 或新增十套目录模板。
