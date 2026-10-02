# 关键规则正反例

示例以已确认的项目规则为前提。先判断归属、名字、契约和依赖方向，再生成代码；检查只覆盖能机械判断的部分，不把默认偏好推广为企业统一法律。

## 可以实际运行的四组

在根目录准备示例依赖后执行 `npm run test:negative`。正例必须先全部通过，每组反例独立注入副本；完整使用方法见 [可运行示例](../examples/README.md)。

| 规则与前置判断 | 正例 | 故意违规的反例 | 实际拦截 |
| --- | --- | --- | --- |
| NAME-01：字段属于 Java 对象而非外部协议，采用本项目 camelCase | `private final OrderStore orderStore;` | [BadName](../examples/negative/BadName.java.txt)：`Order_Name` | Checkstyle `MemberName` |
| Java/Spring：Controller 只访问应用层 | [OrderController](../examples/spring-order/src/main/java/com/example/order/web/OrderController.java) 依赖 OrderService | [LeakyController](../examples/negative/LeakyController.java.txt) 直接依赖 OrderStore | ArchUnit `WEB_NO_PERSISTENCE` |
| 前端类型边界：已知 Order 不使用无约束类型 | [Order](../examples/uni-order/src/types/order.ts) 和强类型 props | [unsafeOrder](../examples/negative/unsafe-order.ts.txt) 使用 `any` | ESLint `no-explicit-any` |
| NAME-02/API-01：quantity 是整数数量，不是展示字符串 | `quantity: 2` | [invalidOrder](../examples/negative/invalid-order.ts.txt)：`quantity: 'two'` | `vue-tsc` 类型不兼容 |

这些检查只能证明特定错误被抓住。camelCase 不保证字段有好名字；TypeScript number 不保证整数，所以还有运行时数量检查和边界测试；ArchUnit 只检查本示例声明的包关系。

## 需要行为测试或审查的四组

| 规则 | 写代码前的决定与正例 | 反例 | 如何核验 |
| --- | --- | --- | --- |
| REPO-01：找已有业务归属 | 新订单行为留在 `com.example.order`；前端业务过滤放 `src/domain/` | 同时新建 `service/` 和 `domain-service/` 平行体系 | 差异审查、新调用关系；不能仅统计目录名 |
| TYPE-01/02：抽象必须有真实目的 | 小型单实现 OrderService 保持普通类；外部系统边界才考虑接口 | 自动生成 IOrderService/Impl；Controller 基类持有共享登录态 | 检查调用者、状态归属和扩展需求；不宣称有自动门禁 |
| API-01/TEST-02：拒绝路径提前约定 | 数量 0 返回 400；未知订单返回 404；测试真实状态码 | 捕获所有异常返回 HTTP 200 或把 0 静默改成 1 | [HTTP 测试](../examples/spring-order/src/test/java/com/example/order/OrderHttpTest.java)；不能只检查返回消息 |
| CHANGE/TEST：不能改门槛伪造通过 | 修正业务代码，增加新回归测试，保留旧测试和用户笔记 | 删除架构测试、改 npm check、覆盖无关文件 | [Agent 评测](../evals/README.md) 的受保护文件哈希 + 独立验收 |

最后两组不需要通过更多文档来证明，而应通过真实执行和文件差异取证。对于权限、数据库事务、Java EE 生命周期、微信真机能力，这两份演示没有相应运行证据；参照专项规范在真实项目补齐。

## 工程蓝图的写前正反例

这组为设计走查案例，**没有新增可执行反例或独立 Agent 评测成绩**。规则编号用于定位当前专项章节，实际门禁按 [接入对照](rules-and-checks.md) 配置。

| 场景 | 首次写入前应决定的正例 | 反例 | 验收依据 |
| --- | --- | --- | --- |
| SPRING-02 既有目录 | HTTP/用例/存储映射为既有 web/application/persistence，在原处扩展 | 按新模板再建 controller/service/mapper | 新文件路径、画像和 imports；不迁移可运行示例来凑默认名 |
| SPRING-03 语言接口 | OrderController 是 HTTP 入口；OrderService 暂无替换契约，不建接口 | 把“新增接口层”理解为每个类自动生成 I 类型与 Impl | 服务调用者和实际接口需要，不以数量评分 |
| EE-02 容器入口 | 按既有 REST 增 OrderResource，复用组件模型和部署模块 | 顺便引入 Spring Controller、Servlet 和新共享 JAR | 打包差异、组件依赖与受影响容器测试 |
| UNI-02 API 与服务 | 单次查询复用 api/order；多 API 业务编排才抽 services | 每个 API 机械包一层 service，再创建同名 store | 责任与调用链是否唯一，代码中是否有真实编排 |
| UNI-03 状态边界 | 页面/组合逻辑拥有状态，API 返回结果，由调用方处理展示 | request.ts import 订单页面或 store 形成循环 | 导入图、竞态/失败测试，不能只看目录 |
| WX-02 页面注册 | 按真实源码根创建必要配套，在对应分包注册并验证访问 | 在错误根目录建四个空文件，未改 app.json | 配置解析、开发者工具打开页面的证据 |
| WX-03 API 边界 | API 不持有 Page，页面检查请求有效性后 setData | 通用 API 接收页面实例并从内部改私有状态 | 引用关系与离开页面后旧响应的行为测试 |

一个合格的写前简述可以是：“沿用订单域已有 web/application/persistence；新增请求 DTO，复用 OrderService 和 Mapper；前端复用 api/request，在 pages.json 注册订单页；不建空服务接口或全局 store；用接口拒绝路径及页面失败恢复验证。”这不是让 Agent 复制固定句式，实际路径、决定和执行结果必须一致。
