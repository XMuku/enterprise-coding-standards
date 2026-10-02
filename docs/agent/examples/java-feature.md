# Java 功能规格填写示例

这是 [功能模板](../../../templates/spec/feature-spec.md) 的已填写只读走查，不实施功能、不宣称测试通过。任务取自既有 [Order Summary 评测](../../../evals/tasks/java-summary.md)，项目事实来自 [Spring 示例](../../../examples/spring-order/README.md)、其 AGENTS、源码和 pom。不是生产功能方案，也不把评测预期当已实现行为。

## 已确认范围

新增 `GET /api/orders/{orderId}/summary`，不改旧接口/依赖/检查配置/既有测试。保留任务规定的用户文件。采用真实 `com.example.order`、`web -> application -> persistence/model`；内存存储，无认证、租户和数据库事务，不新增这些能力。版本沿用 pom，不升级。

风险 standard：新增 HTTP 契约，需要序列化、错误和旧接口回归。本例只有文档授权，编码及检查均 `not-run`。

## AC 与契约

| AC | 前提/请求 | 可观察结果 | 拟新增回归与检查 |
| --- | --- | --- | --- |
| AC-01 | 已创建 quantity=1 的订单，查询 summary | 200；JSON 恰好 orderId、quantity、kind；kind=single | SummaryRegressionTest 的真实 HTTP 断言；SUM-01 |
| AC-02 | 已创建 quantity>1 的订单，查询 summary | 200；kind=multiple，字段集合不多不少 | 同一新增测试覆盖合法边界；SUM-01 |
| AC-03 | 未知 orderId | 404，code=ORDER_NOT_FOUND | 拒绝/错误契约断言；SUM-01 |
| AC-04 | 调用既有创建/查询 | 既有 JSON、状态和校验语义保持 | 既有测试不修改并继续执行；SUM-01 |

契约以项目源码与本任务 AC 为权威，不额外引入 OpenAPI 生成器。orderId 沿用字符串；quantity 为 1-99 整数计数、非 null；kind 对外字符串仅 single/multiple，无敏感数据。新增接口没有修改旧 JSON，但仍检查严格消费者和已知路由；业务采用若有鉴权，不能拿此无认证示例豁免授权。

## 首次写入前的文件决定

以下为实施时的拟变更，不是已经创建的文件。路径相对 `examples/spring-order/`。

| 路径/对象 | 决定 |
| --- | --- |
| `src/main/java/com/example/order/web/OrderController.java` | 新增 summary 路由，复用 application 服务，不访问 OrderStore |
| `src/main/java/com/example/order/web/OrderSummaryResponse.java` | 新增响应 DTO，严格字段集合；kind 作为只读响应派生映射，不承担查询/授权 |
| `application/OrderService` | 复用现有 findOrder，不新增空服务、接口或 Impl；若派生成为真实业务规则再调整服务设计 |
| `persistence/OrderStore`、`model/Order` | 复用现有，保持不变；没有持久化变化不创建 Mapper/迁移 |
| `src/test/java/com/example/order/SummaryRegressionTest.java` | 新增，沿用既有真实 HTTP 测试模式与发现配置，不改既有测试 |

包全小写，DTO PascalCase，方法/字段 camelCase，使用实际注册与测试路径。不建 `controller/service/dao` 第二套目录、`IOrderService` 或 BaseController。没有接口/继承需求；无金额/时间字段，不添加无关列。

## 验证与意图复核

| ID | 相对工作目录与真实命令/审查 | 预期覆盖 | 当前结果 |
| --- | --- | --- | --- |
| SUM-01 | `examples/spring-order`，`mvn verify`，来自示例 README/pom | 既有测试+新增回归、Checkstyle/架构扫描非空；实际数量运行后记录 | not-run：本例不实施、不运行 |
| SUM-02 | self 差异/契约审查 | 只改授权文件，旧规则/配置/测试/用户文件不变，Web 无持久层依赖 | not-run：未产生代码差异 |

首次源码写入前须给出上表决定。后续实际实施后逐项核对 AC、字段集合、错误与保护文件，再记录命令版本/退出码/数量和源码快照。本次不能把文档走查或过去的示例 CI 写成 SUM-01 pass。
