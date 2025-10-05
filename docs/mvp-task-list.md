# 第一阶段（MVP）任务列表

## 项目目标
实现支持 <1MB 文件的基本二维码传输功能，包括分片传输、校验和进度显示。

**技术栈**: Electron 22.3.27 + React + shadcn/ui + JavaScript
**目标平台**: Windows 7 及以上

---

## 任务概览

### 1.1 项目初始化和环境配置

#### 1.1.1 创建项目基础结构
- [ ] 初始化 npm 项目 (`npm init`)
- [ ] 创建目录结构：
  ```
  qrcode-app/
  ├── src/
  │   ├── main/          # 主进程
  │   ├── renderer/      # 渲染进程（React）
  │   ├── preload/       # 预加载脚本
  │   └── shared/        # 共享代码
  ├── docs/              # 文档
  ├── tests/             # 测试
  └── assets/            # 资源文件
  ```
- [ ] 创建 `.gitignore` 文件
- [ ] 初始化 Git 仓库

**预计时间**: 30分钟

---

#### 1.1.2 安装 Electron 和核心依赖
- [ ] 安装 Electron 22.3.27（Windows 7 兼容）
  ```bash
  npm install electron@22.3.27 --save-dev
  ```
- [ ] 安装 electron-builder
  ```bash
  npm install electron-builder --save-dev
  ```
- [ ] 安装开发工具
  ```bash
  npm install electron-devtools-installer --save-dev
  npm install concurrently wait-on cross-env --save-dev
  ```

**预计时间**: 20分钟

---

#### 1.1.3 配置 React 开发环境
- [ ] 安装 React 和 ReactDOM
  ```bash
  npm install react react-dom
  ```
- [ ] 选择并配置构建工具（Webpack 或 Vite）
  - 推荐 Vite（更快的开发体验）
  ```bash
  npm install vite @vitejs/plugin-react --save-dev
  ```
- [ ] 创建 `vite.config.js` 配置文件
- [ ] 配置热重载（HMR）
- [ ] 创建基础 React 应用结构

**预计时间**: 40分钟

---

#### 1.1.4 集成 shadcn/ui
- [ ] 安装 Tailwind CSS
  ```bash
  npm install -D tailwindcss postcss autoprefixer
  npx tailwindcss init -p
  ```
- [ ] 配置 `tailwind.config.js`
- [ ] 初始化 shadcn/ui
  ```bash
  npx shadcn@latest init
  ```
- [ ] 配置主题系统（CSS 变量）
- [ ] 创建 `globals.css` 并配置主题颜色

**预计时间**: 30分钟

---

#### 1.1.5 配置 Electron 主进程
- [ ] 创建 `src/main/index.js`
- [ ] 配置 BrowserWindow
  ```javascript
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,      // ✅ 安全
      nodeIntegration: false,       // ✅ 安全
      sandbox: true,                // ✅ 推荐
      preload: path.join(__dirname, '../preload/index.js')
    }
  });
  ```
- [ ] 配置应用生命周期事件
- [ ] 配置开发环境和生产环境的 URL 加载

**预计时间**: 30分钟

---

#### 1.1.6 创建 Preload 脚本
- [ ] 创建 `src/preload/index.js`
- [ ] 使用 contextBridge 暴露安全的 API
  ```javascript
  contextBridge.exposeInMainWorld('electronAPI', {
    selectFile: () => ipcRenderer.invoke('file:select'),
    saveFile: (data) => ipcRenderer.invoke('file:save', data),
    onProgress: (callback) => ipcRenderer.on('progress', callback)
  });
  ```

**预计时间**: 20分钟

---

#### 1.1.7 配置开发脚本
- [ ] 在 `package.json` 中配置脚本
  ```json
  {
    "scripts": {
      "dev": "concurrently \"vite\" \"wait-on http://localhost:5173 && electron .\"",
      "build": "vite build",
      "build:electron": "electron-builder",
      "start": "electron ."
    }
  }
  ```
- [ ] 测试开发环境启动

**预计时间**: 15分钟

---

### 1.2 核心工具模块开发

#### 1.2.1 文件处理工具
**文件**: `src/shared/utils/fileUtils.js`

- [ ] 实现文件读取函数
  ```javascript
  async function readFile(filePath) {
    // 返回 ArrayBuffer
  }
  ```
- [ ] 实现文件分片函数
  ```javascript
  function splitIntoChunks(data, chunkSize = 2048) {
    // 返回分片数组
  }
  ```
- [ ] 实现分片合并函数
  ```javascript
  function mergeChunks(chunks) {
    // 返回完整数据
  }
  ```
- [ ] 添加文件大小验证
- [ ] 添加文件类型检测

**预计时间**: 1小时

---

#### 1.2.2 压缩工具
**文件**: `src/shared/utils/compressionUtils.js`

- [ ] 安装 pako
  ```bash
  npm install pako
  ```
- [ ] 实现 gzip 压缩函数
  ```javascript
  function compress(data) {
    return pako.gzip(data);
  }
  ```
- [ ] 实现 gzip 解压缩函数
  ```javascript
  function decompress(data) {
    return pako.ungzip(data);
  }
  ```
- [ ] 添加错误处理

**预计时间**: 30分钟

---

#### 1.2.3 编码工具
**文件**: `src/shared/utils/encodingUtils.js`

- [ ] 实现 Base64 编码函数
  ```javascript
  function toBase64(arrayBuffer) {
    // ArrayBuffer -> Base64 字符串
  }
  ```
- [ ] 实现 Base64 解码函数
  ```javascript
  function fromBase64(base64String) {
    // Base64 字符串 -> ArrayBuffer
  }
  ```
- [ ] 处理特殊字符和 Unicode

**预计时间**: 30分钟

---

#### 1.2.4 校验工具
**文件**: `src/shared/utils/hashUtils.js`

- [ ] 安装 crypto-js
  ```bash
  npm install crypto-js
  ```
- [ ] 实现 CRC32 校验函数
  ```javascript
  function calculateCRC32(data) {
    // 返回 CRC32 校验和
  }
  ```
- [ ] 实现 SHA256 哈希函数
  ```javascript
  function calculateSHA256(data) {
    // 返回 SHA256 哈希值
  }
  ```
- [ ] 实现校验验证函数

**预计时间**: 40分钟

---

#### 1.2.5 二维码工具
**文件**: `src/shared/utils/qrcodeUtils.js`

- [ ] 安装 qrcode
  ```bash
  npm install qrcode
  ```
- [ ] 实现二维码生成函数
  ```javascript
  async function generateQRCode(data, options) {
    // 返回 Data URL
  }
  ```
- [ ] 优化纠错级别（推荐 M 级）
- [ ] 配置二维码尺寸和边距
- [ ] 添加性能优化（缓存）

**预计时间**: 40分钟

---

#### 1.2.6 分片协议设计
**文件**: `src/shared/protocols/chunkProtocol.js`

- [ ] 设计分片数据结构
  ```javascript
  {
    fileId: "uuid",           // 文件唯一标识
    fileName: "document.txt", // 原始文件名
    fileSize: 102400,         // 原始文件大小
    totalChunks: 50,          // 总分片数
    chunkIndex: 0,            // 当前分片索引
    chunkData: "base64...",   // 分片数据（Base64）
    chunkHash: "crc32...",    // 分片校验和
    fileHash: "sha256..."     // 文件完整哈希
  }
  ```
- [ ] 实现序列化函数
- [ ] 实现反序列化函数
- [ ] 添加版本控制字段

**预计时间**: 30分钟

---

### 1.3 发送端功能开发

#### 1.3.1 文件选择功能
**文件**: `src/main/ipc/fileHandlers.js`

- [ ] 实现文件选择 IPC 处理器
  ```javascript
  ipcMain.handle('file:select', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    return result.filePaths[0];
  });
  ```
- [ ] 添加文件大小验证（<1MB）
- [ ] 添加文件类型检查
- [ ] 返回文件元数据

**预计时间**: 30分钟

---

#### 1.3.2 文件预处理
**文件**: `src/renderer/src/services/fileProcessor.js`

- [ ] 实现文件处理流程
  ```javascript
  async function processFile(filePath) {
    // 1. 读取文件
    const fileData = await readFile(filePath);
    
    // 2. 压缩
    const compressed = compress(fileData);
    
    // 3. Base64 编码
    const encoded = toBase64(compressed);
    
    // 4. 计算哈希
    const hash = calculateSHA256(fileData);
    
    return { encoded, hash };
  }
  ```
- [ ] 添加进度回调
- [ ] 添加错误处理

**预计时间**: 40分钟

---

#### 1.3.3 数据分片
**文件**: `src/renderer/src/services/chunkService.js`

- [ ] 实现分片逻辑
  ```javascript
  function createChunks(processedData, fileMetadata) {
    const chunks = splitIntoChunks(processedData.encoded, 2048);
    
    return chunks.map((chunkData, index) => ({
      ...fileMetadata,
      totalChunks: chunks.length,
      chunkIndex: index,
      chunkData: chunkData,
      chunkHash: calculateCRC32(chunkData),
      fileHash: processedData.hash
    }));
  }
  ```
- [ ] 添加分片元数据
- [ ] 生成唯一文件 ID

**预计时间**: 30分钟

---

#### 1.3.4 二维码生成
**文件**: `src/renderer/src/services/qrcodeService.js`

- [ ] 实现批量二维码生成
  ```javascript
  async function generateQRCodes(chunks) {
    const qrCodes = [];
    for (const chunk of chunks) {
      const qrCode = await generateQRCode(
        JSON.stringify(chunk),
        { errorCorrectionLevel: 'M' }
      );
      qrCodes.push(qrCode);
    }
    return qrCodes;
  }
  ```
- [ ] 优化生成性能（使用 Web Worker）
- [ ] 添加进度回调

**预计时间**: 40分钟

---

#### 1.3.5 二维码播放器
**文件**: `src/renderer/src/components/QRCodePlayer.jsx`

- [ ] 实现自动播放组件
  ```javascript
  function QRCodePlayer({ qrCodes, speed = 200 }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    
    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentIndex(prev => 
          prev < qrCodes.length - 1 ? prev + 1 : prev
        );
      }, speed);
      
      return () => clearInterval(interval);
    }, [qrCodes, speed]);
    
    return <img src={qrCodes[currentIndex]} />;
  }
  ```
- [ ] 添加播放控制（播放/暂停/重置）
- [ ] 添加速度调节（5个/秒默认）
- [ ] 显示当前进度

**预计时间**: 1小时

---

#### 1.3.6 IPC 通信实现
**文件**: `src/main/ipc/transferHandlers.js`

- [ ] 实现文件传输 IPC 处理器
- [ ] 实现进度通知机制
- [ ] 添加错误处理和重试逻辑

**预计时间**: 30分钟

---

### 1.4 接收端功能开发

#### 1.4.1 扫码输入监听
**文件**: `src/renderer/src/services/scannerService.js`

- [ ] 实现键盘输入监听
  ```javascript
  function useScannerInput(onScan) {
    useEffect(() => {
      let buffer = '';
      let timeout;
      
      const handleKeyPress = (e) => {
        clearTimeout(timeout);
        
        if (e.key === 'Enter') {
          onScan(buffer);
          buffer = '';
        } else {
          buffer += e.key;
          timeout = setTimeout(() => buffer = '', 100);
        }
      };
      
      window.addEventListener('keypress', handleKeyPress);
      return () => window.removeEventListener('keypress', handleKeyPress);
    }, [onScan]);
  }
  ```
- [ ] 识别扫码枪输入模式
- [ ] 过滤非扫码输入

**预计时间**: 40分钟

---

#### 1.4.2 分片数据解析
**文件**: `src/renderer/src/services/chunkParser.js`

- [ ] 实现分片解析函数
  ```javascript
  function parseChunk(scannedData) {
    try {
      const chunk = JSON.parse(scannedData);
      
      // 验证格式
      if (!validateChunkFormat(chunk)) {
        throw new Error('Invalid chunk format');
      }
      
      // 验证 CRC32
      if (!verifyCRC32(chunk)) {
        throw new Error('CRC32 verification failed');
      }
      
      return chunk;
    } catch (error) {
      console.error('Parse error:', error);
      return null;
    }
  }
  ```
- [ ] 添加格式验证
- [ ] 添加 CRC32 校验

**预计时间**: 30分钟

---

#### 1.4.3 分片收集管理
**文件**: `src/renderer/src/services/chunkCollector.js`

- [ ] 实现分片收集器
  ```javascript
  class ChunkCollector {
    constructor() {
      this.chunks = new Map();
      this.metadata = null;
    }
    
    addChunk(chunk) {
      // 检查重复
      if (this.chunks.has(chunk.chunkIndex)) {
        return { duplicate: true };
      }
      
      // 保存分片
      this.chunks.set(chunk.chunkIndex, chunk);
      
      // 更新元数据
      if (!this.metadata) {
        this.metadata = {
          fileId: chunk.fileId,
          fileName: chunk.fileName,
          totalChunks: chunk.totalChunks
        };
      }
      
      return {
        received: this.chunks.size,
        total: chunk.totalChunks,
        complete: this.isComplete()
      };
    }
    
    isComplete() {
      return this.chunks.size === this.metadata?.totalChunks;
    }
    
    getMissingChunks() {
      // 返回缺失的分片索引
    }
  }
  ```
- [ ] 检测重复分片
- [ ] 检测缺失分片
- [ ] 维护收集状态

**预计时间**: 1小时

---

#### 1.4.4 文件重建
**文件**: `src/renderer/src/services/fileReconstructor.js`

- [ ] 实现文件重建函数
  ```javascript
  async function reconstructFile(chunks) {
    // 1. 按索引排序
    const sortedChunks = Array.from(chunks.values())
      .sort((a, b) => a.chunkIndex - b.chunkIndex);
    
    // 2. 合并分片数据
    const mergedData = sortedChunks
      .map(chunk => chunk.chunkData)
      .join('');
    
    // 3. Base64 解码
    const decoded = fromBase64(mergedData);
    
    // 4. 解压缩
    const decompressed = decompress(decoded);
    
    return decompressed;
  }
  ```
- [ ] 添加错误处理

**预计时间**: 40分钟

---

#### 1.4.5 文件校验
**文件**: `src/renderer/src/services/fileVerifier.js`

- [ ] 实现文件校验函数
  ```javascript
  function verifyFile(reconstructedData, expectedHash) {
    const actualHash = calculateSHA256(reconstructedData);
    return actualHash === expectedHash;
  }
  ```
- [ ] 添加校验失败处理

**预计时间**: 20分钟

---

#### 1.4.6 文件保存
**文件**: `src/main/ipc/fileSaveHandlers.js`

- [ ] 实现文件保存 IPC 处理器
  ```javascript
  ipcMain.handle('file:save', async (event, { data, fileName }) => {
    const result = await dialog.showSaveDialog({
      defaultPath: fileName,
      filters: [
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    
    if (!result.canceled) {
      await fs.writeFile(result.filePath, data);
      return { success: true, path: result.filePath };
    }
  });
  ```
- [ ] 添加保存成功/失败通知

**预计时间**: 30分钟

---

### 1.5 UI 界面开发

#### 1.5.1 安装 shadcn/ui 组件
- [ ] 安装所需组件
  ```bash
  npx shadcn@latest add button
  npx shadcn@latest add progress
  npx shadcn@latest add card
  npx shadcn@latest add tabs
  npx shadcn@latest add alert
  npx shadcn@latest add badge
  npx shadcn@latest add toast
  ```

**预计时间**: 15分钟

---

#### 1.5.2 布局设计
**文件**: `src/renderer/src/App.jsx`

- [ ] 设计主界面布局
- [ ] 实现发送/接收模式切换（Tabs）
- [ ] 添加应用标题和版本信息

**预计时间**: 30分钟

---

#### 1.5.3 发送端 UI
**文件**: `src/renderer/src/components/Sender.jsx`

- [ ] 文件选择按钮和文件信息显示
- [ ] 二维码显示区域
- [ ] 播放控制按钮（播放/暂停/重置）
- [ ] 速度调节滑块

**预计时间**: 1小时

---

#### 1.5.4 接收端 UI
**文件**: `src/renderer/src/components/Receiver.jsx`

- [ ] 扫码状态指示器
- [ ] 分片收集进度显示
- [ ] 文件信息展示（文件名、大小、进度）
- [ ] 保存按钮

**预计时间**: 1小时

---

#### 1.5.5 进度显示组件
**文件**: `src/renderer/src/components/ProgressDisplay.jsx`

- [ ] 进度条组件
- [ ] 显示当前分片/总分片
- [ ] 显示百分比
- [ ] 显示预计剩余时间

**预计时间**: 40分钟

---

#### 1.5.6 状态反馈组件
**文件**: `src/renderer/src/components/StatusFeedback.jsx`

- [ ] 成功提示组件
- [ ] 错误提示组件
- [ ] 警告提示组件
- [ ] 集成 Toast 通知

**预计时间**: 30分钟

---

### 1.6 测试和打包

#### 1.6.1 单元测试
- [ ] 安装 Jest
  ```bash
  npm install --save-dev jest @types/jest
  ```
- [ ] 编写压缩工具测试
- [ ] 编写编码工具测试
- [ ] 编写校验工具测试
- [ ] 编写分片工具测试

**预计时间**: 2小时

---

#### 1.6.2 集成测试
- [ ] 测试完整发送流程
- [ ] 测试完整接收流程
- [ ] 测试文件校验流程

**预计时间**: 1小时

---

#### 1.6.3 边界条件测试
- [ ] 测试极小文件（<1KB）
- [ ] 测试极大文件（接近1MB）
- [ ] 测试特殊字符文件名
- [ ] 测试不同文件类型

**预计时间**: 1小时

---

#### 1.6.4 错误处理测试
- [ ] 模拟分片丢失
- [ ] 模拟校验失败
- [ ] 模拟中断传输
- [ ] 测试错误恢复机制

**预计时间**: 1小时

---

#### 1.6.5 配置 electron-builder
**文件**: `electron-builder.json`

- [ ] 配置 Windows 打包选项
  ```json
  {
    "appId": "com.qrcode.filetransfer",
    "productName": "QRCode File Transfer",
    "directories": {
      "output": "dist"
    },
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": ["x64", "ia32"]
        }
      ],
      "icon": "assets/icon.ico"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true
    }
  }
  ```
- [ ] 设置应用图标
- [ ] 配置应用元数据

**预计时间**: 30分钟

---

#### 1.6.6 打包和发布
- [ ] 生成 Windows 安装包
  ```bash
  npm run build:electron
  ```
- [ ] 在 Windows 7 上测试安装
- [ ] 测试应用运行
- [ ] 验证所有功能正常

**预计时间**: 1小时

---

## 总预计时间

- **1.1 项目初始化**: ~3小时
- **1.2 核心工具模块**: ~4.5小时
- **1.3 发送端功能**: ~4小时
- **1.4 接收端功能**: ~4小时
- **1.5 UI 界面开发**: ~4小时
- **1.6 测试和打包**: ~6.5小时

**总计**: 约 26 小时（3-4个工作日）

---

## 关键里程碑

1. ✅ 环境搭建完成（1.1）
2. ✅ 核心工具开发完成（1.2）
3. ✅ 发送功能可用（1.3）
4. ✅ 接收功能可用（1.4）
5. ✅ UI 完整可用（1.5）
6. ✅ 测试通过并打包（1.6）

---

## 下一步计划

完成 MVP 后，进入第二阶段（优化）：
- 增加断点续传
- 优化压缩算法
- 支持到 5MB

