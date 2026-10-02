---
name: enterprise-coding-standards
description: Adopt or apply this enterprise coding standards kit to Java/Spring, Java EE, uni-app, native WeChat, or HarmonyOS/ArkUI projects when the user requests this standard. Not a deployment workflow.
metadata:
  version: "1.2.0-beta.6"
---

# 企业级编码规范的采用与开发

本包是可按项目采用的编码规范与治理模板，不是上游官方标准或企业合规认证。只处理用户指定的项目和任务；保留现有架构、ORM、依赖版本、公开契约及无关修改。

## 选择模式

- **采用**：用户要求把本包落地到项目时，读 [采用说明](references/adoption.md)。确认真实技术栈与规则，准备或合并项目入口；接入依赖和 CI 以实际授权为准。
- **开发**：项目已采用本包，或用户本次指定按它开发时，先读适用项目规则、已确认的项目画像和 [开发前约束](references/common.md)，只补读本次涉及的技术栈规范。
- **复核**：用户要求检查本包实施情况时，按实际差异与真实命令核验；未配置、未运行和不适用分开报告，不重构无关代码。

## 按任务读取

| 范围 | 本地规范 |
| --- | --- |
| 新增/移动目录、模块或公共文件 | [仓库结构](references/repository-structure.md) |
| 模块拆分、公共抽取、MVVM 或跨产品装配 | [模块架构](references/modular-architecture.md)；映射职责，不强制同名目录 |
| 新建/改名字段、方法、接口或基类 | [命名与设计](references/naming-design.md) |
| Java / Spring Boot / Spring MVC | [Java 与 Spring](references/java-spring.md) |
| Java EE / Jakarta EE 及明确的迁移 | [容器与命名空间](references/java-ee.md)；普通任务不得自动迁移 |
| uni-app / Vue 页面与组件 | [uni-app](references/uni-app.md) |
| 原生微信小程序 | [小程序](references/miniprogram.md)；不得套用 Vue 路由 |
| HarmonyOS / ArkTS / ArkUI | [鸿蒙开发](references/harmonyos-arkui.md)；先核对 SDK/API 与状态管理版本 |
| API、数据、权限、事务或重试相关变更 | [契约与安全](references/contracts-security.md) |
| 服务端查询、表、索引与迁移 | [数据访问](references/data-access.md) |
| 行为变更、缺陷修复或测试组织 | [测试规范](references/testing.md) |
| 配置、日志、外部请求或资源生命周期 | [配置与日志](references/configuration-logging.md) |
| 依赖、公开契约、规范例外或版本升级 | [变更管理](references/change-management.md) |
| 检查接入或失败诊断 | [检查接入](references/checks.md) |
| 来源核对、升级或来源冲突 | [来源与维护](references/sources.md) |

写代码前确定新增对象的归属、名字、边界与关键契约；小修复不要求另写完整计划。目录模式、类后缀和响应格式属于可调整的默认值，不得覆盖项目决策。

创建模块、层或文件时，先核对专项规范中的工程蓝图，将职责映射到项目画像中的真实相对路径、命名和依赖方向。已有映射直接复用；新项目先选定默认或明确调整，不为同一职责创建另一套目录。HTTP 接口层不等于必须创建语言 interface。

执行顺序是需求与验收、写前约束、最小实现与回归、实际验证与交付。关键业务或授权不明确时只暂停相关动作；不要把每一阶段都变成等待审批。最终自述不能代替写入前的决定或实际检查证据。

只读取命中任务的章节。规则编号用于定位与例外记录，不表示检查已经实现；“约束”“默认”“建议”分别处理，不把命名偏好当作框架强制要求。

## 降低重复上下文

已确认项目画像未变化时，不重复扫描全仓、安装 Skill 或访问所有来源网页。只加载受影响规则和配置；新 API、版本兼容或不确定事实仍需核对官方资料或本地证据。

项目中的精简规则是日常入口，Skill 不是所有任务的强制前置。不要把本包全部内容复制到全局规则，也不要要求每次加载所有 references。

## 交付边界

说明行为改动、实际检查、未验证项及兼容性影响。规则文件存在不等于检查已启用；构建通过不等于交互验证或已发布。禁止通过关测试、删规则或降低门槛制造通过结果。

本包由本地文档、模板和可选 Node.js 工具组成，不绑定模型供应商或云服务。Agent 的运行环境和业务项目依赖另行准备；本包不会自动登录、创建云资源、上传或发布。
