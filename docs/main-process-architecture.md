# Electron 主进程架构说明

## 概述

主进程是 Electron 应用的核心，负责管理应用生命周期、创建窗口、处理 IPC 通信等。

---

## 文件结构

```
src/main/
├── index.js                    # 主进程入口
├── config.js                   # 配置管理器
├── windowManager.js            # 窗口管理器
└── ipc/                        # IPC 处理器
    ├── fileHandlers.js         # 文件操作处理器
    ├── transferHandlers.js     # 传输相关处理器
    └── systemHandlers.js       # 系统相关处理器
```

---

## 核心模块

### 1. 主进程入口 (index.js)

**职责**:
- 应用生命周期管理
- 创建和管理主窗口
- 注册 IPC 处理器
- 处理应用级事件

**关键功能**:
- ✅ 单实例锁定（防止多开）
- ✅ 窗口创建和管理
- ✅ 安全配置（contextIsolation, sandbox）
- ✅ 错误处理和日志记录
- ✅ 配置加载和保存

**安全配置**:
```javascript
webPreferences: {
  contextIsolation: true,        // 启用上下文隔离
  nodeIntegration: false,         // 禁用 Node.js 集成
  sandbox: true,                  // 启用沙箱
  webSecurity: true,              // 启用 Web 安全
  allowRunningInsecureContent: false,  // 禁止运行不安全内容
  preload: path.join(__dirname, '../preload/index.js')
}
```

---

### 2. 配置管理器 (config.js)

**职责**:
- 加载和保存应用配置
- 提供配置读写接口
- 管理最近使用的文件列表

**配置文件位置**:
- Windows: `%APPDATA%\qrcode-app\config.json`
- macOS: `~/Library/Application Support/qrcode-app/config.json`
- Linux: `~/.config/qrcode-app/config.json`

**默认配置**:
```javascript
{
  window: {
    width: 1000,
    height: 700,
    x: undefined,
    y: undefined
  },
  transfer: {
    chunkSize: 2048,           // 每个二维码的数据大小（字节）
    maxFileSize: 1048576,      // 最大文件大小（1MB）
    compressionEnabled: true,   // 是否启用压缩
    qrCodeSize: 400,           // 二维码尺寸（像素）
    displayDuration: 500       // 二维码显示时长（毫秒）
  },
  app: {
    autoCheckUpdate: true,
    language: 'zh-CN',
    theme: 'light'
  },
  recentFiles: []
}
```

**API**:
- `load()` - 加载配置
- `save()` - 保存配置
- `get(key, defaultValue)` - 获取配置项
- `set(key, value)` - 设置配置项
- `getAll()` - 获取所有配置
- `reset()` - 重置配置
- `addRecentFile(filePath)` - 添加最近使用的文件
- `getRecentFiles()` - 获取最近使用的文件列表
- `clearRecentFiles()` - 清除最近使用的文件

---

### 3. 窗口管理器 (windowManager.js)

**职责**:
- 创建和管理多个窗口
- 提供窗口操作接口
- 防止窗口重复创建

**API**:
- `createWindow(name, options)` - 创建窗口
- `getWindow(name)` - 获取窗口
- `closeWindow(name)` - 关闭窗口
- `closeAllWindows()` - 关闭所有窗口
- `focusWindow(name)` - 聚焦窗口
- `minimizeWindow(name)` - 最小化窗口
- `maximizeWindow(name)` - 最大化/还原窗口
- `getAllWindows()` - 获取所有窗口
- `getWindowCount()` - 获取窗口数量

**使用示例**:
```javascript
const windowManager = require('./windowManager');

// 创建主窗口
const mainWindow = windowManager.createWindow('main', {
  width: 1000,
  height: 700
});

// 获取窗口
const window = windowManager.getWindow('main');

// 聚焦窗口
windowManager.focusWindow('main');
```

---

## IPC 处理器

### 1. 文件操作处理器 (fileHandlers.js)

**提供的 IPC 通道**:

| 通道名称 | 功能 | 参数 | 返回值 |
|---------|------|------|--------|
| `file:select` | 打开文件选择对话框 | 无 | `{ success, filePath, fileName, fileSize, fileType }` |
| `file:read` | 读取文件内容 | `filePath` | `{ success, data, size }` |
| `file:save-dialog` | 打开保存对话框 | `defaultFileName` | `{ success, filePath }` |
| `file:save` | 保存文件 | `{ filePath, data }` | `{ success, filePath, size }` |
| `file:info` | 获取文件信息 | `filePath` | `{ success, info }` |

**文件大小限制**:
- 当前限制：1MB (1048576 字节)
- 超过限制会返回错误：`FILE_TOO_LARGE`

**支持的文件类型**:
- 所有文件 (`*`)
- 文本文件 (`.txt`, `.md`, `.json`)
- Office 文档 (`.doc`, `.docx`, `.xls`, `.xlsx`, `.ppt`, `.pptx`)
- 图片 (`.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`)

---

### 2. 传输相关处理器 (transferHandlers.js)

**提供的 IPC 通道**:

| 通道名称 | 功能 | 参数 | 返回值 |
|---------|------|------|--------|
| `transfer:send-progress` | 发送进度更新 | `progress` | `{ success }` |
| `transfer:receive-progress` | 接收进度更新 | `progress` | `{ success }` |
| `transfer:complete` | 传输完成通知 | `data` | `{ success }` |
| `transfer:error` | 传输错误通知 | `errorData` | `{ success }` |
| `transfer:cancel` | 取消传输 | 无 | `{ success }` |

**事件通知**:
- `transfer:progress-update` - 进度更新事件
- `transfer:complete` - 传输完成事件
- `transfer:error` - 传输错误事件
- `transfer:cancelled` - 传输取消事件

---

### 3. 系统相关处理器 (systemHandlers.js)

**提供的 IPC 通道**:

| 通道名称 | 功能 | 参数 | 返回值 |
|---------|------|------|--------|
| `system:get-version` | 获取应用版本信息 | 无 | `{ success, version, name, electron, chrome, node }` |
| `system:get-path` | 获取应用路径 | `name` | `{ success, path }` |
| `system:show-item-in-folder` | 在文件管理器中显示文件 | `fullPath` | `{ success }` |
| `system:open-external` | 在默认浏览器中打开 URL | `url` | `{ success }` |
| `config:get` | 获取配置项 | `key` | `{ success, value }` |
| `config:set` | 设置配置项 | `key, value` | `{ success }` |
| `config:get-all` | 获取所有配置 | 无 | `{ success, config }` |
| `config:reset` | 重置配置 | 无 | `{ success }` |
| `config:add-recent-file` | 添加最近使用的文件 | `filePath` | `{ success }` |
| `config:get-recent-files` | 获取最近使用的文件 | 无 | `{ success, files }` |
| `config:clear-recent-files` | 清除最近使用的文件 | 无 | `{ success }` |

---

## 应用生命周期

### 启动流程

1. **应用初始化**
   - 检查单实例锁定
   - 设置应用用户模型 ID（Windows）
   - 注册错误处理器

2. **应用就绪** (`app.whenReady()`)
   - 加载配置文件
   - 创建主窗口
   - 注册 IPC 处理器
   - 加载页面内容

3. **窗口显示**
   - 等待页面加载完成
   - 显示窗口

### 退出流程

1. **窗口关闭** (`window-all-closed`)
   - macOS: 不退出应用
   - 其他平台: 退出应用

2. **应用退出前** (`before-quit`)
   - 注销所有 IPC 处理器
   - 保存配置文件
   - 清理资源

---

## 安全特性

### 1. 上下文隔离 (Context Isolation)
- 渲染进程无法直接访问 Node.js API
- 通过 preload 脚本暴露安全的 API

### 2. 沙箱模式 (Sandbox)
- 限制渲染进程的系统访问权限
- 提高应用安全性

### 3. 禁用 Node.js 集成
- 渲染进程中禁用 `require()`
- 防止恶意代码执行

### 4. Web 安全
- 启用同源策略
- 禁止运行不安全内容

### 5. 单实例锁定
- 防止应用多开
- 聚焦到已存在的实例

---

## 错误处理

### 1. 渲染进程错误
- `crashed` - 渲染进程崩溃
- `unresponsive` - 渲染进程无响应
- `responsive` - 渲染进程恢复响应

### 2. 主进程错误
- `uncaughtException` - 未捕获的异常
- `unhandledRejection` - 未处理的 Promise 拒绝

### 3. IPC 错误
- 所有 IPC 处理器都包含 try-catch
- 返回统一的错误格式：`{ success: false, error: 'ERROR_CODE', message: 'error message' }`

---

## 开发建议

### 1. IPC 通信
- 使用 `ipcMain.handle()` 处理异步请求
- 使用 `webContents.send()` 发送事件通知
- 始终返回 `{ success, ... }` 格式的响应

### 2. 错误处理
- 所有异步操作都应包含错误处理
- 记录详细的错误日志
- 向用户显示友好的错误消息

### 3. 性能优化
- 避免在主进程中执行耗时操作
- 使用 Worker 线程处理 CPU 密集型任务
- 及时清理不再使用的资源

### 4. 安全性
- 验证所有来自渲染进程的输入
- 使用白名单验证文件路径
- 限制文件大小和类型

---

## 后续扩展

### 计划添加的功能
- [ ] 自动更新检查
- [ ] 日志系统
- [ ] 性能监控
- [ ] 崩溃报告
- [ ] 多语言支持
- [ ] 主题切换

---

**最后更新**: 2025-10-06 08:10

