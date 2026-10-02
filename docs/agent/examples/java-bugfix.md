# Java 修复规格填写示例

这是 [修复模板](../../../templates/spec/bugfix-spec.md) 的虚构回归场景：假设在一个已授权的隔离副本中，未知订单被错误映射成 HTTP 200。实际本仓库 OrderController 当前返回 404；本例不指控现有代码存在缺陷，不注入错误、不运行或修改业务代码。

## 缺陷、事实与假设

预期沿用示例契约：不存在的 orderId 返回 404 与 code=ORDER_NOT_FOUND。假设回归副本将空结果返回成功。输入为一个未创建的字符串 ID；安全复现仅使用本地隔离内存应用，没有生产数据或外部服务。

当前事实：[示例规则](../../../examples/spring-order/AGENTS.md) 与 OrderController 的 orElseGet 路径规定 404。假设根因是回归副本的 HTTP 缺失映射被改错；尚未读取该副本，所以根因/复现均待验证，不能声称“已复现”。本例状态为待复现，风险 standard。

## AC 与最小方案

| AC | 输入/动作 | 预期行为 | 验证位置与 ID |
| --- | --- | --- | --- |
| AC-01 | 未知 ID 查询 | 404，code=ORDER_NOT_FOUND，不能是空成功 | 新增 MissingOrderRegressionTest；FIX-01 |
| AC-02 | 已存在 ID 查询 | 200，旧响应字段与内容保持 | 新回归及既有 HTTP 测试；FIX-01 |
| AC-03 | 合法/非法创建订单 | 201 或既有 400/VALIDATION_ERROR | 既有测试继续执行；FIX-01 |

拟修改范围是隔离副本的 `src/main/java/com/example/order/web/OrderController.java`，拟新增 `src/test/java/com/example/order/MissingOrderRegressionTest.java`；路径相对实际副本项目根。复用 OrderService.findOrder、ApiError 与原包边界。不加 BaseController、新异常体系、Service 接口、数据库或框架升级；既有规则/检查/测试/用户文件保护不动。

公开错误 contract 不变，orderId 字符串含义不变，无新增字段/迁移/事务/授权逻辑，因此这些设计项不适用；不是测试环境不足导致不适用。若读取副本后发现是授权或数据根因，回到风险与方案确认，不能只在 Controller 遮盖症状。

## 红绿与结果记录

| ID | 实施后实际动作 | 当前状态 |
| --- | --- | --- |
| FIX-01 | 先在副本执行真实 mvn verify 确认新回归有效失败，修复后再次执行并记录旧/新测试数量、退出码与快照 | not-run：没有该回归副本，未创建测试/修复 |
| FIX-02 | self 核查最小差异、旧 API、保护文件和无空成功 | not-run：未产生代码差异 |

“红灯”必须是测试发现业务错误，不是编译错误、零测试或人为永远失败的断言。实际无法安全复现时保留待复现/阻断和人工步骤，不虚构通过。完成后报告真实根因、修复影响、复现与回归证据、遗留风险；只准备提交建议，不自动推送或部署。
