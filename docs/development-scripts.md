# 开发脚本使用指南

## 概述

本文档说明项目中所有 npm 脚本的用途和使用方法。

---

## 开发脚本

### `npm run dev`

启动 Vite 开发服务器（仅前端）。

**用途**:
- 开发和调试 React 组件
- 快速预览 UI 变化
- 不启动 Electron 窗口

**特点**:
- 热模块替换（HMR）
- 快速刷新
- 端口：5173

**使用场景**:
```bash
npm run dev
```

然后在浏览器中访问 `http://localhost:5173`

---

### `npm run dev:electron`

启动完整的 Electron 开发环境（推荐）。

**用途**:
- 完整的应用开发
- 测试主进程和渲染进程交互
- 测试 IPC 通信

**工作流程**:
1. 启动 Vite 开发服务器
2. 等待服务器就绪（http://localhost:5173）
3. 启动 Electron 应用
4. 自动打开开发者工具

**特点**:
- 并发运行 Vite 和 Electron
- 自动等待 Vite 服务器启动
- 支持热重载
- 自动打开 DevTools

**使用场景**:
```bash
npm run dev:electron
```

**注意事项**:
- 确保端口 5173 未被占用
- 修改渲染进程代码会自动刷新
- 修改主进程代码需要手动重启（Ctrl+R）

---

## 构建脚本

### `npm run build`

构建完整的应用并打包。

**用途**:
- 生成生产环境的应用
- 创建可分发的安装包

**工作流程**:
1. 使用 Vite 构建渲染进程
2. 使用 electron-builder 打包应用

**输出**:
- `dist/` - Vite 构建输出
- `out/` - electron-builder 打包输出

**使用场景**:
```bash
npm run build
```

---

### `npm run build:vite`

仅构建渲染进程（Vite）。

**用途**:
- 单独构建前端代码
- 测试构建输出

**输出**:
- `dist/renderer/` - 渲染进程构建输出
- `dist/main/` - 主进程构建输出
- `dist/preload/` - 预加载脚本构建输出

**使用场景**:
```bash
npm run build:vite
```

---

### `npm run build:electron`

仅打包 Electron 应用（不重新构建）。

**用途**:
- 在已有构建输出的基础上打包
- 快速测试打包配置

**前提条件**:
- 必须先运行 `npm run build:vite`

**使用场景**:
```bash
npm run build:vite
npm run build:electron
```

---

### `npm run build:dir`

构建应用但不打包成安装包。

**用途**:
- 快速测试构建结果
- 生成未打包的应用目录

**输出**:
- `out/win-unpacked/` - 未打包的 Windows 应用

**使用场景**:
```bash
npm run build:dir
```

**优点**:
- 比完整打包快
- 可以直接运行 exe 文件测试

---

### `npm run build:win`

构建 Windows 安装包。

**用途**:
- 生成 Windows 安装程序
- 准备发布版本

**输出**:
- `out/QRCode File Transfer Setup 1.0.0.exe` - NSIS 安装程序

**使用场景**:
```bash
npm run build:win
```

**注意事项**:
- 仅在 Windows 系统上运行
- 生成的安装包兼容 Windows 7

---

## 其他脚本

### `npm run preview`

预览 Vite 构建结果。

**用途**:
- 在本地预览生产构建
- 测试构建后的应用

**前提条件**:
- 必须先运行 `npm run build:vite`

**使用场景**:
```bash
npm run build:vite
npm run preview
```

然后在浏览器中访问显示的 URL。

---

### `npm start`

直接启动 Electron 应用。

**用途**:
- 启动已构建的应用
- 测试生产模式

**前提条件**:
- 必须先运行 `npm run build:vite`

**使用场景**:
```bash
npm run build:vite
npm start
```

---

### `npm run clean`

清理构建输出目录。

**用途**:
- 删除所有构建产物
- 清理磁盘空间
- 重新开始构建

**删除的目录**:
- `dist/` - Vite 构建输出
- `out/` - electron-builder 打包输出

**使用场景**:
```bash
npm run clean
npm run build
```

---

### `npm test`

运行测试（占位符）。

**用途**:
- 运行单元测试和集成测试

**状态**:
- 将在任务 1.6.1 中配置

---

## 开发工作流

### 日常开发

```bash
# 1. 启动开发环境
npm run dev:electron

# 2. 修改代码
# - 渲染进程代码会自动刷新
# - 主进程代码需要手动重启（Ctrl+R）

# 3. 测试功能
# - 使用 DevTools 调试
# - 查看控制台输出
```

### 构建测试

```bash
# 1. 清理旧的构建
npm run clean

# 2. 构建应用
npm run build:vite

# 3. 测试构建结果
npm start

# 或者预览前端
npm run preview
```

### 打包发布

```bash
# 1. 清理旧的构建
npm run clean

# 2. 完整构建和打包
npm run build

# 3. 测试安装包
# 运行 out/ 目录中的安装程序
```

---

## 环境变量

### 开发环境 (`.env.development`)

```env
VITE_DEV_SERVER_PORT=5173
NODE_ENV=development
OPEN_DEVTOOLS=true
```

### 生产环境 (`.env.production`)

```env
NODE_ENV=production
OPEN_DEVTOOLS=false
```

---

## 常见问题

### 1. 端口被占用

**问题**: `Error: listen EADDRINUSE: address already in use :::5173`

**解决方案**:
```bash
# 方法 1: 关闭占用端口的程序
# 方法 2: 修改 vite.config.js 中的端口号
```

### 2. Electron 窗口不显示

**问题**: 运行 `npm run dev:electron` 后窗口不显示

**解决方案**:
```bash
# 1. 检查 Vite 服务器是否启动成功
# 2. 检查控制台是否有错误
# 3. 尝试重新启动
npm run clean
npm run dev:electron
```

### 3. 热重载不工作

**问题**: 修改代码后页面不自动刷新

**解决方案**:
```bash
# 1. 检查 Vite 配置
# 2. 重启开发服务器
# 3. 清除浏览器缓存
```

### 4. 构建失败

**问题**: `npm run build` 失败

**解决方案**:
```bash
# 1. 清理构建目录
npm run clean

# 2. 删除 node_modules 重新安装
rm -rf node_modules package-lock.json
npm install

# 3. 重新构建
npm run build
```

### 5. 打包后应用无法运行

**问题**: 安装后应用无法启动

**解决方案**:
```bash
# 1. 检查 electron-builder.json 配置
# 2. 使用 build:dir 测试未打包版本
npm run build:dir

# 3. 检查主进程代码中的路径
# 确保使用相对路径而不是绝对路径
```

---

## 性能优化建议

### 开发环境

1. **使用 SSD**
   - 提高文件读写速度
   - 加快热重载速度

2. **关闭不必要的程序**
   - 释放内存
   - 减少 CPU 占用

3. **使用增量构建**
   - Vite 默认支持
   - 只重新构建修改的文件

### 构建环境

1. **使用多核 CPU**
   - electron-builder 支持并行构建
   - 加快打包速度

2. **排除不必要的文件**
   - 在 electron-builder.json 中配置 `files`
   - 减小安装包体积

3. **启用压缩**
   - NSIS 安装程序支持压缩
   - 减小安装包大小

---

## 脚本依赖关系

```
dev:electron
├── dev (Vite 开发服务器)
└── electron (Electron 应用)

build
├── build:vite (Vite 构建)
└── build:electron (electron-builder 打包)

build:dir
├── build:vite
└── electron-builder --dir

build:win
├── build:vite
└── electron-builder --win
```

---

## 相关工具

### concurrently

并发运行多个命令。

**配置**:
```json
"dev:electron": "concurrently \"npm run dev\" \"wait-on http://localhost:5173 && electron .\""
```

### wait-on

等待资源可用。

**用途**:
- 等待 Vite 服务器启动
- 确保 Electron 在服务器就绪后启动

### cross-env

跨平台设置环境变量。

**用途**:
- 在 Windows 和 Unix 系统上统一设置环境变量

### rimraf

跨平台删除文件和目录。

**用途**:
- 清理构建输出
- 删除 node_modules

---

**最后更新**: 2025-10-06 11:30

