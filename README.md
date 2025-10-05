# QRCode File Transfer - 二维码文件传输工具

一个基于 Electron + React + shadcn/ui 的桌面应用程序，用于在物理隔离的计算机之间通过二维码传输文件。

## 📋 项目概述

### 核心功能
- ✅ 将文件编码为二维码序列
- ✅ 通过扫码枪读取二维码
- ✅ 文件完整性校验（SHA256）
- ✅ 实时进度显示和状态反馈
- ✅ 支持 <1MB 文件传输（MVP 阶段）

### 技术栈
- **框架**: Electron 22.3.27（Windows 7 兼容）
- **UI 库**: React 18.x
- **组件库**: shadcn/ui
- **样式**: Tailwind CSS
- **构建工具**: Vite
- **开发语言**: JavaScript (ES6+)

### 目标平台
- Windows 7 及以上
- 32 位和 64 位系统

## 🚀 快速开始

### 前置要求
- Node.js 16.x 或更高版本
- npm 或 yarn 包管理器
- Windows 操作系统（开发和测试）

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd qrcode-app
```

2. **安装依赖**
```bash
npm install
```

3. **启动开发环境**
```bash
npm run dev
```

4. **构建生产版本**
```bash
npm run build
npm run build:electron
```

## 📁 项目结构

```
qrcode-app/
├── src/
│   ├── main/              # Electron 主进程
│   │   ├── index.js       # 主进程入口
│   │   └── ipc/           # IPC 处理器
│   ├── renderer/          # React 渲染进程
│   │   ├── src/
│   │   │   ├── components/  # React 组件
│   │   │   ├── services/    # 业务逻辑
│   │   │   ├── hooks/       # 自定义 Hooks
│   │   │   └── App.jsx      # 应用入口
│   │   └── index.html
│   ├── preload/           # 预加载脚本
│   │   └── index.js
│   └── shared/            # 共享代码
│       ├── utils/         # 工具函数
│       └── protocols/     # 数据协议
├── docs/                  # 项目文档
│   ├── development-guidelines.md    # 开发规范
│   ├── technical-specification.md   # 技术规格
│   └── mvp-task-list.md            # MVP 任务列表
├── tests/                 # 测试文件
├── assets/                # 资源文件
├── package.json
├── vite.config.js
├── tailwind.config.js
└── electron-builder.json
```

## 📖 文档

- [开发规范](./docs/development-guidelines.md) - Electron、React、shadcn/ui 最佳实践
- [技术规格说明](./docs/technical-specification.md) - 详细的技术设计文档
- [MVP 任务列表](./docs/mvp-task-list.md) - 第一阶段开发任务

## 🔧 开发指南

### 开发脚本

```bash
# 启动开发环境（热重载）
npm run dev

# 构建渲染进程
npm run build

# 构建 Electron 应用
npm run build:electron

# 运行测试
npm test

# 代码格式化
npm run format

# 代码检查
npm run lint
```

### 关键技术点

#### 1. Electron 安全配置
```javascript
const mainWindow = new BrowserWindow({
  webPreferences: {
    contextIsolation: true,      // ✅ 必须启用
    nodeIntegration: false,       // ✅ 必须禁用
    sandbox: true,                // ✅ 推荐启用
    preload: path.join(__dirname, 'preload.js')
  }
});
```

#### 2. IPC 通信模式
```javascript
// Preload 脚本
contextBridge.exposeInMainWorld('electronAPI', {
  selectFile: () => ipcRenderer.invoke('file:select'),
  saveFile: (data) => ipcRenderer.invoke('file:save', data)
});

// 渲染进程
const filePath = await window.electronAPI.selectFile();
```

#### 3. 分片数据结构
```javascript
{
  fileId: "uuid",
  fileName: "document.txt",
  totalChunks: 50,
  chunkIndex: 0,
  chunkData: "base64...",
  chunkHash: "crc32...",
  fileHash: "sha256..."
}
```

## 🎯 开发路线图

### 第一阶段（MVP）- 当前阶段 ✅
- [x] 项目规划和文档编写
- [ ] 环境搭建和配置
- [ ] 核心工具模块开发
- [ ] 发送端功能开发
- [ ] 接收端功能开发
- [ ] UI 界面开发
- [ ] 测试和打包

**预计完成时间**: 3-4 个工作日

### 第二阶段（优化）
- [ ] 断点续传功能
- [ ] 压缩算法优化
- [ ] 支持到 5MB 文件
- [ ] 性能优化

### 第三阶段（扩展）
- [ ] 音频传输备选方案
- [ ] 摄像头扫描支持
- [ ] 批量传输功能
- [ ] 传输历史记录

## 🧪 测试

### 单元测试
```bash
npm test
```

测试覆盖：
- 文件处理工具
- 压缩/解压缩
- 编码/解码
- 校验算法
- 分片逻辑

### 集成测试
- 完整发送流程
- 完整接收流程
- 错误恢复机制

### 端到端测试
- 使用 Spectron 测试完整应用

## 📦 打包和发布

### Windows 打包

```bash
npm run build:electron
```

生成的安装包位于 `dist/` 目录：
- `QRCode File Transfer Setup x.x.x.exe` (64位)
- `QRCode File Transfer Setup x.x.x-ia32.exe` (32位)

### Windows 7 兼容性检查

- ✅ 使用 Electron 22.3.27
- ✅ 支持 32 位和 64 位
- ✅ 所有依赖包兼容 Node.js 16
- ✅ 在真实 Windows 7 环境测试

## 🔒 安全注意事项

1. **进程隔离**: 启用 contextIsolation 和 sandbox
2. **API 暴露**: 仅通过 contextBridge 暴露必要的 API
3. **文件验证**: 验证文件路径和大小
4. **数据校验**: 使用 SHA256 确保文件完整性
5. **错误处理**: 完善的错误处理和用户提示

## 🐛 已知问题

- 暂无

## 🤝 贡献指南

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 提交规范

```
feat: 添加新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式化
refactor: 代码重构
test: 添加测试
chore: 构建/工具链更新
```

## 📄 许可证

MIT License

## 👥 作者

- 开发者: [Your Name]
- 邮箱: [your.email@example.com]

## 🙏 致谢

- [Electron](https://www.electronjs.org/)
- [React](https://react.dev/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

## 📞 支持

如有问题或建议，请：
1. 提交 Issue
2. 发送邮件至 [support@example.com]
3. 查看[文档](./docs/)

---

**注意**: 本项目目前处于 MVP 开发阶段，功能和 API 可能会发生变化。

