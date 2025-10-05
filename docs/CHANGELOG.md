# 更新日志

本文档记录项目的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并且本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

## [未发布]

### 第一阶段（MVP）开发中

---

## [0.1.0] - 2025-10-06

### 新增 ✨

#### 项目初始化
- 创建完整的项目目录结构
  - `src/main/` - Electron 主进程目录
  - `src/main/ipc/` - IPC 处理器目录
  - `src/renderer/` - React 渲染进程目录
  - `src/renderer/src/components/` - React 组件目录
  - `src/renderer/src/services/` - 业务逻辑服务目录
  - `src/renderer/src/hooks/` - 自定义 Hooks 目录
  - `src/renderer/src/utils/` - 工具函数目录
  - `src/preload/` - 预加载脚本目录
  - `src/shared/utils/` - 共享工具函数目录
  - `src/shared/protocols/` - 数据协议定义目录
  - `tests/` - 测试文件目录
  - `assets/` - 资源文件目录

#### 配置文件
- 初始化 `package.json`
  - 设置项目名称: `qrcode-app`
  - 设置版本: `1.0.0`
  - 设置描述: QRCode File Transfer - 二维码文件传输工具
  - 设置许可证: MIT
  - 配置主入口: `src/main/index.js`
  - 添加基础脚本占位符
  - 添加关键词: electron, qrcode, file-transfer, windows7

- 配置 `.gitignore`
  - 忽略 node_modules
  - 忽略构建输出（dist, build, out）
  - 忽略可执行文件（.exe, .dmg, .AppImage 等）
  - 忽略开发工具配置（.vscode, .idea）
  - 忽略日志文件
  - 忽略操作系统特定文件（.DS_Store, Thumbs.db）
  - 忽略环境变量文件
  - 忽略临时文件
  - 忽略测试覆盖率报告

#### 文档
- 创建 `README.md` - 项目主文档
  - 项目概述和功能介绍
  - 快速开始指南
  - 项目结构说明
  - 开发指南和关键技术点
  - 开发路线图
  - 测试和打包说明
  - Windows 7 兼容性检查清单

- 创建 `docs/development-guidelines.md` - 开发规范文档
  - Electron 开发最佳实践
  - React 开发最佳实践
  - shadcn/ui 使用规范
  - 项目结构规范
  - 编码规范
  - 测试规范
  - Git 提交规范
  - Windows 7 兼容性指南

- 创建 `docs/technical-specification.md` - 技术规格说明书
  - 系统架构设计
  - 数据流程图
  - 核心模块设计
  - 分片协议设计
  - IPC 通信协议
  - UI 组件设计
  - 错误处理策略
  - 性能优化方案
  - 安全考虑
  - 部署和打包配置

- 创建 `docs/mvp-task-list.md` - MVP 任务列表
  - 详细的任务分解（43 个子任务）
  - 每个任务的具体内容和代码示例
  - 预计时间估算
  - 关键里程碑

- 创建 `docs/task-progress.md` - 任务进度跟踪
  - 已完成任务列表
  - 进行中任务
  - 待完成任务
  - 统计信息
  - 下一步行动

- 创建 `src/README.md` - 源代码目录结构说明
  - 详细的目录结构
  - 模块职责说明
  - 开发规范
  - 文件命名规范

#### 依赖
- 安装 Electron 22.3.27（Windows 7 兼容版本）

### 技术决策 🎯

- **Electron 版本**: 选择 22.3.27（最后支持 Windows 7 的稳定版本）
- **目标平台**: Windows 7 及以上，支持 32 位和 64 位
- **开发语言**: JavaScript (ES6+)
- **项目结构**: 采用主进程、渲染进程、预加载脚本分离的架构

### 任务完成 ✅

- [x] 1.1.1 创建项目基础结构

---

## Git 提交历史

### Commit: ad7e3bf (2025-10-06 00:09:47)
**作者**: alphapenng <barca8best@gmail.com>  
**分支**: master (初始提交)

**提交信息**:
```
feat: 初始化项目结构和文档

- 创建完整的项目目录结构（main, renderer, preload, shared）
- 配置 package.json 基础信息
- 添加 .gitignore 配置
- 创建项目文档（开发规范、技术规格、任务列表）
- 添加 README 和目录说明文档

任务: 1.1.1 创建项目基础结构 ✅
```

**文件变更统计**:
- 19 个文件新增
- 2,461 行代码新增
- 0 行代码删除

**主要文件**:
- `.gitignore` (55 行)
- `README.md` (282 行)
- `docs/development-guidelines.md` (429 行)
- `docs/mvp-task-list.md` (825 行)
- `docs/task-progress.md` (147 行)
- `docs/technical-specification.md` (581 行)
- `package.json` (25 行)
- `src/README.md` (95 行)
- 11 个 `.gitkeep` 文件

---

## 下一步计划

### 即将开始
- [ ] 1.1.2 安装 Electron 和核心依赖
  - 安装 electron-builder
  - 安装开发工具（concurrently, wait-on, cross-env）

### 后续任务
- [ ] 1.1.3 配置 React 开发环境
- [ ] 1.1.4 集成 shadcn/ui
- [ ] 1.1.5 配置 Electron 主进程
- [ ] 1.1.6 创建 Preload 脚本
- [ ] 1.1.7 配置开发脚本

---

## 版本说明

### 版本号规则
- **主版本号**: 重大功能变更或不兼容的 API 修改
- **次版本号**: 向下兼容的功能性新增
- **修订号**: 向下兼容的问题修正

### 当前版本
- **版本**: 0.1.0
- **状态**: 开发中
- **阶段**: 第一阶段（MVP）
- **完成度**: 2.3% (1/43 任务)

---

**最后更新**: 2025-10-06 00:10

