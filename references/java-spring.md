# Java / Spring Boot / Spring MVC

先确认 JDK、Spring 版本、Maven/Gradle、MVC/响应式形态、ORM 和原有包结构；不因示例改用 JPA。

阅读索引：SPRING-01 包与类型、SPRING-02 工程蓝图、SPRING-03 分层与依赖、SPRING-04 运行边界、SPRING-05 创建顺序、SPRING-06 验证。这里只定义本包可采用的默认规则，不宣称 Spring 强制此目录。

## SPRING-01 创建包与类型前

- 无既定结构时，按业务域组织顶层包，在业务域内区分协议适配、用例、模型和持久化；既有 DDD、六边形或多模块结构优先。
- Java 包段全小写，路径匹配 package；顶层公共类型与文件同名。Java 包名不用 kebab-case。
- 类型 PascalCase，方法/参数/字段 camelCase，常量和枚举常量 UPPER_SNAKE_CASE。
- 默认职责名：OrderController、OrderService；持久层依 ORM 选 OrderMapper 或 OrderRepository。
- 请求默认 CreateOrderRequest，响应 OrderResponse；实体后缀和 DO/DTO/VO 体系沿用项目并写清边界。
- 不强制每个 Service 有接口；有替换实现、公开跨模块契约或真实扩展点时再创建。实现类优先表达差异；已有 Impl 模式可保留。
- 优先组合。继承需真实可替代关系；禁止万能 BaseService/BaseController；覆写用 @Override，字段保持最小可见性。

命名细节、访问器与 JSON 名称的区别、正反例见 [命名与设计](naming-design.md)。公共基类禁令针对万能职责混合，不禁止框架明确要求且契约清晰的扩展基类。

## SPRING-02 工程蓝图与职责命名

无既定架构时，默认选择“业务域内分层”。先把业务模块根、角色路径和后缀记录进项目画像；确认后，同一模块的新文件遵守该映射，不临时另造同义目录。以下是 Maven 风格的订单模块示意，com.example 只是演示前缀，持久层示意选 Mapper；不能据此要求安装 MyBatis。

```text
src/main/java/com/example/
  Application.java
  order/
    controller/OrderController.java
    service/OrderService.java
    mapper/OrderMapper.java
    model/Order.java
    dto/request/CreateOrderRequest.java
    dto/response/OrderResponse.java
src/main/resources/
  application.yml
src/test/java/com/example/order/
  controller/OrderControllerTest.java
  service/OrderServiceTest.java
```

只创建本次需要的文件。配置可沿用 properties 或现有机制，不生成含真实连接信息的配置。Mapper XML、数据库迁移、配置类、转换器和异常类型按实际工具与职责增加，不创建空壳。启动类位置与扫描范围需覆盖实际组件；现有多模块项目不移动启动类。

| 角色/默认路径 | 名称例子 | 负责 | 不负责 |
| --- | --- | --- | --- |
| HTTP 接口层 `order/controller` | `OrderController` | 协议参数、入口校验、调用用例、响应映射 | SQL、事务编排、内部持久化细节 |
| 用例服务 `order/service` | `OrderService`、复杂场景 `CreateOrderService` | 业务流程、授权协作、事务边界 | Servlet 请求对象、共享当前用户状态 |
| 数据访问 `order/mapper` 或 `order/repository` | `OrderMapper` 或 `OrderRepository` | 查询与存储、数据库映射 | HTTP 响应、页面逻辑、反向调用 Controller |
| 内部模型 `order/model` | `Order`、按既有体系 `OrderEntity` | 明确内部数据或领域语义 | 无边界地充当外部请求与响应 |
| 请求/响应 `order/dto/request`、`order/dto/response` | `CreateOrderRequest`、`OrderResponse` | 输入允许集、输出契约 | 数据访问、注入服务、暴露秘密字段 |
| 转换器（确需时）`order/converter` | `OrderConverter` | 有实际复杂度的对象转换 | 调库补数据、校验全部业务、纯转发空壳 |
| 本域异常（确需时）`order/exception` | `OrderNotFoundException` | 明确失败语义 | 吞掉所有异常、存储 HTTP 上下文 |
| 配置（确需时）既有 `config` | `OrderClientConfiguration` | 装配与外部参数绑定 | 业务流程、硬编码凭证 |

“接口层”默认指 HTTP Controller，**不是要求创建 Java interface**。若确有替换实现或跨模块契约，可用 `OrderService` 接口和表达差异的实现名；既有 `OrderServiceImpl` 可保留。不要同时生成两种同名职责实现、`IOrderService` 和另一套服务接口。

Mapper/Repository 依据现有 ORM 选择；没有需求时不同时增加。DDD 中领域 Repository 端口与基础设施实现可以并存，这是职责分离，不是重复存储层。内部模型在项目中代表实体、领域对象还是其他模型必须明确，复杂项目不把三者硬塞进一个类型。

| 对象 | 默认约定 | 避免 |
| --- | --- | --- |
| 包/文件 | 包段全小写，`OrderService.java` 与公共类型同名 | `order-service` Java 包、`OrderService2` |
| 方法 | `createOrder`、`findOrderById`、`listOrders`；缺失语义写入契约 | 用 `getData` 隐藏写操作或混淆未找到 |
| 字段/参数 | `orderId`、`quantity`、`timeoutMillis`、`createdAt`；时间类型/时区明确 | `flag1`、无单位 `timeout`、日志中的凭证 |
| 常量/枚举 | `MAX_PAGE_SIZE`、`PENDING_PAYMENT` | 把可变对象仅因 static final 就当不可变常量 |
| 测试 | `OrderServiceTest`；集成测试后缀沿用实际发现规则 | 新建 `OrderIT` 却没有配置执行它 |

已有 `web/application/persistence` 可分别映射 HTTP/用例/存储职责，本包可运行 Spring 示例使用这种布局；全局 `controller/order` 等既有结构也可沿用。目录文字不同不构成违规，另起一套平行体系才是风险。

## SPRING-03 分层与依赖

简单分层的业务调用方向为 `controller -> service -> mapper/repository`，DTO/模型和转换器作为明确的数据依赖，不是额外调用层。允许项目选择的服务输入/输出 DTO；若已有应用命令/结果模型，Web DTO 的转换留在适配边界。

禁止 `mapper -> controller`、`service -> controller`、DTO 依赖服务，以及通过工具类转调存储来规避边界。跨业务域调用走对方已声明的服务/契约，不直接访问对方私有 Mapper。`common` 只承载真实共享能力，不能反向依赖具体业务域。

DDD/六边形项目按其已确认的端口方向检查源码依赖：领域/应用定义的端口由基础设施实现，领域不 import 持久化实现。运行时调用方向不等于源码依赖方向；不得机械套用上面的简单分层箭头。

- 必需依赖使用构造器注入，依赖字段默认 private final；不新增字段式 @Autowired。
- Controller 处理协议、校验和调用；不直连数据库。Service 处理用例和事务；持久层不反向依赖 Web 层。
- Service 不暴露 HttpServletRequest/Response，也不保存请求级可变状态。
- API 使用明确 DTO，不直接返回 ORM Entity 或内部异常；统一校验与异常映射，沿用项目响应契约。
- 配置外部化，密钥不进代码或仓库；使用参数化日志，不拼接敏感值。
- 事务按一致性需要设边界，验证代理路径和回滚条件；同类自调用不等于触发新事务拦截。
- 网络调用和耗时工作不随意放入长事务；重试前先设计幂等、上限和退避。
- 禁止模块循环依赖，不用任意延迟注入掩盖边界问题。

## SPRING-04 状态、异常与集合

- 单例组件不使用字段保存当前用户、租户或上次请求内容；请求数据通过参数或项目已验证的上下文机制传递，并处理生命周期。
- 区分输入校验、业务拒绝与系统故障；沿用统一异常映射，不在每个 Controller 吞异常并返回空成功对象。
- 集合返回值的空/null 语义沿用契约；不为“防空”掩盖查询失败。外部可变集合是否复制或只读，按所有权决定。
- 有界线程池和异步任务需明确上下文、异常处理和关闭责任；不要自动创建新线程来绕过事务或延迟问题。
- 响应式项目不得机械套用阻塞 MVC 或线程本地假设；沿用其已选执行和事务模型。

| 场景 | 正例 | 反例 |
| --- | --- | --- |
| MVC 边界 | Controller 校验请求并调用用例 | Controller 拼 SQL、调用 Mapper 后自己补事务 |
| 依赖注入 | 必需依赖经构造器进入、保持明确职责 | 字段注入大量组件、靠延迟注入隐藏循环 |
| 错误处理 | 业务异常映射为既有错误契约 | catch Exception 后固定返回成功 |
| 请求状态 | 用户身份在受控边界获取并作为必要输入 | Service.currentUser 保存最后一次请求 |

表中正例是设计判断，不是保证行为正确的编译模板。持久化变更补读 [数据访问](data-access.md)，运行相关变更补读 [配置与日志](configuration-logging.md)。

## SPRING-05 新增订单功能的创建顺序

1. 找已有订单模块、相似接口及测试，确认画像中的真实包根、角色目录、Mapper/Repository 选择和接口策略。
2. 列出本次文件的相对路径、类型/方法名、输入输出、权限与错误；不需要的层写明复用对象，不生成占位。
3. 先固定 API 与用例契约及验收测试；只有持久化真的变化时才增加查询、映射和迁移文件。
4. 实现用例/内部规则及数据访问，再接入 Controller 和转换；顺序可适配既有测试驱动流程，但首次写入前须确定归属。
5. 同步组件/Mapper/实体的实际扫描、序列化、迁移及配置引用；不因目录名正确就假定注册生效。
6. 检查新增 imports 和跨模块调用，运行已接入的命名、架构、接口及受影响测试；记录缺口。

正例：既有 `web/application/persistence` 中增加 `application/CancelOrderService.java` 并复用统一异常映射。反例：另建 `controller/service/dao`，把取消订单 SQL 放进 Controller，再补空接口声称完成分层。

## SPRING-06 验证

使用项目 Wrapper 和真实构建脚本。验证受影响的单元/接口/集成测试；事务变更测失败回滚，权限变更测拒绝路径。按项目配置运行 Checkstyle 和架构测试，未接入的工具不能报为通过。

按 [测试规范](testing.md) 确认测试确实被发现，不能把 mock 数据库的单测当作事务与 SQL 已验证。

目录与类型命名可用项目化检查；ArchUnit 要把画像中的真实包映射进去，并确认扫描非空、最小违规样例确实失败。文件夹叫 service 并不证明承担服务职责。本包没有为任意包名自动生成这些门禁。

框架依据：[Spring Boot 代码组织](https://docs.spring.io/spring-boot/reference/using/structuring-your-code.html) 没有规定唯一布局；本文的分层名与类型后缀是治理默认值，而非官方要求。
