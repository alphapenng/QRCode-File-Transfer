# 二维码文件传输软件 - 技术规格说明书

## 1. 项目概述

### 1.1 项目名称
QRCode File Transfer（二维码文件传输工具）

### 1.2 项目描述
一个基于 Electron 的桌面应用程序，用于在物理隔离的计算机之间通过二维码传输文件。

### 1.3 核心功能
- 文件编码为二维码序列
- 通过扫码枪读取二维码
- 文件完整性校验
- 进度显示和状态反馈

### 1.4 技术栈
- **框架**: Electron 22.3.27（Windows 7 兼容）
- **UI 库**: React 18.x
- **组件库**: shadcn/ui
- **样式**: Tailwind CSS
- **构建工具**: Vite
- **开发语言**: JavaScript (ES6+)

---

## 2. 系统架构

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                    Electron 应用                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐         ┌──────────────┐             │
│  │  主进程       │◄───────►│  渲染进程     │             │
│  │  (Main)      │   IPC   │  (Renderer)  │             │
│  └──────────────┘         └──────────────┘             │
│        │                         │                      │
│        │                         │                      │
│  ┌──────────────┐         ┌──────────────┐             │
│  │  文件系统     │         │  React UI    │             │
│  │  对话框       │         │  shadcn/ui   │             │
│  └──────────────┘         └──────────────┘             │
│                                                          │
└─────────────────────────────────────────────────────────┘
         │                           │
         │                           │
    ┌────▼────┐                 ┌───▼────┐
    │ 文件输入 │                 │ 扫码枪  │
    └─────────┘                 └────────┘
```

### 2.2 进程模型

#### 主进程 (Main Process)
- **职责**:
  - 创建和管理窗口
  - 处理文件系统操作
  - 管理应用生命周期
  - 处理 IPC 请求

#### 渲染进程 (Renderer Process)
- **职责**:
  - 运行 React 应用
  - 处理用户交互
  - 生成和显示二维码
  - 处理扫码输入

#### 预加载脚本 (Preload Script)
- **职责**:
  - 安全地暴露 API 给渲染进程
  - 桥接主进程和渲染进程

---

## 3. 数据流程

### 3.1 发送端流程

```
文件选择
    ↓
读取文件 (ArrayBuffer)
    ↓
压缩 (gzip)
    ↓
Base64 编码
    ↓
计算 SHA256 哈希
    ↓
数据分片 (2KB/片)
    ↓
添加分片元数据
    ↓
生成二维码序列
    ↓
自动播放二维码
```

### 3.2 接收端流程

```
监听扫码枪输入
    ↓
解析分片数据
    ↓
验证 CRC32 校验
    ↓
收集分片
    ↓
检查完整性
    ↓
合并分片
    ↓
Base64 解码
    ↓
解压缩 (gzip)
    ↓
验证 SHA256 哈希
    ↓
保存文件
```

---

## 4. 核心模块设计

### 4.1 文件处理模块 (fileUtils.js)

```javascript
/**
 * 读取文件
 * @param {string} filePath - 文件路径
 * @returns {Promise<ArrayBuffer>} 文件数据
 */
async function readFile(filePath)

/**
 * 分片数据
 * @param {ArrayBuffer} data - 原始数据
 * @param {number} chunkSize - 分片大小（字节）
 * @returns {Array<ArrayBuffer>} 分片数组
 */
function splitIntoChunks(data, chunkSize = 2048)

/**
 * 合并分片
 * @param {Array<ArrayBuffer>} chunks - 分片数组
 * @returns {ArrayBuffer} 合并后的数据
 */
function mergeChunks(chunks)
```

### 4.2 压缩模块 (compressionUtils.js)

```javascript
/**
 * 压缩数据
 * @param {ArrayBuffer} data - 原始数据
 * @returns {Uint8Array} 压缩后的数据
 */
function compress(data)

/**
 * 解压缩数据
 * @param {Uint8Array} data - 压缩数据
 * @returns {ArrayBuffer} 解压后的数据
 */
function decompress(data)
```

### 4.3 编码模块 (encodingUtils.js)

```javascript
/**
 * ArrayBuffer 转 Base64
 * @param {ArrayBuffer} buffer - 二进制数据
 * @returns {string} Base64 字符串
 */
function toBase64(buffer)

/**
 * Base64 转 ArrayBuffer
 * @param {string} base64 - Base64 字符串
 * @returns {ArrayBuffer} 二进制数据
 */
function fromBase64(base64)
```

### 4.4 校验模块 (hashUtils.js)

```javascript
/**
 * 计算 CRC32 校验和
 * @param {string|ArrayBuffer} data - 数据
 * @returns {string} CRC32 值
 */
function calculateCRC32(data)

/**
 * 计算 SHA256 哈希
 * @param {ArrayBuffer} data - 数据
 * @returns {string} SHA256 哈希值
 */
function calculateSHA256(data)

/**
 * 验证校验和
 * @param {string|ArrayBuffer} data - 数据
 * @param {string} expectedHash - 期望的哈希值
 * @returns {boolean} 是否匹配
 */
function verifyHash(data, expectedHash)
```

### 4.5 二维码模块 (qrcodeUtils.js)

```javascript
/**
 * 生成二维码
 * @param {string} data - 要编码的数据
 * @param {Object} options - 配置选项
 * @returns {Promise<string>} Data URL
 */
async function generateQRCode(data, options = {})

// 默认配置
const DEFAULT_OPTIONS = {
  errorCorrectionLevel: 'M',  // L, M, Q, H
  type: 'image/png',
  quality: 0.92,
  margin: 1,
  width: 400
}
```

---

## 5. 分片协议设计

### 5.1 分片数据结构

```javascript
{
  // 协议版本
  version: "1.0",
  
  // 文件标识
  fileId: "uuid-v4",
  fileName: "document.txt",
  fileSize: 102400,
  fileType: "text/plain",
  
  // 分片信息
  totalChunks: 50,
  chunkIndex: 0,
  chunkSize: 2048,
  
  // 数据
  chunkData: "base64_encoded_data...",
  
  // 校验
  chunkHash: "crc32_checksum",
  fileHash: "sha256_hash",
  
  // 时间戳
  timestamp: 1234567890
}
```

### 5.2 数据大小计算

**单个二维码容量**:
- QR Code Version 40 (177×177)
- 纠错级别 M: ~2,953 字节
- 实际可用: ~2,048 字节（考虑元数据）

**1MB 文件所需二维码数量**:
```
原始大小: 1,048,576 字节
压缩后 (假设 50% 压缩率): 524,288 字节
Base64 编码后 (增加 33%): 697,717 字节
分片数量: 697,717 / 2,048 ≈ 341 个二维码
```

**传输时间估算**:
```
扫描速度: 5 个/秒
总时间: 341 / 5 ≈ 68 秒 ≈ 1.1 分钟
```

---

## 6. IPC 通信协议

### 6.1 主进程 -> 渲染进程

```javascript
// 进度更新
mainWindow.webContents.send('progress:update', {
  current: 10,
  total: 100,
  percentage: 10
});

// 错误通知
mainWindow.webContents.send('error', {
  message: 'File read error',
  code: 'FILE_READ_ERROR'
});
```

### 6.2 渲染进程 -> 主进程

```javascript
// 文件选择
const filePath = await window.electronAPI.selectFile();

// 文件保存
const result = await window.electronAPI.saveFile({
  data: arrayBuffer,
  fileName: 'document.txt'
});
```

---

## 7. UI 组件设计

### 7.1 主界面布局

```
┌─────────────────────────────────────────────┐
│  QRCode File Transfer                  v1.0 │
├─────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐                  │
│  │  发送   │  │  接收   │  ← Tabs          │
│  └─────────┘  └─────────┘                  │
├─────────────────────────────────────────────┤
│                                             │
│  [发送端内容区域]                            │
│                                             │
│  或                                         │
│                                             │
│  [接收端内容区域]                            │
│                                             │
├─────────────────────────────────────────────┤
│  状态栏: 就绪                                │
└─────────────────────────────────────────────┘
```

### 7.2 发送端界面

```
┌─────────────────────────────────────────────┐
│  文件信息                                    │
│  ┌─────────────────────────────────────┐   │
│  │  文件名: document.txt                │   │
│  │  大小: 512 KB                        │   │
│  │  类型: text/plain                    │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [选择文件]                                 │
│                                             │
│  二维码显示                                  │
│  ┌─────────────────────────────────────┐   │
│  │                                     │   │
│  │         [QR Code Image]             │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  进度: 10 / 341 (2.9%)                      │
│  ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░      │
│                                             │
│  [播放] [暂停] [重置]  速度: [5 个/秒]      │
└─────────────────────────────────────────────┘
```

### 7.3 接收端界面

```
┌─────────────────────────────────────────────┐
│  扫码状态: 等待扫描...                       │
│                                             │
│  文件信息                                    │
│  ┌─────────────────────────────────────┐   │
│  │  文件名: document.txt                │   │
│  │  大小: 512 KB                        │   │
│  │  已接收: 10 / 341 分片               │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  接收进度                                    │
│  ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░      │
│  2.9% (预计剩余: 1 分钟)                    │
│                                             │
│  缺失分片: 无                                │
│                                             │
│  [保存文件] (完成后可用)                     │
└─────────────────────────────────────────────┘
```

---

## 8. 错误处理

### 8.1 错误类型

```javascript
const ErrorTypes = {
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  FILE_READ_ERROR: 'FILE_READ_ERROR',
  COMPRESSION_ERROR: 'COMPRESSION_ERROR',
  ENCODING_ERROR: 'ENCODING_ERROR',
  CHUNK_PARSE_ERROR: 'CHUNK_PARSE_ERROR',
  CHECKSUM_MISMATCH: 'CHECKSUM_MISMATCH',
  FILE_SAVE_ERROR: 'FILE_SAVE_ERROR'
};
```

### 8.2 错误处理策略

| 错误类型 | 处理策略 |
|---------|---------|
| 文件过大 | 提示用户，拒绝处理 |
| 文件读取失败 | 显示错误，允许重试 |
| 压缩失败 | 显示错误，允许重试 |
| 分片解析失败 | 忽略该分片，继续接收 |
| 校验和不匹配 | 标记为错误分片，允许重传 |
| 文件保存失败 | 显示错误，允许重新选择路径 |

---

## 9. 性能优化

### 9.1 二维码生成优化
- 使用 Web Worker 并行生成
- 缓存已生成的二维码
- 按需生成（懒加载）

### 9.2 内存优化
- 使用流式处理大文件
- 及时释放不需要的数据
- 限制同时生成的二维码数量

### 9.3 UI 优化
- 使用虚拟滚动显示大量二维码
- 防抖和节流用户输入
- 使用 React.memo 避免不必要的重渲染

---

## 10. 安全考虑

### 10.1 Electron 安全配置

```javascript
const mainWindow = new BrowserWindow({
  webPreferences: {
    contextIsolation: true,      // ✅ 必须
    nodeIntegration: false,       // ✅ 必须
    sandbox: true,                // ✅ 推荐
    webSecurity: true,            // ✅ 必须
    allowRunningInsecureContent: false,  // ✅ 必须
    preload: path.join(__dirname, 'preload.js')
  }
});
```

### 10.2 文件安全
- 验证文件路径，防止路径遍历
- 限制文件大小
- 文件类型白名单（可选）

### 10.3 数据安全
- 不在日志中记录敏感数据
- 传输完成后清理临时数据
- 使用安全的随机数生成器（UUID）

---

## 11. 测试策略

### 11.1 单元测试
- 工具函数测试（压缩、编码、校验）
- 分片逻辑测试
- 数据解析测试

### 11.2 集成测试
- 完整发送流程测试
- 完整接收流程测试
- 错误恢复测试

### 11.3 端到端测试
- 使用 Spectron 测试完整应用流程
- 模拟用户操作
- 验证最终结果

---

## 12. 部署和打包

### 12.1 打包配置

```json
{
  "appId": "com.qrcode.filetransfer",
  "productName": "QRCode File Transfer",
  "win": {
    "target": ["nsis"],
    "arch": ["x64", "ia32"]
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true,
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true
  }
}
```

### 12.2 Windows 7 兼容性检查清单
- [ ] 使用 Electron 22.x
- [ ] 测试 32 位和 64 位版本
- [ ] 验证所有依赖包兼容性
- [ ] 在真实 Windows 7 环境测试

---

## 13. 版本规划

### v1.0 (MVP)
- ✅ 支持 <1MB 文件
- ✅ 基本二维码传输
- ✅ 文件校验
- ✅ 进度显示

### v1.1 (优化)
- 断点续传
- 压缩算法优化
- 支持到 5MB

### v1.2 (扩展)
- 音频传输备选方案
- 摄像头扫描支持
- 批量传输

---

## 14. 附录

### 14.1 依赖包列表

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "pako": "^2.1.0",
    "qrcode": "^1.5.3",
    "crypto-js": "^4.2.0",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "electron": "22.3.27",
    "electron-builder": "^24.0.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "tailwindcss": "^3.4.0",
    "jest": "^29.0.0"
  }
}
```

### 14.2 参考资料
- [Electron 官方文档](https://www.electronjs.org/docs)
- [React 官方文档](https://react.dev)
- [shadcn/ui 文档](https://ui.shadcn.com)
- [QR Code 规范](https://www.qrcode.com/en/about/standards.html)

