# 规则、生成前动作与检查

规则首先约束“怎样生成”，检查验证其中可机械判断的部分。下表是阅读和核验索引，编号对应专题章节，不是已实现的规则引擎。beta.1 的表内讨论标签不作为稳定规则标识；记录例外时同时写明版本、文件和章节，避免编号相似而误用。

beta.3 提供 [关键正反例](rule-examples.md) 和 [可执行演示](../examples/README.md)，明确哪些规则已经在样例中启用、哪些仍依赖审查；[Agent 评测](../evals/README.md) 另外检查实际变更与门禁完整性。

| 规则 | 生成代码之前 | 可接入的检查与局限 |
| --- | --- | --- |
| [REPO-01..05 仓库与模块](../references/repository-structure.md) | 找归属、源码根、公共边界和真实构建入口 | 目录脚本/架构测试；不能自动理解全部业务语义 |
| [ARCH-01..06 模块职责](../references/modular-architecture.md) | 公共/业务/产品映射、MVVM、组件状态、资源和公开入口 | 实际模块图、导入与契约测试；目录名不证明解耦，未配门禁仍需审查 |
| [HOS-01..06 鸿蒙](../references/harmonyos-arkui.md) | SDK/API、装饰器位置、模块形态、路由和资源登记 | 真实 SDK 构建、状态交互、生命周期与设备验证；本包尚无可运行鸿蒙示例 |
| [NAME-01..04 命名与注释](../references/naming-design.md) | 区分对象类别、单位、可空性和副作用 | 命名与类型检查、序列化测试；规则不能只有统一正则 |
| [TYPE-01..02 接口与继承](../references/naming-design.md) | 确认真实扩展点和可替代关系 | 依赖/契约测试与审查；文件数不证明抽象合理 |
| [Java/Spring 分层](../references/java-spring.md) | 明确协议、用例和持久层边界 | ArchUnit 针对真实包验证；必须防止空匹配 |
| [API-01..02 接口与幂等](../references/contracts-security.md) | 明确输入输出、错误、重复请求和权限 | 接口/契约/拒绝路径测试；编译不足以证明兼容 |
| [DB-01..05 数据与迁移](../references/data-access.md) | 精度、查询边界、并发约束、旧数据升级 | 实际数据库测试；不由 mock 或内存库结果全部代替 |
| [TEST-01..05 测试有效性](../references/testing.md) | 选择可观察断言、发现路径、隔离与失败场景 | 真实运行数量/结果和回归用例；不以空通过充数 |
| [CONFIG-01..02、LOG-01 配置与日志](../references/configuration-logging.md) | 来源/缺省、秘密分类和脱敏 | 配置/日志测试与审查；不打印秘密作为验证 |
| [RUN-01..02 运行边界](../references/configuration-logging.md) | 失败预算、生命周期与共享状态 | 超时/重复/清理测试；不只验证正常路径 |
| [CHANGE、DEP、RULE 系列](../references/change-management.md) | 影响范围、兼容证据、例外和升级差异 | 差异审查与受影响测试；不以扩大忽略范围通过 |
| [uni-app](../references/uni-app.md) / [原生小程序](../references/miniprogram.md) | 页面/组件/路由、平台、生命周期和状态 | 目标端构建及交互；不由 H5 构建代替 |

正文：[通用规则](../references/common.md)、[Java/Spring](../references/java-spring.md)、[Java EE](../references/java-ee.md)、[uni-app](../references/uni-app.md)、[小程序](../references/miniprogram.md)、[契约与安全](../references/contracts-security.md)。

## 项目决策的优先关系

Agent 自身的指令层级不由本包改变。在项目约定内，正式架构/已批准团队选择优先于本包默认值；旧代码中的偶然写法不自动等于团队标准。有冲突时保留现状并解释依据，只有影响结果的未决事项才询问。

例外应限定规则、目录/对象、原因和批准依据，注明复审条件；不能为了单个文件禁用全仓检查。小修复不要求建立繁重审批体系。

## 怎样判断接入真实有效

每项检查记录工作目录、真实命令、覆盖的源码、排除范围和执行状态。用最小违规样例证明会失败，再修正证明会通过；样例测试不要留在生产代码里。

“规则已采用”与“检查已启用”分别记录。未安装 Checkstyle 的项目也可以遵守命名规则，但不能把它描述成有自动命名门禁。反之，格式化通过也不代表业务接口、权限和架构合理。
