# lemmih/best-practice 分析卡片

研读日期：2026-10-03。快照：`aa593520111b5edc103e3545b3a85eb409602b00`。分类：AI 友好示例工程与上下文打包。源仓库 The Unlicense；这不改变本包的 UNLICENSED 决定。未运行 Nix 或发布 Pages。

## 定位与核心文件

用 Rust 示例、可复现环境和源文件串接，演示如何给 Agent 提供项目上下文；不是跨语言企业规范大全。

| 核心文件 | 实际关注点 |
| --- | --- |
| [AGENTS.md](https://github.com/lemmih/best-practice/blob/aa593520111b5edc103e3545b3a85eb409602b00/AGENTS.md) | 分支/提交、静态检查、锁文件与服务端安全 |
| [flake.nix](https://github.com/lemmih/best-practice/blob/aa593520111b5edc103e3545b3a85eb409602b00/flake.nix) | 聚合子项目检查与环境构建 |
| [concat-project.sh](https://github.com/lemmih/best-practice/blob/aa593520111b5edc103e3545b3a85eb409602b00/nix/concat-project.sh) | 排序串接源码和相关 workflow，只显式排除 lock 文件 |
| [pages.yml](https://github.com/lemmih/best-practice/blob/aa593520111b5edc103e3545b3a85eb409602b00/.github/workflows/pages.yml) | 构建后的上下文对外发布 |
| [rust-example/flake.nix](https://github.com/lemmih/best-practice/blob/aa593520111b5edc103e3545b3a85eb409602b00/rust-example/flake.nix) | 编译、格式、clippy、测试及依赖审计分工 |

## 工作流与亮点

环境/依赖确认后执行分层检查，再把示例源码及 workflow 打包为 Agent 可读文本；PR 与提交采用一致的可读格式。可借鉴“明确入口、实际命令与独立检查职责”，而非重复自然语言解释所有工具。

服务端校验、参数化 SQL、凭证不进 Git、锁文件维护，与本包既有规则相容。固定版本有助复现，但数据库和锁文件仍需定期更新。

## 局限与适配

串接脚本不是秘密扫描器；按目录收集再公开可能暴露不应共享的文件，并增加上下文成本。AGENTS 的固定 feature branch/自动创建 PR 不适用于所有已授权工作流；workflow 中仍有浮动 Action 引用，不能直接宣称完全固定供应链。

| 判断 | 取舍与原因 |
| --- | --- |
| 保留 | 短入口、真实检查与有意义提交说明；安全边界与现有规则合并而不复制 |
| 调整 | 检查使用实际 Maven/Gradle 与项目配置；提交只在授权范围内，保留既有分支 |
| 不引入 | Nix/Rust/Leptos/Cloudflare、自动 Pages 发布、源码全量串接、强制创建 PR |
| 适用 | 小型示例的可复核工程证据、企业 Java 项目的检查范围说明 |
| 不适用 | 把全量源码包作为每次 Agent 的默认上下文；替代架构/契约检查 |

维护判断依据具体文件，不以仓库名称中的 best-practice 视为认证或普适结论。
