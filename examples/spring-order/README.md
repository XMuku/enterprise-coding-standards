# Spring MVC Order API

JDK 17+（本版本框架兼容至 25）、Maven 3.6.3+。版本固定在 [pom.xml](pom.xml)：Spring Boot 3.5.16、Checkstyle Maven Plugin 3.6.0、ArchUnit 1.5.1。范围仅为演示，不代表推荐业务项目升级到这些版本。[Spring 系统要求](https://docs.spring.io/spring-boot/3.5/system-requirements.html)

在本目录执行：

```shell
mvn verify
mvn spring-boot:run
```

默认仅监听 `127.0.0.1:8080`，Ctrl+C 结束；端口已占用时通过 `-Dspring-boot.run.arguments=--server.port=8081` 覆盖。PowerShell 示例：

```powershell
$order = Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8080/api/orders -ContentType application/json -Body '{"productName":"Notebook","quantity":2}'
Invoke-RestMethod -Uri ("http://127.0.0.1:8080/api/orders/" + $order.orderId)
```

POST 成功返回 201；GET 成功返回 200。JSON 为 `orderId`、`productName`、`quantity`。名称不能为空且最多 80 个字符；数量是 1-99 的整数。非法输入返回 400 / `VALIDATION_ERROR`；不存在的 ID 返回 404 / `ORDER_NOT_FOUND`。创建时去除名称首尾空白。

## 编码前已经确定的边界

- [AGENTS.md](AGENTS.md) 先确定包、层次、命名与返回契约；不是写完后才附上的报告。
- `web` 处理协议和 DTO；`application` 处理用例；`persistence` 提供内存保存；`model` 表达订单数据。
- [OrderService](src/main/java/com/example/order/application/OrderService.java) 是简单单实现类，不为目录整齐生成 `IOrderService` / `OrderServiceImpl`。
- [ArchitectureTest](src/test/java/com/example/order/ArchitectureTest.java) 同时确认真实包非空，并禁止 Web 直接访问 persistence、内层反向依赖 Web。
- [OrderHttpTest](src/test/java/com/example/order/OrderHttpTest.java) 启动随机端口并发真实 HTTP 请求，不把 Controller 单元测试冒充网络验证。

`mvn verify` 运行命名检查和 7 项基线测试；后来新增的功能会增加测试数。报告在 `target/surefire-reports/`。命名插件的默认底层 Checkstyle 由插件管理，不能随意替换为未经验证的大版本。[Checkstyle Maven 插件](https://maven.apache.org/plugins/maven-checkstyle-plugin/)、[ArchUnit](https://www.archunit.org/userguide/html/000_Index.html)

## 刻意没有提供

没有登录鉴权、数据库事务、持久化、幂等键、多租户、库存扣减或部署模板。重启后订单丢失；内存数据没有生产级容量控制。它只能演示本页列出的规则，不可作为生产订单服务直接上线。
