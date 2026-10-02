# uni-app Order Notebook

Vue 3 + TypeScript + uni-app，支持 H5 与 `mp-weixin` 构建。需要 Node.js 22.13+（22 系列）或 24+；全部直接依赖固定版本，完整解析结果在 `package-lock.json`。

**仅供本地演示**：2026-10-02 对当前锁文件执行 `npm audit`，报告 40 个受影响依赖项（13 高、12 中、15 低），不是零漏洞模板。涉及构建工具及传递运行依赖，不能一概当作“仅开发时有风险”。不要直接上线或暴露开发服务；详情见 [本轮验证报告](../../docs/verification-beta3.md)。

在本目录执行：

```shell
npm ci
npm run check
npm run dev:h5
```

最后一条在 loopback 上启动开发服务，访问终端显示的本地 URL；Ctrl+C 结束。`npm run check` 依次执行 ESLint、`vue-tsc`、3 项基线 Node 测试、H5 与微信构建。输出分别在 `dist/build/h5/`、`dist/build/mp-weixin/`。[uni-app CLI 说明](https://uniapp.dcloud.io/quickstart-cli.html)

微信编译不需要登录；开发者工具预览、真机、上传发布需要自行准备相应工具和合法 AppID。本示例 `appid` 留空，不伪造真实应用身份。**编译通过不代表已在微信或所有手机上验证交互。**

## 结构与行为

- [AGENTS.md](AGENTS.md) 是先写代码时读取的本地约束。
- [页面](src/pages/order-list/index.vue) 负责页面生命周期、加载/错误/空态；不把平台 API 混入纯领域函数。
- [卡片](src/components/OrderCard.vue) 使用只读 Order 类型和 props，不修改父状态。
- [API adapter](src/api/order.ts) 每次返回独立 mock 数组，不请求外部后端。
- [数量校验](src/domain/quantity.ts) 是可复用纯函数，测试覆盖整数边界、非整数和非有限值。

`tsconfig.json` 的 `skipLibCheck` 只跳过依赖声明文件的内部检查，不关闭自身源码严格类型检查；源码字段类型反例会被 `vue-tsc` 拒绝。Node 测试的类型擦除只执行程序，不代替类型检查。

## 版本与安全边界

DCloud 包统一使用 `3.0.0-5020620260917001`，Vue 3.4.21、Vite 5.2.8 按这组框架依赖匹配；不是把所有包都升级到各自 latest。`.npmrc` 仅给本示例选用官方 npm registry，不改用户全局设置。安装异常先检查镜像同步与版本，不使用 `--force` 或 `--legacy-peer-deps` 绕过。

兼容锁定不等于安全审计通过。发布前执行 `npm audit` 并审阅实际结果；修复框架传递依赖应联合升级并重跑两个平台，不能自动 `audit fix --force`。开发服务只供本机演示，不暴露公网。
