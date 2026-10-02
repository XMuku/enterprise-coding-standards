# Java EE / Jakarta EE

仅在任务涉及传统容器、相关规范或明确迁移时读取。本规范不要求把旧应用自动现代化。

阅读索引：EE-01 环境、EE-02 工程与命名、EE-03 依赖、EE-04 创建顺序、EE-05 正反例、EE-06 验证。默认蓝图只在确认后采用，现有 EAR、多模块或传统部署结构优先。

## EE-01 容器与兼容性证据

- 下笔前确认目标容器、JDK、Servlet/JPA 等规范版本、WAR/JAR 形态及依赖由谁提供。
- Java 命名和包规则沿用项目；容器 API 命名空间必须与目标运行环境匹配。
- 分清 Spring、CDI、EJB 的注入、生命周期与事务，不混用组件模型。
- 迁移只改实际迁移的 Java EE API；javax.sql、javax.crypto 等 JDK 包不能批量替换。
- 修改依赖、部署描述文件、注解与容器配置需作为同一兼容性变更验证。
- 不擅自把 WAR 改成可执行 JAR，不把容器管理事务改成另一个体系。
- 不直接采用外部 Skill 示例中的版本号；从实际目标容器和官方兼容性资料确定版本。
- 编译只是一层验证；迁移需在目标容器验证部署、注入、鉴权、事务和相关接口。

## EE-02 工程蓝图与职责命名

以下是采用 Maven WAR 的示意，不是所有 Java EE 工程都必须如此组织。`rest` 与 `web` 是按实际协议选择的适配层；如果只提供 REST，不为凑目录添加 Servlet/JSP，反之亦然。

```text
pom.xml
src/main/java/com/example/order/
  rest/OrderResource.java
  dto/CreateOrderRequest.java
  dto/OrderResponse.java
  application/OrderService.java
  domain/Order.java
  persistence/OrderRepository.java
src/main/resources/
  META-INF/persistence.xml
src/main/webapp/
  WEB-INF/web.xml
src/test/java/com/example/order/
  application/OrderServiceTest.java
```

`persistence.xml` 仅在采用对应持久化单元配置时保留，`web.xml` 是否需要及所在部署模块由实际版本和配置决定；不为使用注解的应用机械添加描述符。JSP/模板如采用，可放既有受控视图目录（如 `WEB-INF/views/order/`），不暴露本不应直接访问的模板。Gradle、自定义目录和 EAR 的 Web/EJB/共享契约模块按真实构建映射，不重建 Maven 布局。

| 角色/默认路径 | 名称例子 | 负责与限制 |
| --- | --- | --- |
| REST 入口 `order/rest` | `OrderResource` | 协议输入输出、调用用例；不存储请求级共享状态或写 SQL |
| Servlet 入口 `order/web`（使用时） | `OrderServlet` | 请求响应、视图转发；不用实例字段保存当前用户 |
| 应用服务 `order/application` | `OrderService` | 用例、事务与授权协作；生命周期由已选 CDI/EJB 等模型决定 |
| 领域 `order/domain` | `Order`、`OrderStatus` | 业务规则与状态语义；不依赖 Servlet 或 REST 资源类 |
| 持久化 `order/persistence` | `OrderRepository`、既有 `OrderDao` | 查询存储及资源协作；不返回 HTTP Response |
| 边界 DTO `order/dto` | `CreateOrderRequest`、`OrderResponse` | 外部契约；不注入服务或直接暴露实体关联图 |
| 协议异常映射（使用时）既有 `rest` | `OrderExceptionMapper` | 将失败映射为既有协议契约；不吞掉失败变成成功 |
| 部署/资源配置 | 既有描述符和 JNDI 引用名 | 与容器及模块匹配；不复制个人服务器路径或密码 |

Java 包名全小写；类/接口 PascalCase，方法与字段 camelCase，常量 UPPER_SNAKE_CASE。默认方法 `createOrder`、`findOrderById`，字段 `orderId`、`quantity`、`timeoutMillis`；缺失/金额/时间语义另行确认。测试沿用实际发现规则，不仅创建一个带 Test 字样的文件。

REST 的 `OrderResource`/Servlet 的 `OrderServlet` 是协议入口，不等于必须提供同名 Java interface。EJB 的本地/远程视图或其他公开服务接口仅在组件契约实际需要时创建，名称和实现关系沿用项目。不能凭接口文件存在就声称具备远程调用能力。

## EE-03 层间依赖与资源归属

默认业务调用 `rest/web -> application -> persistence`；领域规则与数据契约由适配层使用，不能反向依赖入口。已有领域端口模式由基础设施实现端口，不把领域改为依赖存储实现。

同一应用中的跨模块访问通过已声明契约；部署模块装配不等于允许所有包互相 import。持久层不引用 HTTP 请求，公共契约包不反向依赖 WAR 内部。不要为一个功能创建共享 API JAR 或远程接口，除非确有消费者与部署需要。

采用 CDI/EJB/JPA 时分别确认作用域、事务和并发约束；实体管理器、连接、线程和认证上下文按照容器管理规则使用。不要通过 `new OrderService()` 绕过实际依赖的拦截/注入，也不要套用 Spring 单例语义解释所有容器组件。

## EE-04 新增功能的创建顺序

1. 确认目标容器/API、构建与部署模块、已用组件模型，找到同类入口和服务。
2. 在项目画像中确定真实角色路径、类型后缀和源码依赖方向；选择 REST 或 Servlet 入口，不双建无用适配层。
3. 固定输入、输出、错误、身份来源、事务与资源所有权，建立受影响验收用例。
4. 在既有组件模型内实现服务与存储，补入口/DTO；继承或接口须有明确契约理由。
5. 按需要同步注册、描述符、资源名、依赖范围与打包配置，检查 API 命名空间没有混入不兼容版本。
6. 编译/打包后在隔离目标容器验证受影响能力；无容器只报告已验证部分，不自动部署生产。

## EE-05 创建和修改时的具体判断

| 对象 | 正例 | 反例 |
| --- | --- | --- |
| 容器 API 依赖 | 按实际服务器与构建约定决定由容器提供的 API | 把不匹配的 API 与容器实现都打进 WAR |
| Servlet/共享组件 | 请求局部状态与实例共享状态分离 | 用实例字段保存当前请求或用户 |
| 注入与事务 | 沿用项目已确认的组件生命周期及事务模型 | 看到注解就混用 Spring/CDI/EJB 生命周期假设 |
| 配置与资源 | 使用项目已有 JNDI、配置和托管资源 | 把个人连接地址、密码和未管理线程写进应用 |
| 命名空间迁移 | 按目标规范逐项核对 imports、依赖及部署配置 | 全局字符串替换所有 javax 为 jakarta |

上表不要求引入任何一种容器能力，具体并发与托管限制须按实际组件类型和容器版本查证。字段与接口命名见 [命名与设计](naming-design.md)；涉及数据库读写时补读 [数据访问](data-access.md)。

## EE-06 验证

验证至少覆盖受影响组件的加载与实际调用；缺少目标容器环境时注明未验证，不把本机编译通过写成部署兼容。额外核对打包内容、容器提供依赖未被重复错误装入、注册/注入可生效、权限拒绝及失败回滚。命名与架构检查按真实模块映射，不用 Spring 示例的通过结果替代 EE 环境。

布局和打包机制参考 [Jakarta EE Web 应用教程](https://jakarta.ee/learn/docs/jakartaee-tutorial/current/web/webapp/webapp.html)；本文各层名称是可采用的本包规则，不意味着目标服务器支持教程中的全部能力或必须升级。

明确迁移时可参考 [javax-to-jakarta-migration](https://github.com/github/awesome-copilot/tree/main/skills/javax-to-jakarta-migration)，但无需每次读取；使用前确认其范围和版本示例，不以扫描到 javax 为迁移授权。
