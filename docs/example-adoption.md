# 示例：Spring MVC 后端与 uni-app 前端

这是虚构项目的接入演示，不是可运行的脚手架，也不是对任何现有项目的检测结果。实际版本、包名前缀和命令必须从目标项目读取。

如果需要直接运行代码，使用独立的 [可运行示例](../examples/README.md)；它们的验证状态不能替代本文假设项目的采用与测试。

## 1. 先找项目证据

假设读取后确认：后端位于 `backend/`，使用 Maven Wrapper、Spring MVC 和 MyBatis；前端位于 `frontend/`，使用 Vue、TypeScript 和 uni-app；已有 `order` 业务模块和统一请求封装。

那么只选择 `java-spring` 与 `uni-app`，不读取 Java EE 迁移流程，不安装 JPA，也不把原生微信小程序的 `app.json` 规则套到此工程。

画像应记录实际构建文件、依赖版本、源码根、项目正式规则和检查命令。这个演示没有真实构建文件，因此不能声称 `mvnw verify`、`npm run lint` 等命令在该项目存在或已通过。

## 2. 导出与合并

先预览 `prepare-project.mjs --project <绝对路径> --stack java-spring --stack uni-app`，核对后加 `--apply` 导出草稿。把画像中的“待确认源码目录”换成真实目录；确认关键决策，合并候选入口到项目已有规则。

这里的前端/后端名称只是示例，不由脚本强制创建。候选模板不自动生效；如果项目本来有规则，应合并而不是删除后重建。

### 填好的角色映射示意

继续上述假设：确认后端既有 `web/application/persistence`，前端既有 `src/pages` 和 `src/api`。这里所有路径与类型仍是虚构示意，不是本包检测出来的项目事实。真实采用时必须补上证据文件。

| 角色 | 相对项目的路径 | 命名/依赖选择 | 配套核对 |
| --- | --- | --- | --- |
| 后端 HTTP 入口 | `backend/src/main/java/com/example/order/web/` | `OrderController` 依赖 `application`，不访问 `persistence` | 实际组件扫描、HTTP 契约测试 |
| 后端用例 | `backend/src/main/java/com/example/order/application/` | `OrderService`；当前单实现不抽接口，访问本域持久化 | 用例测试、事务调用路径 |
| 后端持久化 | `backend/src/main/java/com/example/order/persistence/` | `OrderMapper`；不新增 JPA Repository，不反向依赖 web | Mapper 注册、SQL/数据库测试 |
| 后端协议 DTO | `backend/src/main/java/com/example/order/web/` | 沿用 `CreateOrderRequest`、`OrderResponse` 的既有位置 | 字段允许集、序列化测试 |
| 前端页面 | `frontend/src/pages/order-create/` | `index.vue` 组合状态、调用 API | `pages.json`、加载/失败/提交交互 |
| 前端 API | `frontend/src/api/` | `order.ts` 的 `createOrder` 复用 `request.ts`，不访问页面 | 请求/响应、错误契约 |
| 前端类型 | `frontend/src/types/` | `order.ts` 的请求/结果类型，不 import 页面或 API 实现 | 类型与运行时边界检查 |

此处保留后端 DTO 在 web 的既有选择，不因新版默认 dto/request 而搬家。前端单次创建调用没有独立用例编排，因此不建 `services/order-service.ts`；页面私有状态也不提升到全局 store。源文件、测试与配置的真实映射均记录在画像，下面的任务直接复用。

新建且无既定架构的项目则可选择专项默认：后端 `order/controller`、`service`、选定的 `mapper` 或 `repository`、`dto/request`、`dto/response`；先确定包根和需要哪些层，再创建实际文件。不能把“旧项目沿用映射”理解为“新项目永远没有默认值”。

## 3. 新功能：创建订单

开发前可简述下面这些决定，不必生成长规划文档：

| 对象 | 示例决定 | 避免的问题 |
| --- | --- | --- |
| 所属模块 | 沿用现有 `order` 业务模块 | 同时新建另一套 `orders` 平行目录 |
| 包与类型 | 在现有包下添加 `CreateOrderRequest`、`OrderResponse` | Java 包使用 `Order-Module`；公共类型与文件不同名 |
| Service | 扩展现有 `OrderService`，除非存在实际替换需求不新增接口 | 无用途的 `IOrderService` / `OrderServiceImpl` 对 |
| 持久化 | 沿用 MyBatis 的 Mapper 与已有迁移机制 | 因参考例子新增 JPA Repository 或自动改库 |
| 字段 | `orderId`、`quantity` 等领域名称，沿用 JSON 契约 | 含糊的 `data1`、`flag` 或破坏客户端兼容性 |
| 数量与金额 | 明确正整数范围、价格来源、金额精度和币种 | 客户端提交任意价格，服务端直接信任 |
| 权限与事务 | 服务端确认身份/资源归属；定义一致性和重复提交行为 | Controller 直接写库、事务边界不明、重复扣款 |
| 前端页面 | 沿用真实路由与统一请求入口 | 重造网络层；仅 H5 通过就宣称小程序可用 |
| 可复用组件 | 确有复用需求再建 `OrderCard.vue` | 只为规范“完整”建立空组件和空目录 |

若现有项目使用 `CreateOrderDTO`、DDD 或其他清晰命名，以正式约定为准，并在画像中记录。此表不是公开 API 的最终合同，金额、幂等和错误码等仍需与实际需求一致。

## 4. 实现与验证

按上述归属实现代码与受影响测试。接口变更测有效输入、边界输入、未授权和重复请求；事务变更测失败回滚；前端核对页面路径、类型及实际目标端。只执行从工程查证的命令。

结果应像这样区分事实，而不是写“已符合企业规范”：

```text
归属与命名：沿用项目已确认约定。
功能与测试：报告本次实际改动和真实测试结果。
静态/架构检查：逐项写已验证、已配置未验证、未接入或不适用。
平台验证：明确实际验证了哪个目标端，未验证的端单列。
```

本示例没有执行任何业务测试。想用工具阻止反向依赖、错误命名等违规，还需在该项目适配 [检查流程](../references/checks.md)。

## 5. 后续日常使用

项目入口与画像已就绪后，只需给业务需求。Agent 先读入口，再读受影响目录对应规则，不重复加载 README、贡献文档、发布清单和所有上游网页。

升级规范时保留本地调整，以差异方式合并；导出工具不是覆盖更新器。
