# Aider-AI/aider 分析卡片

研读日期：2026-10-03。快照：`5dc9490bb35f9729ef2c95d00a19ccd30c26339c`。分类：实际编码工具，兼有规则注入、代码编辑、Git 与检查命令。源仓库 Apache-2.0；源码版本标记 `0.86.3.dev`，不是已安装版本。未安装 Aider、调用模型或执行上游测试。

## 定位与核心文件

在终端中用模型编辑已有仓库，通过只读上下文、仓库地图及 lint/test 反馈辅助开发。Aider 是规则的消费者，不是一套自动适配企业 Java 项目的完整编码标准。

| 核心文件 | 实际关注点 |
| --- | --- |
| [conventions.md](https://github.com/Aider-AI/aider/blob/5dc9490bb35f9729ef2c95d00a19ccd30c26339c/aider/website/docs/usage/conventions.md) | `/read`、`--read` 和配置 `read` 才是规范注入方式 |
| [aider_conf.md](https://github.com/Aider-AI/aider/blob/5dc9490bb35f9729ef2c95d00a19ccd30c26339c/aider/website/docs/config/aider_conf.md) | `.aider.conf.yml` 的发现、合并顺序和显式 `--config` |
| [main.py](https://github.com/Aider-AI/aider/blob/5dc9490bb35f9729ef2c95d00a19ccd30c26339c/aider/main.py) | 配置处理和只读路径解析；相对 read 路径由启动工作目录解析 |
| [args.py](https://github.com/Aider-AI/aider/blob/5dc9490bb35f9729ef2c95d00a19ccd30c26339c/aider/args.py) | read、自动提交、脏文件提交与自动 lint/test 的实际选项 |
| [git.md](https://github.com/Aider-AI/aider/blob/5dc9490bb35f9729ef2c95d00a19ccd30c26339c/aider/website/docs/git.md) | 默认自动提交，包括已有改动；默认可能跳过提交钩子 |
| [lint-test.md](https://github.com/Aider-AI/aider/blob/5dc9490bb35f9729ef2c95d00a19ccd30c26339c/aider/website/docs/usage/lint-test.md) | lint/test 的返回码和自动修复机制 |
| [repomap.py](https://github.com/Aider-AI/aider/blob/5dc9490bb35f9729ef2c95d00a19ccd30c26339c/aider/repomap.py) | 有预算的仓库结构上下文；不等于完整规则或真实权限隔离 |

## 工作流与亮点

从仓库根启动，显式加载可信配置和只读规范，选择待编辑文件；先澄清边界与方案，再编辑、检查并评估差异。只读规则、有限上下文和真实命令反馈适合企业采用，检查命令仍要由项目提供。

`.aider.rules` 是本扩展选择的普通规则文件名，Aider 不因这个名字自动加载它。必须配套 `.aider.conf.yml` 的 `read` 列表或 `--read`；配置中的链接也不会递归变成已加载文件。

## 局限与适配

默认自动提交和脏文件提交不适合未经授权的多人工作区；自动 lint 可能触发修改器，失败反馈可能引发扩大修复。配置、环境变量和命令行有覆盖关系，启用时必须核对有效参数。只读聊天上下文不是操作系统沙箱，模型依然可能不遵守文本规则。远端模型接收的代码范围、历史与仓库地图需要数据授权。

| 判断 | 取舍与原因 |
| --- | --- |
| 保留 | 原生 read 配置、显式任务范围、检查反馈与只读规则上下文 |
| 调整 | 默认关闭 auto-commits、dirty-commits、auto-lint、auto-test；按项目命令显式验证，不取消测试责任 |
| 不引入 | 安装 Aider/模型依赖、自动提交他人改动、跳过既有钩子、全库只读加载和未经批准外发 |
| 适用 | 已选用 Aider 的团队希望写代码前加载同一套企业标准 |
| 不适用 | 只复制 .aider.rules 就宣称生效、把仓库地图当规范、把自动修复当独立审查 |

推荐从项目根使用显式配置并确认加载列表。未执行的行为验收标记 `not-run`，不由源码研读推断为通过。
