# 通用项目框架规范的整合说明

本版将提供的 `HOS_GENERAL_FRAMEWORK_SKILLS` 中的架构判断、MVVM、组件、状态、资源、迁移和协作流程纳入本规范包。原材料没有作为独立的重复规则再分发；下表给出内容归属和调整，来源文件名只用于识别输入材料，不包含其存储位置、账号或机器信息。

## 内容归属

| 原规范内容 | 合并位置 | 应用方式 |
| --- | --- | --- |
| 架构目标、三层职责、依赖方向 | [模块架构](../references/modular-architecture.md) ARCH-01/05 | 通用职责约束，目录名按项目映射 |
| commons 下的数据/网络/UI/工具 | ARCH-02/04 与 [HarmonyOS](../references/harmonyos-arkui.md) HOS-02 | 共同语义成立才抽取，业务数据仍归领域 |
| features 的 model/service/view/viewModel | ARCH-03、HOS-02/04 | 采用 MVVM 时映射职责，按真实复杂度建文件 |
| products 入口/Ability/导航/设备 | ARCH-01/04、HOS-01/05 | 产品装配与平台配置保留在入口边界 |
| 公共/业务/产品组件分类 | ARCH-04、HOS-02/04 | 输入/事件、私有边界和资源所有权 |
| V2 装饰器与状态更新 | HOS-03 | 按 API、组件/类位置与观察范围核对 |
| 文件夹/页面/VM/服务/仓库/常量命名 | HOS-02/04、[命名规则](../references/naming-design.md) | 默认可调整，框架保留名称与公开契约优先 |
| 新模块开发与公开入口 | ARCH-05/06、[鸿蒙提示词](../prompts/12-harmonyos-arkui-feature.md) | 先归属/契约，再实施/登记/验证 |
| 增量迁移与资源调整 | ARCH-06、[迁移提示词](../prompts/09-refactor-migration.md) | 小步保持行为，每步真实验证 |
| 架构/MVVM/组件/状态/资源/依赖清单 | [规则到检查](rules-and-checks.md)、HOS-06 | 没有实现门禁的项目标记审查或未接入 |
| 文档同步、保护改动、影响/验证报告 | ARCH-06、[完整流程](agent-workflow.md) | 架构变化同步必要文档，公开内容使用相对路径 |
| 十项开发 Skills | 上述规则及提示词 | 转成一个按需路由中的能力，不新增十个互相重复的 Skill |

## 需要调整的条目

- 三层目录是推荐架构，不能把 Java 后端或已有 Vue 项目强制迁移到鸿蒙目录。
- 私有组件放 `view` 是该方案选择，已有 `components` 约定可保留；不声明所有项目取消组件目录。
- “小写功能名”的示例改用 `order`、`login` 等，避免 `moduleA` 与小写规则矛盾；`AppScope` 和配置保留名不机械改名。
- 公共抽取看领域与生命周期，不因有两个使用者或“未来可能使用”就把所有 Repository/Mock 放入 commons。
- `@Local` 属于 V2 组件内部状态，普通 ViewModel 不能直接使用；可观察类与字段使用对应的 `@ObservedV2/@Trace`。
- 装饰器支持范围和 V1/V2 混用由实际 SDK/API 决定；对象/数组不是一律深拷贝才能刷新，必须验证对应观察层次。
- 公开入口大小写从包清单核对，依赖修改后才同步必要安装与锁文件；Git 提交和发布仍遵从当前用户任务范围。
- 构建与依赖目录不手改；可维护 Wrapper 和脚本不能因为名字叫 hvigor 就删除。
- 路由、Ability 与资源配置必须检查实际加载路径；把文件移动到正确目录不能单独证明运行正常。

## 如何读取与导出

一般模块任务从 common 或仓库规则路由到 `modular-architecture.md`。鸿蒙任务选择 `harmonyos-arkui`，读取专项规则和提示词；Java、uni-app、小程序仅采用对应通用职责，不加载鸿蒙装饰器。

导出工具新增 `--stack harmonyos-arkui`，附带模块架构专题，并为五技术栈的所有非空组合测试文件选择与链接。导出只生成草稿，仍不创建业务模块、安装 SDK 或配置签名。

本版尚未执行真实 HarmonyOS 应用构建、设备运行或独立 Agent 鸿蒙评测；参考资料支持机制核对，不等于本规范经过编译验收。完整验证范围见 [beta.5 验证记录](verification-beta5.md)。
