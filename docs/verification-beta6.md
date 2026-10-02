# 1.2.0-beta.6 工程蓝图验证

日期：2026-10-02。本版完善原四种技术栈的写前规则，不新增业务脚手架或平台 SDK，也不改动示例依赖、业务代码或评分器逻辑。

## 变更范围

- 四栈分别提供六节规则，明确目录树、角色/命名、依赖、状态/资源、创建顺序与验证；章节安排按各栈职责取舍。
- Skill、通用入口、项目画像、采用与开发提示词共同引用工程蓝图，角色映射确认后按需读取，不重复扫描全部来源。
- 采用示例展示既有 web/application/persistence 与前端 API 的映射；旧项目不迁移，新项目可以选择明确默认。
- 七组新增正反例为设计走查，检查对照是接入方案，不将其写成已经存在的自动门禁。
- 导出 CLI 参数和文件集合保持不变，所选四栈文档和画像随现有导出流程更新；未改动 HarmonyOS 专项或运行环境。

## 实际验证

| 检查 | 实际结果 | 范围与限制 |
| --- | --- | --- |
| `npm run check` | 114 个发行文件、59 个 Markdown 文件校验无错误；37 项测试通过，0 失败/跳过 | 规范包工具测试，不是业务项目验证 |
| 五栈 31 种非空组合 | 所选文件与链接自包含通过；参考文件内容与源文件一致，画像在映射替换前后的模板内容保持完整 | 证明导出携带规则，不证明规则被 Agent 遵守 |
| 官方 Skill 格式校验 | `Skill is valid!`，退出 0 | 不包含真实开发任务行为评测 |
| `git diff --check` | 退出 0 | 差异格式检查，不是完整安全审计 |
| `npm run test:negative` | 退出 0；Spring/uni-app 基线通过，四类故意违规均被对应门禁拦截 | 包含 H5/微信构建，不等于开发者工具或真机交互通过 |
| `npm run test:eval-harness` | 退出 0；缺失实现的负控制正确失败，已知正确控制通过 | 评分器控制不是独立 Agent 或 UI 评测成绩 |
| 发布隐私审查 | 114 个候选文件及发布前已有的 2 次提交、116 个唯一历史文件内容未发现检查项命中 | 检查绝对路径、本机标识、非项目邮箱、凭据、内网地址及非发行文件；仍需人工复核 |
| `npm audit --json`（uni-app） | 退出 1；40 个受影响依赖项：13 high、12 moderate、15 low、0 critical | 发布前重新审计；风险未修复，不等于 40 个独立漏洞 |

隐私启发式校验覆盖发行文件，新增链接均为相对项目文件或公开来源；私人知识库入口不进入仓库。启发式通过不等于完整秘密扫描认证。

## 来源核对

本轮读取 [Spring 代码组织](https://docs.spring.io/spring-boot/reference/using/structuring-your-code.html)、[Jakarta Web 应用](https://jakarta.ee/learn/docs/jakartaee-tutorial/current/web/webapp/webapp.html)、[uni-app 工程](https://uniapp.dcloud.net.cn/tutorial/project.html) 和 [微信官方示例配置](https://github.com/wechat-miniprogram/miniprogram-demo/blob/master/project.config.json) / [应用配置](https://github.com/wechat-miniprogram/miniprogram-demo/blob/master/miniprogram/app.json)。它们支持对应框架机制，不为本包文件夹名称和后缀逐条背书。

微信开发文档结构页本轮抓取不可用，配置角色改由上述官方示例核对；未据此推定基础库阈值或所有平台能力。实际开发仍核对项目版本，不复制示例账号和配置值。

## 发布范围与隐私

维护者已授权将本版推送到现有 [公开仓库](https://github.com/XMuku/enterprise-coding-standards)，目标分支 main。发布提交使用项目通用身份，不使用个人机器上的 Git 身份。只提交审查过的源码、规范、模板、公开来源与必要锁文件；不包含私人知识库、原始聊天记录、测试日志、备份、依赖目录、构建产物、代理配置或访问凭据。

本报告记录发布前已执行检查，不预先宣称远端 CI 成功。对应提交是否上传和各平台任务是否完成，以 [仓库提交](https://github.com/XMuku/enterprise-coding-standards/commits/main/) 与 [Actions](https://github.com/XMuku/enterprise-coding-standards/actions/workflows/validate.yml) 的实际结果为准。没有自动创建 Release、标签或 npm 发布。

## 未验证与已知风险

未完成四栈工程蓝图的独立 Agent 实测、Java EE 容器或原生微信真机验证；鸿蒙 SDK/设备限制也保持不变。文档/导出测试不能证明 Agent 一定遵守规则，也不能证明真实业务项目通过检查。

示例依赖风险未由本次文档更新修复，不推荐直接生产采用；本轮未执行强制依赖升级，Java 依赖也没有完整漏洞扫描证据。历史范围见 [beta.5](verification-beta5.md)。保留无 LICENSE 与 private/UNLICENSED 的决定；没有安装全局 Skill、接入业务项目或覆盖原始知识库材料。
