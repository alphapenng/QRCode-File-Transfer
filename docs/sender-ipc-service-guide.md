# 发送端 IPC 服务使用指南

## 概述

`senderIPCService.js` 是发送端的核心服务模块，集成了所有发送端功能，提供统一的文件传输接口。

**文件位置**: `src/renderer/src/services/senderIPCService.js`

**主要功能**:
- 文件选择和验证
- 文件预处理（压缩、哈希）
- 数据分片
- 二维码生成
- 二维码播放
- 进度通知
- 状态管理

**集成的服务**:
- `fileService` - 文件选择
- `filePreprocessService` - 文件预处理
- `chunkService` - 数据分片
- `qrcodeService` - 二维码生成
- `qrcodePlayerService` - 二维码播放

---

## 📋 常量定义

### 传输状态

```javascript
export const TransferState = {
  IDLE: 'idle',                     // 空闲
  SELECTING: 'selecting',           // 选择文件中
  PREPROCESSING: 'preprocessing',   // 预处理中
  CHUNKING: 'chunking',             // 分片中
  GENERATING: 'generating',         // 生成二维码中
  PLAYING: 'playing',               // 播放中
  PAUSED: 'paused',                 // 暂停
  COMPLETED: 'completed',           // 完成
  ERROR: 'error',                   // 错误
  CANCELLED: 'cancelled'            // 取消
};
```

---

## 🔧 API 文档

### 发送端服务类

#### `SenderService`

发送端服务类，管理完整的文件传输流程。

**构造函数**:

```javascript
const sender = new SenderService(options);
```

**选项**:
- `maxFileSize` (number): 最大文件大小，默认 1048576 (1MB)
- `chunkSize` (number): 分片大小，默认 2048
- `qrCodeSpeed` (number): 二维码播放速度，默认 5
- `qrCodeErrorCorrectionLevel` (string): 纠错级别，默认 'M'

**使用示例**:

```javascript
import { SenderService } from '@/services/senderIPCService';

const sender = new SenderService({
  maxFileSize: 1048576,
  chunkSize: 2048,
  qrCodeSpeed: 5,
  qrCodeErrorCorrectionLevel: 'M'
});
```

---

#### `selectFile(options)`

选择文件。

**参数**:
- `options` (Object): 选项（可选）
  - `maxSize` (number): 最大文件大小
  - `allowedTypes` (Array): 允许的文件类型

**返回值**: `Promise<Object>`

```typescript
{
  success: boolean;
  file?: Object;
  error?: string;
  message?: string;
}
```

**使用示例**:

```javascript
const result = await sender.selectFile();

if (result.success) {
  console.log('选择的文件:', result.file);
}
```

---

#### `prepareTransfer()`

准备传输（预处理、分片、生成二维码）。

**返回值**: `Promise<Object>`

```typescript
{
  success: boolean;
  totalChunks?: number;
  totalQRCodes?: number;
  error?: string;
  message?: string;
}
```

**使用示例**:

```javascript
const result = await sender.prepareTransfer();

if (result.success) {
  console.log('准备完成');
  console.log('总分片数:', result.totalChunks);
  console.log('总二维码数:', result.totalQRCodes);
}
```

---

#### `startTransfer()`

开始传输。

**返回值**: `Object`

**使用示例**:

```javascript
const result = sender.startTransfer();

if (result.success) {
  console.log('传输开始');
}
```

---

#### `pauseTransfer()`

暂停传输。

**返回值**: `Object`

**使用示例**:

```javascript
const result = sender.pauseTransfer();

if (result.success) {
  console.log('传输已暂停');
}
```

---

#### `resumeTransfer()`

恢复传输。

**返回值**: `Object`

**使用示例**:

```javascript
const result = sender.resumeTransfer();

if (result.success) {
  console.log('传输已恢复');
}
```

---

#### `cancelTransfer()`

取消传输。

**返回值**: `Object`

**使用示例**:

```javascript
const result = sender.cancelTransfer();

if (result.success) {
  console.log('传输已取消');
}
```

---

#### `getState()`

获取当前状态。

**返回值**: `Object`

```typescript
{
  state: string;
  file: Object | null;
  stats: Object;
  playerState: Object | null;
}
```

**使用示例**:

```javascript
const state = sender.getState();

console.log('状态:', state.state);
console.log('文件:', state.file);
console.log('统计:', state.stats);
```

---

#### `on(event, callback)`

设置事件回调。

**参数**:
- `event` (string): 事件名称
  - `'stateChange'`: 状态变化
  - `'progress'`: 进度更新
  - `'complete'`: 传输完成
  - `'error'`: 错误
- `callback` (Function): 回调函数

**使用示例**:

```javascript
// 状态变化事件
sender.on('stateChange', (data) => {
  console.log('状态变化:', data.state);
});

// 进度事件
sender.on('progress', (data) => {
  console.log('阶段:', data.stage);
  console.log('消息:', data.message);
  console.log('进度:', data.progress + '%');
});

// 完成事件
sender.on('complete', (data) => {
  console.log('传输完成！');
  console.log('文件:', data.file);
  console.log('统计:', data.stats);
});

// 错误事件
sender.on('error', (data) => {
  console.error('错误:', data.error);
  console.error('消息:', data.message);
});
```

---

## 📝 完整使用示例

### 示例 1: 基本使用

```javascript
import { SenderService, TransferState } from '@/services/senderIPCService';

async function sendFile() {
  // 1. 创建发送端服务
  const sender = new SenderService({
    maxFileSize: 1048576,  // 1MB
    qrCodeSpeed: 5
  });
  
  // 2. 设置事件回调
  sender.on('stateChange', (data) => {
    console.log('状态:', data.state);
  });
  
  sender.on('progress', (data) => {
    console.log(`[${data.stage}] ${data.message} - ${data.progress}%`);
  });
  
  sender.on('complete', (data) => {
    console.log('传输完成！');
    console.log('耗时:', data.stats.duration + 'ms');
  });
  
  sender.on('error', (data) => {
    console.error('错误:', data.message);
  });
  
  // 3. 选择文件
  const selectResult = await sender.selectFile();
  
  if (!selectResult.success) {
    console.error('文件选择失败:', selectResult.message);
    return;
  }
  
  console.log('选择的文件:', selectResult.file.name);
  
  // 4. 准备传输
  const prepareResult = await sender.prepareTransfer();
  
  if (!prepareResult.success) {
    console.error('准备失败:', prepareResult.message);
    return;
  }
  
  console.log('准备完成，总二维码数:', prepareResult.totalQRCodes);
  
  // 5. 开始传输
  const startResult = sender.startTransfer();
  
  if (!startResult.success) {
    console.error('开始失败:', startResult.message);
    return;
  }
  
  console.log('传输开始');
}

// 执行
sendFile();
```

### 示例 2: 带 UI 的完整流程

```javascript
import { SenderService, TransferState } from '@/services/senderIPCService';

class SenderUI {
  constructor() {
    this.sender = new SenderService();
    this.setupEventListeners();
    this.setupSenderCallbacks();
  }
  
  setupEventListeners() {
    // 选择文件按钮
    document.getElementById('btn-select-file').addEventListener('click', async () => {
      await this.selectFile();
    });
    
    // 开始传输按钮
    document.getElementById('btn-start').addEventListener('click', () => {
      this.startTransfer();
    });
    
    // 暂停按钮
    document.getElementById('btn-pause').addEventListener('click', () => {
      this.sender.pauseTransfer();
    });
    
    // 恢复按钮
    document.getElementById('btn-resume').addEventListener('click', () => {
      this.sender.resumeTransfer();
    });
    
    // 取消按钮
    document.getElementById('btn-cancel').addEventListener('click', () => {
      this.sender.cancelTransfer();
    });
  }
  
  setupSenderCallbacks() {
    // 状态变化
    this.sender.on('stateChange', (data) => {
      this.updateUIState(data.state);
    });
    
    // 进度更新
    this.sender.on('progress', (data) => {
      this.updateProgress(data);
    });
    
    // 完成
    this.sender.on('complete', (data) => {
      this.showComplete(data);
    });
    
    // 错误
    this.sender.on('error', (data) => {
      this.showError(data);
    });
  }
  
  async selectFile() {
    const result = await this.sender.selectFile();
    
    if (result.success) {
      document.getElementById('file-name').textContent = result.file.name;
      document.getElementById('file-size').textContent = this.formatSize(result.file.size);
      document.getElementById('btn-start').disabled = false;
    }
  }
  
  async startTransfer() {
    // 准备传输
    const prepareResult = await this.sender.prepareTransfer();
    
    if (!prepareResult.success) {
      alert('准备失败: ' + prepareResult.message);
      return;
    }
    
    // 开始传输
    const startResult = this.sender.startTransfer();
    
    if (!startResult.success) {
      alert('开始失败: ' + startResult.message);
    }
  }
  
  updateUIState(state) {
    const btnStart = document.getElementById('btn-start');
    const btnPause = document.getElementById('btn-pause');
    const btnResume = document.getElementById('btn-resume');
    const btnCancel = document.getElementById('btn-cancel');
    
    switch (state) {
      case TransferState.PLAYING:
        btnStart.disabled = true;
        btnPause.disabled = false;
        btnResume.disabled = true;
        btnCancel.disabled = false;
        break;
      case TransferState.PAUSED:
        btnPause.disabled = true;
        btnResume.disabled = false;
        break;
      case TransferState.COMPLETED:
      case TransferState.CANCELLED:
        btnStart.disabled = false;
        btnPause.disabled = true;
        btnResume.disabled = true;
        btnCancel.disabled = true;
        break;
    }
  }
  
  updateProgress(data) {
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const statusText = document.getElementById('status-text');
    
    progressBar.style.width = data.progress + '%';
    progressText.textContent = Math.round(data.progress) + '%';
    statusText.textContent = data.message;
  }
  
  showComplete(data) {
    alert('传输完成！\n耗时: ' + (data.stats.duration / 1000).toFixed(2) + '秒');
  }
  
  showError(data) {
    alert('错误: ' + data.message);
  }
  
  formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / 1048576).toFixed(2) + ' MB';
  }
}

// 初始化
const senderUI = new SenderUI();
```

---

## 🔄 传输流程

### 完整流程图

```
1. 选择文件 (selectFile)
   ↓
2. 准备传输 (prepareTransfer)
   ├─ 预处理文件
   ├─ 创建分片
   └─ 生成二维码
   ↓
3. 开始传输 (startTransfer)
   ↓
4. 播放二维码
   ├─ 可暂停 (pauseTransfer)
   ├─ 可恢复 (resumeTransfer)
   └─ 可取消 (cancelTransfer)
   ↓
5. 传输完成
```

### 进度阶段

- **select**: 文件选择
- **preprocess**: 文件预处理
- **chunk**: 数据分片
- **generate**: 二维码生成
- **play**: 二维码播放
- **prepare**: 准备完成

---

## ⚠️ 注意事项

1. **文件大小限制**
   - 默认限制 1MB
   - 可通过选项调整

2. **内存管理**
   - 大文件会占用较多内存
   - 建议及时清理

3. **错误处理**
   - 监听 error 事件
   - 检查每个操作的返回值

4. **状态管理**
   - 检查状态后再执行操作
   - 使用 getState() 获取当前状态

---

**最后更新**: 2025-10-06 17:00

