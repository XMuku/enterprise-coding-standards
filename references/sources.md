# 来源与维护

本地包版本 1.2.0-beta.6，更新日期 2026-10-02。规则由项目维护者与 AI 辅助整理，是项目治理模板，不是任何上游官方标准。链接供审查和必要时查证，普通开发无需全部打开。

| 来源 | 角色 | 采用边界 |
| --- | --- | --- |
| [Alibaba P3C](https://github.com/alibaba/p3c) | Java 规约参考，可选检查实现 | 不把旧框架示例当当前版本要求 |
| [Awesome Copilot](https://github.com/github/awesome-copilot) | 可选 Skill 来源 | 按任务选择，不全仓加载 |
| [java-springboot](https://github.com/github/awesome-copilot/tree/main/skills/java-springboot) | Spring 专项建议 | 不强制 JPA 或替换现有方案 |
| [javax-to-jakarta-migration](https://github.com/github/awesome-copilot/tree/main/skills/javax-to-jakarta-migration) | 明确迁移任务参考 | 不批量改 JDK javax 包，不照搬版本号 |
| [e-gov/cursor-prompts](https://github.com/e-gov/cursor-prompts) | 实验性流程、安全与审查参考 | 按条目采用，不当企业认证或完整治理方案 |
| [Wot UI AGENTS.md](https://github.com/wot-ui/wot-ui/blob/main/AGENTS.md) | uni-app 组件约定参考 | 不照搬组件库目录，不强制安装 Wot UI |
| [uni-helper/skills](https://github.com/uni-helper/skills) | uni-app / Vue 知识补充 | 概念验证性质，项目需要时再选 |
| [miniprogram-development](https://github.com/TencentCloudBase/skills/tree/main/skills/miniprogram-development) | 可选原生小程序流程 | 实际使用时保留配套协议；不强制云开发 |
| [Checkstyle](https://github.com/checkstyle/checkstyle) | Java 静态约定 | 需要实际配置与兼容版本 |
| [ArchUnit](https://github.com/TNG/ArchUnit) | 架构约束测试 | 需要真实包边界与非空测试 |
| [PMD](https://github.com/pmd/pmd) | 可选静态分析 | 不假设 P3C 规则兼容全部新版解析器 |
| [ESLint](https://github.com/eslint/eslint) | JS/Vue/TS 静态检查 | 项目化配置与适用插件 |
| [TypeScript](https://github.com/microsoft/TypeScript) / [Vue language-tools](https://github.com/vuejs/language-tools) | 类型检查 | 按项目构建形态接入 |
| [Prettier](https://github.com/prettier/prettier) | 可选格式化 | 不与已有格式来源互相改写 |
| [Spring 事务语义](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html) | 代理与事务查证 | 不以看到注解代替实际回滚测试 |
| [Checkstyle 命名规则](https://checkstyle.org/checks/naming/index.html) | 命名检查选项 | 目录和文件路径检查另行处理 |
| [Maven 目录布局](https://maven.apache.org/guides/introduction/introduction-to-the-standard-directory-layout.html) | 源码/资源/测试职责示例 | 不强制其他构建系统或自定义工程迁移 |
| [Spring Boot 代码组织](https://docs.spring.io/spring-boot/reference/using/structuring-your-code.html) | 包组织与启动入口位置参考 | Spring 不强制唯一布局；controller/service 等为本包默认约定 |
| [Jakarta EE Web 应用](https://jakarta.ee/learn/docs/jakartaee-tutorial/current/web/webapp/webapp.html) | WAR/资源/描述符与容器机制参考 | 以真实容器能力为准，不强制 XML 或升级 |
| [uni-app 工程](https://uniapp.dcloud.net.cn/tutorial/project.html) | 工程入口、路由配置与资源角色 | api/services/stores 分层为本包设计，不把普通代码放 static |
| [微信官方工程配置](https://github.com/wechat-miniprogram/miniprogram-demo/blob/master/project.config.json) / [应用配置](https://github.com/wechat-miniprogram/miniprogram-demo/blob/master/miniprogram/app.json) | 源码根、页面/分包/组件注册的配置实例 | 不复制 AppID、版本、云服务选择或私有配置；示例不是通用目录标准 |
| [Spring Boot 外部配置](https://docs.spring.io/spring-boot/reference/features/external-config.html) | 配置来源与绑定查证 | 覆盖顺序和 API 按实际版本，不要求升级到文档最新版 |
| [JUnit 文档](https://docs.junit.org/current/user-guide/) | 测试能力和运行配置查证 | 项目现有版本优先，不当作默认升级版本 |
| [OWASP 日志指导](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html) | 日志信息分类、敏感数据与注入风险 | 按场景适配，不虚构法定保留期限 |
| [Vue props](https://vuejs.org/guide/components/props.html) / [uni-app 页面](https://uniapp.dcloud.io/tutorial/page) | 数据流与生命周期查证 | Vue 版本、uni-app/x 和平台能力分别核对 |
| `HOS_GENERAL_FRAMEWORK_SKILLS`（维护者提供的规范材料） | 三层职责、MVVM、组件/状态/资源、迁移与协作判断 | 提炼为 [模块架构](modular-architecture.md) 与按需选择的 `harmonyos-arkui.md`，不依赖原知识库；不是上游官方标准 |
| [OpenHarmony Local](https://github.com/openharmony/docs/blob/master/zh-cn/application-dev/ui/state-management/arkts-new-local.md) / [Param](https://github.com/openharmony/docs/blob/master/zh-cn/application-dev/ui/state-management/arkts-new-param.md) / [ObservedV2 与 Trace](https://github.com/openharmony/docs/blob/master/zh-cn/application-dev/ui/state-management/arkts-new-observedV2-and-trace.md) | V2 状态角色与观察范围核对 | 文档可能更新，商业 HarmonyOS SDK/API 需单独核对；不直接作为项目编译版本 |
| [Huawei HAR/HSP 指导](https://developer.huawei.com/consumer/cn/doc/doccenter-getting-started/har-to-hsp) | 模块形态转换参考 | 真实清单、依赖、资源和目标版本优先；不把模块名称互换视为迁移完成 |

## Agent 加载机制

[Codex AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md) 用作项目规则入口；[Skill 文档](https://learn.chatgpt.com/docs/build-skills) 说明按需加载。其他 Agent 是否自动加载取决于其支持机制，必要时显式指定本地文件。

## 版本与证据

- 本包独立包含使用所需规则与模板，不依赖维护者的个人知识库；没有复制上游整仓或安装上述外部 Skill。beta.3 的两个示例单独声明检查工具依赖，不会自动安装到业务项目。
- 规范包原仓库 `examples/` 单独记录示例版本与兼容约束，前端完整解析锁定在 lockfile；这些版本只用于演示复现，不作为现有项目升级指令。导出项目规则时不附带示例或示例依赖。
- beta.2 新增专题是维护者整理的项目约定与判断示例；外部链接仅支持其对应机制，不代表上游逐条背书所有“默认”或“约束”。数据库、测试框架和平台相关能力仍需目标项目证据。
- beta.5 新增职责映射与 HarmonyOS 专项规则；原输入材料不整体复制，整合时修正目录强制化、状态装饰器位置等不适用泛化。未执行真实鸿蒙构建或设备评测。
- beta.6 完善原四栈工程蓝图、职责/命名表、依赖和创建流程；2026-10-02 核对上述工程组织资料。文件夹名和后缀是本包可采用规则，既有架构需映射而非强制迁移；未新增业务平台运行证据。
- 没有宣称锁定全部上游 commit；网页链接可能变化。未来实际安装/接入时记录所采用的 release/commit 和团队调整。
- 链接不代表再分发上游内容的许可。引入外部代码、模板或 Skill 时记录精确版本、许可证和所需声明，不把外部仓库的许可证套用于本包。
- 维护者决定本仓库不添加 LICENSE；公开可见不代表授予开源许可，使用方法说明也不是许可文本。参见 [GitHub 的许可证说明](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository)。第三方组件仍受各自许可约束。
- 升级规范时保留项目已采用的版本及差异记录；不自动覆盖团队选择。删除已无作用的重复说明，避免规范无限增长。
