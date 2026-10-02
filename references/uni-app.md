# uni-app / Vue

先确认 Vue 版本、JS/TS、CLI/HBuilderX 构建形态、源码根目录、状态方案和目标平台。uni-app 不等于普通浏览器项目。

阅读索引：UNI-01 命名、UNI-02 工程蓝图、UNI-03 依赖边界、UNI-04 状态与生命周期、UNI-05 创建顺序、UNI-06 验证。

## UNI-01 创建目录与文件前

- 已有结构优先；新项目业务目录默认 kebab-case，页面可使用 order-list/index.vue。
- 可复用 Vue 组件默认 PascalCase.vue，如 OrderCard.vue；组件库既有约定优先。
- 普通模块默认 order.ts；多词模块 kebab-case；组合式函数及文件 useXxx/useXxx.ts。
- 类型/接口 PascalCase，变量/函数 camelCase；页面组合交互，api/stores/composables/types 各负其责。
- pages.json、manifest.json、分包、资源与页面路径同步，分包目录名不是固定保留名称。
- 不照搬 Wot UI 组件库的 wd-* 业务目录；不要求安装 Wot UI、Pinia、UnoCSS 或任意 UI 库。

## UNI-02 工程蓝图与层级命名

以下以实际源码根为起点，TS/Vue 组合式写法仅适用于已选择它们的工程；JS/Vue 2 项目映射相应实现，不借此升级。CLI 源码根可能是 src，HBuilderX 工程可能就是项目根，不能自动搬迁。

```text
App.vue
main.ts
pages.json
manifest.json
pages/order-list/index.vue
components/OrderCard.vue
api/order.ts
api/request.ts
types/order.ts
static/images/order-empty.png
```

`services/order-service.ts`、`composables/useOrderList.ts`、`stores/order.ts`、`domain/order.ts`、`styles/`、`platform/` 仅在存在相应职责时增加；测试放项目测试根或已采用的同位测试目录。目录树不是完整初始化器，不额外生成云空间、全局 store、私有页面组件或未用资源。

| 层/默认路径 | 名称例子 | 职责 | 不允许混入 |
| --- | --- | --- | --- |
| 页面 `pages/order-list` | `index.vue` | 路由参数、交互编排、页面状态 | 复制完整鉴权/传输实现 |
| 可复用展示组件 `components` | `OrderCard.vue` | 明确 props/事件/插槽、局部展示 | 依赖父页内部路径、偷偷改全局业务状态 |
| API 契约 `api` | `order.ts` 中 `fetchOrders`、`createOrder` | 端点、参数、响应与边界转换 | 页面导航、弹窗或组件实例 |
| 传输 `api` | `request.ts` | 复用鉴权、超时与错误处理 | 订单页面状态、具体业务流程 |
| 用例服务（需要时）`services` | `order-service.ts` | 多 API 编排、业务转换/一致性策略 | 持有页面 ref、直接控制视图 |
| 组合逻辑（需要时）`composables` | `useOrderList.ts` | 可复用有状态逻辑与生命周期协作 | 页面私有路径依赖、多个真相源 |
| 跨页面状态（需要时）`stores` | `order.ts`、沿用项目的 `useOrderStore` | 明确共享状态及操作 | 每个临时输入框的本地状态 |
| 类型/纯规则（需要时）`types`、`domain` | `order.ts` 中 `Order`、`OrderQuery` | 数据结构、可独立测试的规则 | 网络、路由、Vue 组件依赖 |
| 平台适配（需要时）`platform` | `storage.ts` | 将平台差异隔离在明确入口 | 任意业务页面反向 import |

前端 API 层是客户端端点调用层，不是 Java Controller；`services` 是复杂用例编排，不是每个 API 再包一层的强制目录。简单查询可由页面或组合逻辑直接调用既有 `api/order.ts`，不用生成只转发参数的 service。已有 service 同时承担 API 契约且边界清晰时保留，不再造同义 api 体系。

页面私有组件留在项目已有私有位置，只有真实跨页面复用才上移；自动组件发现或 easycom 配置要与文件命名兼容，不为遵守 PascalCase 破坏既有发现规则。分包路径按真实路由配置，不把表中目录当成框架保留名。

| 对象 | 默认命名及含义 | 避免 |
| --- | --- | --- |
| 目录/普通模块 | `order-list`、`order-service.ts` | Java 式 `OrderServiceImpl.ts`、重复 `utils2` |
| 类型/组件 | `OrderQuery`、`OrderCard.vue` | 为类型统一加 I 前缀而改动公开契约 |
| 函数/事件处理 | `fetchOrders`、`submitOrder`、`handleRetry` | `doIt`、名称像查询但会提交订单 |
| 状态 | `isLoading`、`errorMessage`、`selectedOrderId` | 同时维护可推导的多份状态却不定义同步 |
| 组件事件 | 项目无约定时 `select-order`，载荷类型明确 | 用事件发送组件私有实例或依赖隐式字段 |
| 测试 | `order-service.test.ts` 等现有发现模式 | 只有截图却声称请求竞态已测试 |

命名与模块归属分别见 [命名与设计](naming-design.md)、[仓库结构](repository-structure.md)。新增页面同步路由注册和分包归属，不能只写 Vue 文件就宣称页面可访问。

## UNI-03 依赖与编码边界

默认调用方向：页面/业务组合逻辑 -> 可选用例服务 -> API -> 传输/平台适配。简单任务可以省略无职责的中间层；纯类型与领域函数不反向依赖上层。展示组件用输入/事件协作，不能 import 页面；需独立取数的业务组件单独声明该职责，不伪装成纯展示组件。

store 的调用方和 API 调用责任只选一处明确所有者，禁止 `store -> service -> store` 循环。公共请求层不导入订单 store 或页面处理登录跳转，通过项目已有回调/结果边界协作。禁止跨业务模块深层访问私有实现。

- 统一请求入口、鉴权、超时和错误处理，不每页重复创建网络体系。
- props、事件、插槽契约明确；外部数据做类型及必要的运行时校验。
- 不用 any、类型断言或忽略检查掩盖契约不匹配；样式作用域与设计变量沿用项目。
- 平台差异局部封装或使用框架支持的条件机制；小程序不得假设浏览器 DOM。
- 服务端秘密不进入前端包；凭证与缓存定义过期和清理策略，服务端完成权限判断。
- 不将 H5 构建成功描述为微信或 App 已通过。

## UNI-04 状态、生命周期与交互

- 先区分 uni-app 与 uni-app x、Vue 2/3 和具体编译目标，不直接搬用另一形态的生命周期或平台能力。
- 页面组合路由与交互；组件通过已声明输入和事件协作，不依赖父组件内部实现。props 遵循 [Vue 单向数据流](https://vuejs.org/guide/components/props.html)，需要更新由明确事件或已有状态约定完成。
- 请求相关状态显式区分加载、空数据、失败和成功；“空列表”不是所有错误的默认结果。重复提交、取消与旧响应覆盖新查询要有明确处理。
- 定时器、页面订阅和事件监听明确注销时机；按 [uni-app 页面文档](https://uniapp.dcloud.io/tutorial/page) 和实际生命周期适配，避免返回页面一次就多注册一份监听。
- 组件样式作用域沿用项目，使用稳定列表标识与已定义交互反馈；不能用深层全局选择器随意改变无关组件。
- UI 改动验证触摸目标、可读性、焦点/标签等目标平台支持的可访问性能力；不强行把浏览器 API 套到小程序。

| 场景 | 正例 | 反例 |
| --- | --- | --- |
| 查询 | 统一请求入口，只有当前有效查询结果更新状态 | 每页复制请求与登录逻辑，迟到响应覆盖新结果 |
| 组件 | 明确 props/事件，父级决定状态更新 | 子组件直接修改输入对象表达未声明副作用 |
| 页面卸载 | 清理本页面拥有的监听和计时器 | 每次显示页面注册全局监听且不移除 |
| 错误显示 | 区分网络失败、无权限和空数据 | catch 后统一设置空数组，用户不知道失败 |

旧版 API 或平台限制属于需要记录的例外，不是关闭全部类型检查的理由。请求/日志/配置细节只在相关任务读取 [配置与日志](configuration-logging.md)。

## UNI-05 新增订单页的创建顺序

1. 确认源码根、目标端、已有页面/API/状态目录，将角色映射到画像；选择复用哪些层，不先生成整个树。
2. 列页面/组件路径、路由注册、props/事件、接口字段及状态所有者，确定加载/空/失败/重试等验收。
3. 定义契约与纯逻辑测试，复用请求入口实现 API；仅当确有业务编排或复用状态时抽 service/composable/store。
4. 组合页面与组件，同步 `pages.json`、实际组件发现/注册、分包、资源和必要的平台配置，不随意更改 AppID。
5. 处理参数切换的旧响应、重复提交和卸载清理，验证关键失败与恢复。
6. 运行真实静态/类型/逻辑测试与目标端构建，再按可用环境做交互验证。

正例：复用现有 `api/request.ts`，在 `api/order.ts` 增加查询，在已注册订单页组合状态。反例：在 `static` 中放请求逻辑，各页面复制 token 处理，再建一个完全转发的 service 声称已分层。

## UNI-06 验证

采用兼容当前构建方式的 ESLint、TS/Vue 类型检查和现有测试。只运行真实存在的脚本；目标微信时验证小程序构建、路由、组件和主要交互，记录未运行的目标端。

将真实路径与别名写进 import 边界检查（若采用），覆盖 barrel 再导出和动态导入适用范围，避免仅禁一个字符串就宣称无循环。目录/注册检查、依赖边界和运行测试的状态分别记录；本包未自动给任意 uni-app 项目安装这些规则。

框架目录及资源行为参考 [uni-app 工程文档](https://uniapp.dcloud.net.cn/tutorial/project.html)。其中 pages.json、manifest.json、static 各有框架角色；本文 api/services/composables 的划分是本包默认设计，不是官方强制目录，静态资源目录不放业务代码。
