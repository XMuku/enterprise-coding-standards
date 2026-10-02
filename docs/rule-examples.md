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
