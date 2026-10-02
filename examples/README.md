# 可运行示例

两个独立的小项目，展示“编码前规则入口 + 真实代码 + 可执行检查”。它们不是生产脚手架，也不是所有技术栈的统一架构。

| 示例 | 行为 | 实际检查入口 |
| --- | --- | --- |
| [Spring MVC 订单 API](spring-order/README.md) | 创建订单、按 ID 查询、输入拒绝、稳定错误码 | `mvn verify`：Checkstyle、ArchUnit、单元测试、随机端口 HTTP 测试 |
| [uni-app 订单页](uni-order/README.md) | 本地 mock 列表、加载/失败/空状态、可复用卡片 | `npm run check`：ESLint、Vue/TS 类型检查、单元测试、H5 和微信端构建 |

两者都只在本机运行，不需要 Scenario、模型 API 或云数据库额度。前端有意使用 mock adapter，**没有连接 Java 示例，不是端到端全栈应用**。Java EE 容器和原生微信工程目前仍只有规范，没有新增可运行样板。

## 一次运行全部门禁

准备 JDK 17-25、Maven 3.6.3+、Node.js 22.13+（22 系列）或 24+ 和 npm；首次安装需要访问 Maven Central/npm registry。版本约束以各示例构建文件和锁文件为准。

在本仓库根目录执行：

```shell
npm --prefix examples/uni-order ci --cache .tmp/npm-cache
npm run check:examples
npm run test:negative
```

根目录 `npm run check` 仍然不安装第三方依赖，也不会运行 Maven 或前端构建。示例依赖只安装到示例目录；脚本调用的 npm/Maven 缓存、日志和隔离副本均在仓库 `.tmp/`。自行直接执行示例里的命令时，缓存位置服从本机工具设置，可以显式传 `--cache` / `-Dmaven.repo.local`。

`check:examples` 从干净 Java 编译产物开始验证两个正例。`test:negative` 先要求正例通过，再逐一在新副本中加入违规源码；**非零退出码和预期规则标记必须同时出现**。依赖下载失败、命令缺失或超时不能当作“成功拦截”。运行结束输出证据目录和 `results.json`，不污染正例。

反例原件：[命名](negative/BadName.java.txt)、[跨层访问](negative/LeakyController.java.txt)、[any](negative/unsafe-order.ts.txt)、[错误字段类型](negative/invalid-order.ts.txt)。这些 `.txt` 文件故意不放在正例编译路径。

## 怎么交给 Agent

复制一个示例到自己的业务工作区后，先阅读它的 `AGENTS.md`，再让 Agent 读取本仓库 `SKILL.md` 并使用开发模式。更接近真实使用的任务见 [Agent 评测](../evals/README.md)。不要把示例的 `com.example`、内存存储、mock 数据、错误格式机械复制为公司的全局规定。

阅读顺序：本页选工程 → 工程 README 运行 → [关键正反例](../docs/rule-examples.md) 理解门禁 → [评测说明](../evals/README.md) 验证 Agent。普通开发任务不需要加载整套示例与评测材料。
