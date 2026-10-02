# 验证记录校验器使用说明

本工具是零第三方依赖、Node.js 22+ 的只读校验器。它验证记录一致性与本地证据文件完整性，**不是测试运行器、真实性证明、风险分类器或发布审批器**。流程规则见 [风险与证据](../references/quality-gates.md)。不需要任何服务账号。

## 最短试用

在规范包根目录执行，将 `<absolute-kit-directory>` 换成实际规范包位置：

```shell
node scripts/validate-evidence.mjs --root "<absolute-kit-directory>" --plan assets/evidence-plan.example.json --report assets/evidence-report.example.json --subject replace-with-verified-snapshot-id
```

随包的 [计划](../assets/evidence-plan.example.json) 与 [报告](../assets/evidence-report.example.json) 故意没有成功记录。输出 `incomplete`、退出码 1 是预期结果：两个检查未运行，不能把模板直接当作通过证据。

实际采用时，由项目流程在自己的约定目录创建计划与报告，不修改这两份模板。工具不生成目录、覆盖文件、执行 JSON 里的 command、访问网络或上传日志。四个参数都必填且只出现一次：

| 参数 | 含义 |
| --- | --- |
| `--root` | 已存在的业务项目绝对目录，仅在调用时传入，不写进公开资产 |
| `--plan` | 相对 root 的已确定检查计划 JSON |
| `--report` | 相对 root 的本次结果 JSON |
| `--subject` | 从可信流程取得的预期快照标识，不从待验证报告反向抄取 |

标识允许英文字母、数字、点、下划线和连字符，1-128 字符；若使用内容摘要，注明其生成与覆盖方法。计划和报告必须与预期标识完全相同；校验器**不会自动证明这个标识对应当前工作区**。

## 计划格式

`schemaVersion` 为 1；`subject` 标识验证对象；`risk` 为 low/standard/high；`drivers` 是非空理由列表。`checks` 为 1-1000 项，每项有唯一 `id`、`kind`（command/review）、说明范围的 `scope`、布尔 `applicable`；不适用还需 `reason`。至少一项适用。风险及范围由人或受信任流程判断，脚本仅校验填写形式。

报告同样为版本 1，`results` 必须完整且恰好覆盖计划 ID，禁止漏项、重复项和未知项。每项包含 `id`、`status`、非空 `summary` 与 `artifacts` 数组。状态见流程文档；未完成项不携带 execution/review，以免混入虚假完成信息。

JSON 输入以 UTF-8 读取；非法字节会拒绝，不能由解码器静默替换后当作原记录。CLI 只接受帮助中列出的参数，未知或重复参数返回退出码 2。

## 完成项的附加字段

命令检查的 pass/fail 记录增加如下 `execution`。以下为字段形态示意，不是已运行结果：

```json
{
  "command": "<actually-executed-command>",
  "cwd": ".",
  "tool": "<actual-runner>",
  "version": "<observed-version>",
  "exitCode": 0,
  "checked": 2,
  "failed": 0,
  "skipped": 0
}
```

checked 是实际执行/检查的测试、文件或契约数量，不包含 skipped；在 summary 说明计数单位和覆盖范围。值需来自工具报告，不随意填 1；只有格式正确不能证明数字真实。运行器不能提供有意义覆盖证据时标记 blocked，不能把启动成功当完成。进程未正常结束或超时也应记录 blocked，而非构造退出码 0。

review 检查增加 `review`，字段为 `mode`（self/independent-agent/human）、`checked`、`failed`；范围及发现写入审查证据。checked > 0，failed 在 0 与 checked 之间。审查通过仅说明该审查结果，不能替代实际命令。

所有完成项至少一个 artifact：`{"path":"<project-relative-report>","sha256":"<64-lowercase-hex>"}`。文件必须存在、非空、未超过 16 MiB；哈希必须匹配文件当前字节。JSON 输入上限 1 MiB。输入与证据文件路径使用 `/`，拒绝绝对路径、`..`、反斜杠、大小写不一致及 symlink/junction。工作目录仅做相对路径词法校验，可为 `.`；校验器不校验它是否存在或实际用于那次执行。

pass 要求失败数为 0，命令退出码也为 0；fail 必须有失败数或非零退出码。全部跳过、零覆盖、未运行、阻断和不适用都不能伪装 pass。未知字段或拼错状态被拒绝。

## 从未运行到可校验的完整记录

以一个后端接口变更为例，先在项目既有证据目录保存计划，分别列 `contract-tests`、`architecture-review` 和不适用的 `device-check`。计划必须在实施前确定，subject 由项目流程取得；随包示例中的 subject 是占位符。

实际运行合同测试后，把真实报告保存为项目相对路径，例如 `evidence/contract-tests.log`；自检记录保存在 `evidence/architecture-review.md`。私密日志留在项目允许的位置，脱敏后的文件应重新计算哈希。

在业务项目根目录执行下列只读命令，可取得文件的哈希；路径按真实报告调整：

```shell
node --input-type=module -e "import fs from 'node:fs'; import {createHash} from 'node:crypto'; for (const path of process.argv.slice(1)) console.log(JSON.stringify({path,sha256:createHash('sha256').update(fs.readFileSync(path)).digest('hex')}));" evidence/contract-tests.log evidence/architecture-review.md
```

将所得 artifact 对象和真实命令结果填入报告。以下是一个完整结果的字段示意，尖括号都需要替换，数字也应按实际运行填写；它不作为本仓库的运行成绩：

```json
{
  "schemaVersion": 1,
  "subject": "<trusted-snapshot-id>",
  "results": [
    {
      "id": "contract-tests",
      "status": "pass",
      "summary": "<actual-tested-contracts-and-count-unit>",
      "execution": {
        "command": "<actually-executed-command>",
        "cwd": ".",
        "tool": "<actual-runner>",
        "version": "<observed-version>",
        "exitCode": 0,
        "checked": 2,
        "failed": 0,
        "skipped": 0
      },
      "artifacts": [{ "path": "evidence/contract-tests.log", "sha256": "<actual-64-hex-digest>" }]
    },
    {
      "id": "architecture-review",
      "status": "pass",
      "summary": "<actual-reviewed-boundaries>",
      "review": { "mode": "self", "checked": 1, "failed": 0 },
      "artifacts": [{ "path": "evidence/architecture-review.md", "sha256": "<actual-64-hex-digest>" }]
    },
    {
      "id": "device-check",
      "status": "not-applicable",
      "summary": "Server-only change, consistent with the planned reason",
      "artifacts": []
    }
  ]
}
```

然后从规范包位置运行校验器，传入业务项目 root、计划/报告相对路径和可信 subject。报告满足 planned checks 才能得到 passed；实际测试失败时将状态改为 fail，保留真实退出码/失败数。服务无法启动则为 blocked，并删除该项 execution，记录阻断原因，保留可用诊断 artifact。

这一流程只需在项目首次接入时安排一次。日常 Agent 从已确认的检查计划选择命令并更新实际结果，不需要每次重新下载规范、遍历全部来源或新建另一组目录。

## 退出码与可信边界

| verdict | 退出码 | 可得出的结论 |
| --- | --- | --- |
| passed | 0 | 声明的适用项均通过，记录一致且引用文件哈希匹配 |
| failed | 1 | 至少一项实际报告失败；其他未完成项仍列在 totals |
| incomplete | 1 | 没有 fail，但至少一项 blocked/not-run |
| invalid | 2 | 格式、状态、路径、哈希或对应关系不合法；不是业务测试失败 |

失败和缺口不允许用“校验器报错”掩盖。输出不回显 JSON 内容、命令或本机绝对路径，但这不是原始日志的脱敏器；公开报告前仍应检查原文件。

校验器及配套测试验证的是输入拒绝、结果归并与文件校验；测试夹具里的 pass 都是合成记录，不是新的独立 Agent 评测成绩。暂不带自动运行、增量缓存、SARIF、日志签名或任意 Agent 的退出阻断插件。需要正式门禁时先为目标运行器做受保护适配及正反例，不承诺跨 Agent 自动生效。
