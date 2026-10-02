# modelcontextprotocol/modelcontextprotocol 分析卡片

研读日期：2026-10-03。快照：`db788e34ffc0c7253f099f647a5e25e0396fadfe`。分类：Agent 应用与工具、资源之间的通信协议，高级可选模块。未安装服务器、SDK 或执行互操作测试。

## 定位与核心文件

统一宿主、客户端与服务器之间的工具和上下文交换。MCP 不规定 Java 命名、分层、测试门禁，也不是让所有编码工具自动读取 AGENTS.md 的机制。

| 核心文件 | 实际关注点 |
| --- | --- |
| [architecture/index.mdx](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/db788e34ffc0c7253f099f647a5e25e0396fadfe/docs/specification/2026-07-28/architecture/index.mdx) | 宿主权限管理、客户端与服务器隔离；所读版本逐请求携带协议版本和能力 |
| [server/tools.mdx](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/db788e34ffc0c7253f099f647a5e25e0396fadfe/docs/specification/2026-07-28/server/tools.mdx) | 工具发现、调用、输入结构与人工拒绝能力 |
| [security-considerations.mdx](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/db788e34ffc0c7253f099f647a5e25e0396fadfe/docs/specification/2026-07-28/basic/authorization/security-considerations.mdx) | PKCE、受众校验、重定向校验与禁止令牌透传 |
| [security_best_practices.mdx](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/db788e34ffc0c7253f099f647a5e25e0396fadfe/docs/docs/2026-07-28/tutorials/security/security_best_practices.mdx) | 混淆代理、逐客户端同意与 SSRF 风险 |
| [LICENSE](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/db788e34ffc0c7253f099f647a5e25e0396fadfe/LICENSE) | MIT 向 Apache-2.0 过渡，非规范文档涉及 CC-BY-4.0；不能笼统称整个快照为 MIT |

本次读的是仓库中日期为 `2026-07-28` 的规范目录，不据此声称所有宿主和 SDK 已实现该版本，也不把旧版本的生命周期约定当作跨版本通则。

## 工作流与亮点

明确服务端身份、所选协议版本和授权边界后，发现工具或资源，再按允许的范围发起调用并核验返回内容。宿主负责同意、权限和上下文汇聚；服务器只得到所需资料。能力声明和工具注解不等于授权，更不等于工具已安全。

企业可借鉴最小上下文、敏感操作确认、服务隔离和版本核对。跨系统工具访问与 A2A 的独立 Agent 协作可以互补，二者都不能代替企业代码规则和执行检查。

## 局限与适配

接入服务会增加身份、外发数据、网络、费用、提示注入及运维风险。不同版本差异明显；发现成功不能证明能力兼容，工具返回内容不能升格为系统指令。许可证处于过渡状态，复制具体文件前需逐项确认适用条件，本次只作原创分析和来源链接。

| 判断 | 取舍与原因 |
| --- | --- |
| 保留 | 在可选文档中记录版本、服务来源、允许操作、数据范围、费用和撤销方式 |
| 调整 | 工具结果按不可信资料核验；禁止凭能力标签自动扩大权限 |
| 不引入 | 基础流程强制 MCP、自动安装服务、生产数据库写权限、令牌透传和全量上下文外发 |
| 适用 | 已有受控工具服务且确需跨应用工具访问的高级采用任务 |
| 不适用 | 纯编码风格约束、单仓库规则加载、替代 lint/测试或文件系统沙箱 |

默认不启用。业务接入另行评审身份、网络与数据边界，不在本次文档扩展中部署运行时。
