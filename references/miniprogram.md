# 原生微信小程序

与 uni-app 是不同工程形态；先读取 project.config.json 和 app.json，确认 miniprogramRoot、JS/TS、appid 与目标环境。

阅读索引：WX-01 工程事实、WX-02 目录与命名、WX-03 分层依赖、WX-04 创建顺序、WX-05 状态正反例、WX-06 验证。以下默认组织方式不替代实际基础库和构建配置。

## WX-01 工程事实与边界

- 页面和组件目录默认 kebab-case，同页面文件保持一致：index.js/ts、index.json、index.wxml、index.wxss，以实际工具要求为准。
- 路由、分包、组件注册和资源路径必须可解析；不用 Vue pages.json 代替 app.json。
- 网络请求与可复用业务逻辑脱离页面渲染；组件属性和事件契约清晰。
- 服务端校验权限、身份、金额和资源归属，不能信任客户端结论。
- 不在代码中放服务端秘密，平台能力、用户授权与后台配置从官方资料和实际环境核对。
- 只有明确使用 wx.cloud/CloudBase 才采用云开发规则，不要求所有小程序购买腾讯云额度。
- UI、tabBar、目录或服务提供商由项目需求决定，不机械采用外部 Skill 的默认设计。
- 开发授权不包含创建云资源、上传版本或发布；这些操作需独立授权。
- 验证编译、路由、组件、资源和主要交互；没有开发工具运行验证时明确报告。

## WX-02 工程蓝图与职责命名

以下以已经确认的 `miniprogramRoot` 为起点，不要求根目录必须叫 miniprogram。示意用 JS；TS 工程保持其真实源文件、配置和编译流程，不手改产物 JS。

```text
app.js
app.json
app.wxss
pages/order-list/
  index.js
  index.json
  index.wxml
  index.wxss
components/order-card/
  index.js
  index.json
  index.wxml
  index.wxss
api/order.js
api/request.js
assets/images/order-empty.png
```

同名配套是本包默认约定，不表示每个页面在所有环境必须有四个非空文件；逻辑/模板以及实际需要的配置与样式按工程要求提供。组件的声明与使用方注册不得遗漏。项目级 `project.config.json` 位于真实工程配置根，不机械放到上述源码根。

`services/order-service.js`、`domain/order.js`、`platform/storage.js`、`types/` 和跨页面状态模块按需要加入；测试位于既有测试根，不把测试夹具或秘密资源打进小程序包。分包目录及资源随真实配置选择，不能从其他子包随意引用私有文件；主包/普通分包/独立分包能力按实际平台核对。

| 角色/默认路径 | 名称例子 | 职责与限制 |
| --- | --- | --- |
| 页面 `pages/order-list` | `index` 同名文件 | 路由参数、Page 生命周期、视图状态、事件处理；不复制底层请求机制 |
| 组件 `components/order-card` | `index` 同名文件、注册名 `order-card` | properties/事件/局部状态；不访问父页面私有实现 |
| API 契约 `api` | `order.js` 中 `fetchOrders` | 端点、参数、响应处理；不调用页面 setData |
| 传输 `api` | `request.js` | 统一请求、鉴权协作、超时/失败；不包含具体页面导航逻辑 |
| 用例服务（需要时）`services` | `order-service.js` | 多端点业务编排；不持有 Page/Component 实例 |
| 纯业务规则（需要时）`domain` | `order.js` | 校验、转换、可测试计算；不操作视图或网络 |
| 平台适配（需要时）`platform` | `storage.js` | 存储/授权等能力的集中边界；不把服务端秘密存入客户端 |
| 静态资源 | `assets/images/order-empty.png` | 页面实际引用的资源；不承载业务代码或无用大文件 |

服务、API、平台适配的目录名可映射到既有 `services`、`utils/request` 等位置，但 utils 不能成为混合页面、认证、SQL 和业务规则的杂物箱。简单端点调用不强制增加转发 service，应用入口 `app.js` 也不是所有业务服务的全局容器。

| 对象 | 默认命名 | 注意 |
| --- | --- | --- |
| 目录/文件 | `order-list/index.js`、`order-service.js` | 页面和组件配套文件同一基名、引用大小写精确 |
| 方法/处理器 | `fetchOrders`、`handleRetry`、`submitOrder` | 平台生命周期保持规定名称，不为统一风格改名 |
| 状态/参数 | `isLoading`、`orderId`、`errorMessage` | 放入视图数据前确认用途与体积，不能暴露秘密 |
| TS 类型（使用时） | `Order`、`OrderQuery` | 类型声明不替代外部数据校验 |
| 自定义事件 | 无现有约定时 `selectorder`，载荷明确 | 保持发送名与绑定名一致，不能混用 Vue 事件语法 |
| 测试 | 沿用 `order.test.js` 等实际发现模式 | 测试放正确根目录并确认被运行 |

## WX-03 层间依赖与状态归属

默认调用 Page/业务组件 -> 可选 services -> api -> request/platform；纯展示组件通过 properties 和事件协作。允许省略没有职责的中间层，不允许 API 反向依赖页面并调用 `setData`，也不允许公共请求层 import 某个页面。

页面拥有视图状态，服务返回结果/错误，由页面判断请求是否仍有效再更新。请求对象、计时器等非视图资源留在适当的实例私有位置并清理，不整包塞进 data。共享状态采用已有方案与生命周期，不创建与页面状态失去同步的另一份订单列表。

请求参数中的用户 ID 不是可信身份；服务器验证登录、金额及资源归属。服务层命名正确不代表已经具备授权。新云函数或服务提供商并非本蓝图的隐含要求。

## WX-04 新增订单功能的创建顺序

1. 查证源码根、语言、基础库、分包、现有同类页面与请求层，填写角色到真实路径的映射。
2. 确定页面/组件配套文件、路由和注册名、输入/事件/状态、API 与错误契约，先列可观察验收。
3. 复用请求入口实现 API 和确有需要的业务逻辑；用现有测试方式验证转换、边界及失败。
4. 创建页面/组件，同步 `app.json` 路由或分包、实际 `usingComponents` 和资源引用，检查每个路径可解析。
5. 实现加载/空/失败/恢复、参数校验、旧请求失效、重复点击限制与生命周期清理。
6. 运行已接入检查，在开发者工具/真机验证受影响能力；分别记录验证层级，不自动上传或发布。

## WX-05 文件、状态与事件的具体约束

| 场景 | 正例 | 反例 |
| --- | --- | --- |
| 页面文件 | 必要配套文件名一致，路由指向可解析路径 | 新建页面但未注册路由，或漏掉实际需要的逻辑/组件声明 |
| 可复用组件 | 对外属性与事件明确，业务请求职责可定位 | 组件直接修改页面私有数据或依赖页面内部路径 |
| 视图状态 | 更新有必要变化的视图数据，明确异步结果归属 | 高频传送整个大对象、将服务端秘密塞入视图状态 |
| 路由与权限 | 校验路由参数，服务端检查资源归属 | 从 URL 取用户 ID 就当作已登录身份 |
| 生命周期 | 按实际平台生命周期清理所属监听和任务 | 每次进入页面累积计时器，旧请求影响新的页面状态 |
| 交互状态 | 区分加载、空、失败与授权状态 | 调用失败后统一显示“无数据” |

不固定基础库版本、包大小阈值和组件注册语法；这些应按目标环境及官方资料确认。原生工程的多端约束不能由 uni-app 的一次构建验证替代。

## WX-06 验证

目录检查需解析真实 `miniprogramRoot`，再核对路由、分包、组件注册、资源和大小写；不要只寻找一个固定 pages 文件夹。依赖检查如采用，覆盖实际别名/构建转换范围；平台特有路径不由普通 Node import 检查替代。

按真实脚本运行纯逻辑、类型与静态检查，开发者工具检查页面可访问、组件渲染、失败恢复与生命周期，真机验证平台相关能力。未接入的命名/依赖门禁只能标为计划。本包没有可运行的原生微信演示，uni-app 微信构建不能冒充它。

配置结构参考 [微信官方示例工程配置](https://github.com/wechat-miniprogram/miniprogram-demo/blob/master/project.config.json) 与 [应用配置](https://github.com/wechat-miniprogram/miniprogram-demo/blob/master/miniprogram/app.json)；仅参考配置角色，不复制其 AppID、基础库版本、云开发或目录选择。

通用命名、测试与运行边界按需读取 [命名与设计](naming-design.md)、[测试](testing.md)、[配置与日志](configuration-logging.md)。

外部 [miniprogram-development](https://github.com/TencentCloudBase/skills/tree/main/skills/miniprogram-development) 可选。若采用它，保留实际引用的 sibling references/协议文件；本包的本地规范独立可用，不暗中依赖该 Skill、云服务或登录。
