# HarmonyOS / ArkTS / ArkUI

触发：HarmonyOS 应用的模块、Ability、页面、组件、状态、资源或明确迁移。先确认项目 SDK/API、设备类型、工程模型、ArkTS 约束与构建方式；本规则不是完整可编译样板，尚无本包的鸿蒙运行验证。

## HOS-01 真实工程画像

读取项目现有 `AppScope/app.json5`、工程/模块 `build-profile.json5`、`oh-package.json5`、锁文件、`hvigorfile.ts`、`src/main/module.json5` 和路由/页面资源。清单不一定全部存在，以实际工程为准。

核对 compile/compatible/target API、DevEco/SDK、Hvigor/OHPM 与 Wrapper、Stage/其他工程模型、HAP/HAR/HSP 模块形态、产品 targets 和已有状态管理版本。HarmonyOS 商业 SDK 与 OpenHarmony 资料分别确认，不把另一平台 master 分支当项目编译版本。

写前决定路径、模块类型、包名、职责、公开入口、依赖、路由、资源与测试。新建目录不等于模块已登记；HAP/HAR/HSP 不是可互换名称，转换须同时核对构建配置、依赖、资源和运行加载。官方说明可参考 [HAR/HSP 转换指导](https://developer.huawei.com/consumer/cn/doc/doccenter-getting-started/har-to-hsp)，按实际 SDK 查证，不复制其版本数字。

## HOS-02 可选的三层与 MVVM 结构

采用 [模块架构](modular-architecture.md) 时，可映射为：

```text
commons/<capability>/src/main/ets/<responsibility>/
features/<feature>/src/main/ets/{model,service,view,viewModel}/
features/<feature>/src/main/resources/
products/<product>/src/main/ets/{entryability,pages,router,view}/
products/<product>/src/main/resources/
```

花括号仅表示可能的职责，不能直接当脚手架路径执行；示例省略清单和测试配置。feature 名使用项目一致的小写单词或既有形式，框架保留名称如 `AppScope` 不强制改小写。`viewModel` 是此方案的目录默认值，不是语言保留目录。

公共 datastore 只放稳定的跨业务基础数据/存储能力；业务 Repository、模型、Mock 默认在所属 feature 或测试边界。公共 network 处理传输、认证头、超时、拦截与错误映射，通过既有事件/接口通知状态所有者；不持有页面或直接导航。产品层装配路由与全局状态，不承载 feature 业务。

此方案中模块私有组件可与页面同放 `view`，公共组件放已有公共 UI 模块，产品壳放产品 `view`。已使用 `components` 的项目保留约定，只有明确迁移才搬动。没有复用需求不新建 commons 下所有子模块。

## HOS-03 状态版本与装饰器位置

以下为 V2 方案的适用角色，使用前核对项目最低 API 及组件类型：

| 装饰器 | 正确职责 | 常见错误 |
| --- | --- | --- |
| `@Entry` | 实际被路由/页面配置使用的入口 | 给普通卡片随意加入口，或断言 feature 永远不能有入口 |
| `@ComponentV2` | 项目支持的 V2 自定义组件 | 在 V1 工程机械换名，却保留不兼容状态定义 |
| `@ObservedV2` / `@Trace` | 可观察类与需要观察的成员；可用于 ViewModel | 所有工具类加观察，或只标类不处理需要刷新成员 |
| `@Local` | V2 组件拥有的内部状态 | 放在普通 ViewModel 类、从父组件传值初始化 |
| `@Param` | V2 组件接收的外部输入 | 子组件自行赋值，将嵌套共享状态的写权限视为默认 |
| `@Event` | V2 组件输出的回调 | 子组件直接修改父 ViewModel 私有实现 |
| `@Builder` | 项目支持的 UI 片段抽取 | 用超长片段代替具有明确输入输出的组件 |

`@Local`、`@Param`、`@ObservedV2/@Trace` 的官方参考标注 API 12 起的支持条件。依据分别见 [组件内部状态](https://github.com/openharmony/docs/blob/master/zh-cn/application-dev/ui/state-management/arkts-new-local.md)、[输入参数](https://github.com/openharmony/docs/blob/master/zh-cn/application-dev/ui/state-management/arkts-new-param.md)、[类与字段观察](https://github.com/openharmony/docs/blob/master/zh-cn/application-dev/ui/state-management/arkts-new-observedV2-and-trace.md)。其他装饰器及混用能力仍按对应版本文档核对。

`@Param` 的输入限制不能当作整个对象图深度不可变；嵌套对象可能具有自己的观察和修改机制，组件接口仍须明确状态所有者。`@Local` 观察类对象本身，与对象内部字段观察是不同层次，不能声称加一个装饰器就能观察所有深层变化。

正例：支持 V2 的页面持有一个 ViewModel，观察字段变化并向子组件传输入/事件；子组件反馈动作给状态所有者。反例：每个子组件都新建独立订单状态，或给 ViewModel 字段加 `@Local`。

V1/V2、混合场景、卡片/服务等支持条件按真实 API 验证；普通功能不自动迁移 V1。不可变替换、数组操作、嵌套字段更新按实际观察机制选择，用界面变化验证，不要求无条件深拷贝。

## HOS-04 命名、公开入口与数据流

默认示例：`OrderPage.ets`、`OrderViewModel.ets`、`OrderService.ets`、`OrderRepository.ets`、`OrderCard.ets`。模型按职责拆分，不把全部模块类型收进巨型 `Models.ets`；实际团队命名优先。

字段/方法表达业务含义、单位、类型和空值；事件可用 `onSubmit`、`onBack` 等动作名。每文件一个主要组件/类型，少量私有辅助按可读性保留；框架扩展基类遵从其契约，不为复用创建万能基类。

模块公开入口以清单配置为准，如实际采用 `Index.ets` 则保持大小写；只导出需要的页面/契约，不暴露私有 ViewModel、资源路径或全部内部类型。消费者使用登记的包与公开入口，不越过边界深层 import。

View 组合展示并转交动作，ViewModel 管理展示状态并调用 Service，Service 使用 Repository/Network。加载、空、失败、重试、权限拒绝与过期响应按任务定义，订阅、计时器和请求按 Ability/页面/组件真实生命周期管理。

## HOS-05 资源、模块注册与生成产物

feature 私有图片/字符串/颜色留在本模块资源；产品主题、设备/深色适配由产品层拥有；共享资源通过真实资源访问机制公开。不能把另一个模块的私有资源文件路径当公共 API，也不为多个设备复制一份同样资源。

新增模块同步实际工程 modules/targets、包依赖、模块配置、公开入口和路由资源。Ability、页面路由、权限与设备能力仅按需求登记。依赖变更使用项目对应工具更新锁定与构建；仅移动代码且依赖不变时不重装全工程。

`oh_modules`、`.hvigor`、可再生 `build` 与签名输出不手改，不随规范分发。Hvigor 脚本、Wrapper、锁文件和构建清单是维护输入，不能因为名称相似把 `hvigor/` 整体当产物删除。真实签名证书、密码、SDK 绝对路径、账号与私有 device 信息不进入共享文档或 Git。

## HOS-06 验证与交付

从实际任务/Wrapper 查询构建与测试命令，不虚构适用所有版本的 `hvigorw` 参数。核对单元/设备测试的真实源码根与发现规则，不直接复制参考树的 test/ohosTest 位置。

至少考虑受影响模块编译、依赖/资源/路由解析、状态逻辑、公共组件输入事件、深层更新、失败恢复、快速重复操作与生命周期。预览器、模拟器、真机、目标设备、正式签名分别记录；构建通过不能代替 UI 状态或设备能力验证。

本包目前只提供规范、提示词与文档导出，未提供可运行 HarmonyOS 示例、SDK 自动安装或已验证架构门禁。没有环境时交付明确未验证项，不拿 Java/uni-app 的结果证明鸿蒙通过。发生模块/路由/依赖变化时同步项目画像与结构文档，迁移保持增量且保留用户改动。
