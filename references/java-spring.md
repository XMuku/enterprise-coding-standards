# Java / Spring Boot / Spring MVC

先确认 JDK、Spring 版本、Maven/Gradle、MVC/响应式形态、ORM 和原有包结构；不因示例改用 JPA。

## 创建包与类型前

- 无既定结构时，按业务域组织顶层包，在业务域内区分协议适配、用例、模型和持久化；既有 DDD、六边形或多模块结构优先。
- Java 包段全小写，路径匹配 package；顶层公共类型与文件同名。Java 包名不用 kebab-case。
- 类型 PascalCase，方法/参数/字段 camelCase，常量和枚举常量 UPPER_SNAKE_CASE。
- 默认职责名：OrderController、OrderService；持久层依 ORM 选 OrderMapper 或 OrderRepository。
- 请求默认 CreateOrderRequest，响应 OrderResponse；实体后缀和 DO/DTO/VO 体系沿用项目并写清边界。
- 不强制每个 Service 有接口；有替换实现、公开跨模块契约或真实扩展点时再创建。实现类优先表达差异；已有 Impl 模式可保留。
- 优先组合。继承需真实可替代关系；禁止万能 BaseService/BaseController；覆写用 @Override，字段保持最小可见性。

命名细节、访问器与 JSON 名称的区别、正反例见 [命名与设计](naming-design.md)。公共基类禁令针对万能职责混合，不禁止框架明确要求且契约清晰的扩展基类。

## 最小目录示例

以下仅适用于已经选择“业务域内分层”的 Maven 项目；com.example 是演示包名前缀，不能替换真实项目命名。文件只在需求用到时创建，不自动生成整棵目录。

```text
src/main/java/com/example/order/
  web/OrderController.java
  web/CreateOrderRequest.java
  web/OrderResponse.java
  application/OrderService.java
  persistence/OrderMapper.java
src/test/java/com/example/order/
  application/OrderServiceTest.java
```

项目已有 controller/service/mapper、DDD 或六边形布局时保留原选择。Repository 和 Mapper 不必同时存在；DTO 与实体的映射责任明确，不为一次赋值自动引入映射框架。

## 编码边界

- 必需依赖使用构造器注入，依赖字段默认 private final；不新增字段式 @Autowired。
- Controller 处理协议、校验和调用；不直连数据库。Service 处理用例和事务；持久层不反向依赖 Web 层。
- Service 不暴露 HttpServletRequest/Response，也不保存请求级可变状态。
- API 使用明确 DTO，不直接返回 ORM Entity 或内部异常；统一校验与异常映射，沿用项目响应契约。
- 配置外部化，密钥不进代码或仓库；使用参数化日志，不拼接敏感值。
- 事务按一致性需要设边界，验证代理路径和回滚条件；同类自调用不等于触发新事务拦截。
- 网络调用和耗时工作不随意放入长事务；重试前先设计幂等、上限和退避。
- 禁止模块循环依赖，不用任意延迟注入掩盖边界问题。

## 状态、异常与集合

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

## 验证

使用项目 Wrapper 和真实构建脚本。验证受影响的单元/接口/集成测试；事务变更测失败回滚，权限变更测拒绝路径。按项目配置运行 Checkstyle 和架构测试，未接入的工具不能报为通过。

按 [测试规范](testing.md) 确认测试确实被发现，不能把 mock 数据库的单测当作事务与 SQL 已验证。
