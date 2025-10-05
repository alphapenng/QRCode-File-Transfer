# 源代码目录结构说明

## 目录结构

```
src/
├── main/              # Electron 主进程
│   ├── index.js       # 主进程入口文件
│   └── ipc/           # IPC 通信处理器
│       ├── fileHandlers.js      # 文件操作处理器
│       ├── transferHandlers.js  # 传输处理器
│       └── fileSaveHandlers.js  # 文件保存处理器
│
├── renderer/          # React 渲染进程
│   ├── src/
│   │   ├── components/  # React 组件
│   │   │   ├── Sender.jsx           # 发送端组件
│   │   │   ├── Receiver.jsx         # 接收端组件
│   │   │   ├── QRCodePlayer.jsx     # 二维码播放器
│   │   │   ├── ProgressDisplay.jsx  # 进度显示
│   │   │   └── StatusFeedback.jsx   # 状态反馈
│   │   │
│   │   ├── services/    # 业务逻辑服务
│   │   │   ├── fileProcessor.js     # 文件处理服务
│   │   │   ├── chunkService.js      # 分片服务
│   │   │   ├── qrcodeService.js     # 二维码服务
│   │   │   ├── scannerService.js    # 扫描服务
│   │   │   ├── chunkParser.js       # 分片解析
│   │   │   ├── chunkCollector.js    # 分片收集器
│   │   │   ├── fileReconstructor.js # 文件重建
│   │   │   └── fileVerifier.js      # 文件校验
│   │   │
│   │   ├── hooks/       # 自定义 React Hooks
│   │   │   ├── useFileTransfer.js   # 文件传输 Hook
│   │   │   ├── useScannerInput.js   # 扫码输入 Hook
│   │   │   └── useProgress.js       # 进度管理 Hook
│   │   │
│   │   ├── utils/       # 渲染进程工具函数
│   │   │   └── helpers.js
│   │   │
│   │   └── App.jsx      # React 应用入口
│   │
│   └── index.html       # HTML 入口文件
│
├── preload/           # 预加载脚本
│   └── index.js       # Preload 脚本（contextBridge API）
│
└── shared/            # 主进程和渲染进程共享代码
    ├── utils/         # 共享工具函数
    │   ├── fileUtils.js         # 文件处理工具
    │   ├── compressionUtils.js  # 压缩工具
    │   ├── encodingUtils.js     # 编码工具
    │   ├── hashUtils.js         # 校验工具
    │   └── qrcodeUtils.js       # 二维码工具
    │
    └── protocols/     # 数据协议定义
        └── chunkProtocol.js     # 分片协议
```

## 模块职责

### 主进程 (main/)
- 创建和管理应用窗口
- 处理文件系统操作
- 管理应用生命周期
- 处理 IPC 请求

### 渲染进程 (renderer/)
- 运行 React 应用
- 处理用户交互
- 生成和显示二维码
- 处理扫码输入

### 预加载脚本 (preload/)
- 安全地暴露 API 给渲染进程
- 桥接主进程和渲染进程

### 共享代码 (shared/)
- 可在主进程和渲染进程中使用的工具函数
- 数据协议定义

## 开发规范

1. **主进程代码** 只能访问 Node.js API 和 Electron 主进程 API
2. **渲染进程代码** 不能直接访问 Node.js API，必须通过 IPC 通信
3. **预加载脚本** 使用 `contextBridge` 暴露安全的 API
4. **共享代码** 不能包含进程特定的 API 调用

## 文件命名规范

- **组件文件**: PascalCase (例如: `Sender.jsx`)
- **工具文件**: camelCase (例如: `fileUtils.js`)
- **服务文件**: camelCase (例如: `fileProcessor.js`)
- **Hook 文件**: camelCase with 'use' prefix (例如: `useFileTransfer.js`)

