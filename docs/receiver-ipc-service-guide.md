# 接收端 IPC 服务使用指南

## 概述

`receiverIPCService.js` 是接收端的核心服务模块，集成了扫描器和接收器，提供统一的文件接收接口。

**文件位置**: `src/renderer/src/services/receiverIPCService.js`

**主要功能**:
- 扫描器和接收器集成
- 完整的文件接收流程
- 进度通知
- 状态管理
- 文件重建

**集成的服务**:
- `qrcodeScannerService` - 二维码扫描
- `dataReceiverService` - 数据接收

---

## 📋 常量定义

### 接收状态

```javascript
export const ReceiveState = {
  IDLE: 'idle',                     // 空闲
  INITIALIZING: 'initializing',     // 初始化中
  SCANNING: 'scanning',             // 扫描中
  RECEIVING: 'receiving',           // 接收中
  PAUSED: 'paused',                 // 暂停
  COMPLETED: 'completed',           // 完成
  ERROR: 'error',                   // 错误
  CANCELLED: 'cancelled'            // 取消
};
```

---

## 🔧 API 文档

### 接收端服务类

#### `ReceiverService`

接收端服务类，管理完整的文件接收流程。

**构造函数**:

```javascript
const receiver = new ReceiverService(options);
```

**选项**:
- `scanInterval` (number): 扫描间隔（毫秒），默认 100
- `autoValidate` (boolean): 是否自动验证分片，默认 true

**使用示例**:

```javascript
import { ReceiverService } from '@/services/receiverIPCService';

const receiver = new ReceiverService({
  scanInterval: 100,
  autoValidate: true
});
```

---

#### `initialize(videoElement, canvasElement)`

初始化接收器。

**参数**:
- `videoElement` (HTMLVideoElement): 视频元素
- `canvasElement` (HTMLCanvasElement): Canvas 元素（可选）

**返回值**: `Object`

```typescript
{
  success: boolean;
  error?: string;
  message?: string;
}
```

**使用示例**:

```javascript
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');

const result = receiver.initialize(video, canvas);

if (result.success) {
  console.log('接收器初始化成功');
}
```

---

#### `start()`

开始接收。

**返回值**: `Promise<Object>`

```typescript
{
  success: boolean;
  error?: string;
  message?: string;
}
```

**使用示例**:

```javascript
const result = await receiver.start();

if (result.success) {
  console.log('开始接收');
}
```

---

#### `pause()`

暂停接收。

**返回值**: `Object`

**使用示例**:

```javascript
const result = receiver.pause();

if (result.success) {
  console.log('接收已暂停');
}
```

---

#### `resume()`

恢复接收。

**返回值**: `Object`

**使用示例**:

```javascript
const result = receiver.resume();

if (result.success) {
  console.log('接收已恢复');
}
```

---

#### `cancel()`

取消接收。

**返回值**: `Object`

**使用示例**:

```javascript
const result = receiver.cancel();

if (result.success) {
  console.log('接收已取消');
}
```

---

#### `getState()`

获取当前状态。

**返回值**: `Object`

```typescript
{
  state: string;
  scannerState: Object | null;
  receiverState: Object | null;
  stats: Object;
}
```

**使用示例**:

```javascript
const state = receiver.getState();

console.log('状态:', state.state);
console.log('扫描器状态:', state.scannerState);
console.log('接收器状态:', state.receiverState);
console.log('统计:', state.stats);
```

---

#### `getProgress()`

获取接收进度。

**返回值**: `Object`

```typescript
{
  received: number;
  total: number;
  progress: string;
  isComplete: boolean;
}
```

**使用示例**:

```javascript
const progress = receiver.getProgress();

console.log('已接收:', progress.received);
console.log('总数:', progress.total);
console.log('进度:', progress.progress);
console.log('是否完成:', progress.isComplete);
```

---

#### `on(event, callback)`

设置事件回调。

**参数**:
- `event` (string): 事件名称
  - `'stateChange'`: 状态变化
  - `'progress'`: 进度更新
  - `'complete'`: 接收完成
  - `'error'`: 错误
- `callback` (Function): 回调函数

**使用示例**:

```javascript
// 状态变化事件
receiver.on('stateChange', (data) => {
  console.log('状态变化:', data.state);
});

// 进度事件
receiver.on('progress', (data) => {
  console.log('阶段:', data.stage);
  console.log('消息:', data.message);
  console.log('进度:', data.progress);
});

// 完成事件
receiver.on('complete', (data) => {
  console.log('接收完成！');
  console.log('文件信息:', data.fileInfo);
  console.log('文件数据:', data.data);
  console.log('统计:', data.stats);
});

// 错误事件
receiver.on('error', (data) => {
  console.error('错误:', data.error);
  console.error('消息:', data.message);
});
```

---

## 📝 完整使用示例

### 示例 1: 基本使用

```javascript
import { ReceiverService } from '@/services/receiverIPCService';

async function receiveFile() {
  // 1. 创建接收端服务
  const receiver = new ReceiverService({
    scanInterval: 100,
    autoValidate: true
  });
  
  // 2. 设置事件回调
  receiver.on('stateChange', (data) => {
    console.log('状态:', data.state);
  });
  
  receiver.on('progress', (data) => {
    console.log(`[${data.stage}] ${data.message}`);
    if (data.index !== undefined) {
      console.log(`进度: ${data.index + 1}/${data.total} (${data.progress})`);
    }
  });
  
  receiver.on('complete', (data) => {
    console.log('接收完成！');
    console.log('文件名:', data.fileInfo.name);
    console.log('文件大小:', data.fileInfo.size);
    
    // 保存文件
    saveFile(data.data, data.fileInfo);
  });
  
  receiver.on('error', (data) => {
    console.error('接收错误:', data.message);
  });
  
  // 3. 初始化接收器
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  
  const initResult = receiver.initialize(video, canvas);
  
  if (!initResult.success) {
    console.error('初始化失败:', initResult.message);
    return;
  }
  
  // 4. 开始接收
  const startResult = await receiver.start();
  
  if (!startResult.success) {
    console.error('开始失败:', startResult.message);
  }
}

function saveFile(data, fileInfo) {
  // 使用 Electron IPC 保存文件
  window.electronAPI.file.save(data, fileInfo.name);
}

// 执行
receiveFile();
```

### 示例 2: 带 UI 的完整流程

```javascript
import { ReceiverService, ReceiveState } from '@/services/receiverIPCService';

class ReceiverUI {
  constructor() {
    this.receiver = new ReceiverService();
    this.setupEventListeners();
    this.setupReceiverCallbacks();
  }
  
  setupEventListeners() {
    // 开始按钮
    document.getElementById('btn-start').addEventListener('click', async () => {
      await this.startReceiving();
    });
    
    // 暂停按钮
    document.getElementById('btn-pause').addEventListener('click', () => {
      this.receiver.pause();
    });
    
    // 恢复按钮
    document.getElementById('btn-resume').addEventListener('click', () => {
      this.receiver.resume();
    });
    
    // 取消按钮
    document.getElementById('btn-cancel').addEventListener('click', () => {
      this.receiver.cancel();
    });
  }
  
  setupReceiverCallbacks() {
    // 状态变化
    this.receiver.on('stateChange', (data) => {
      this.updateUIState(data.state);
    });
    
    // 进度更新
    this.receiver.on('progress', (data) => {
      this.updateProgress(data);
    });
    
    // 完成
    this.receiver.on('complete', (data) => {
      this.handleComplete(data);
    });
    
    // 错误
    this.receiver.on('error', (data) => {
      this.showError(data);
    });
  }
  
  async startReceiving() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    
    // 初始化
    const initResult = this.receiver.initialize(video, canvas);
    
    if (!initResult.success) {
      alert('初始化失败: ' + initResult.message);
      return;
    }
    
    // 开始接收
    const startResult = await this.receiver.start();
    
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
      case ReceiveState.RECEIVING:
        btnStart.disabled = true;
        btnPause.disabled = false;
        btnResume.disabled = true;
        btnCancel.disabled = false;
        break;
      case ReceiveState.PAUSED:
        btnPause.disabled = true;
        btnResume.disabled = false;
        break;
      case ReceiveState.COMPLETED:
      case ReceiveState.CANCELLED:
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
    
    if (data.progress) {
      progressBar.style.width = data.progress;
      progressText.textContent = data.progress;
    }
    
    statusText.textContent = data.message;
  }
  
  handleComplete(data) {
    alert('接收完成！\n文件名: ' + data.fileInfo.name);
    
    // 保存文件
    this.saveFile(data.data, data.fileInfo);
  }
  
  showError(data) {
    alert('错误: ' + data.message);
  }
  
  saveFile(data, fileInfo) {
    // 使用 Electron IPC 保存文件
    window.electronAPI.file.save(data, fileInfo.name);
  }
}

// 初始化
const receiverUI = new ReceiverUI();
```

---

## 🔄 接收流程

### 完整流程图

```
1. 初始化 (initialize)
   ├─ 创建扫描器
   └─ 创建接收器
   ↓
2. 开始接收 (start)
   ├─ 启动扫描器
   └─ 启动接收器
   ↓
3. 扫描二维码
   ↓
4. 接收分片
   ├─ 解析分片
   ├─ 验证分片
   └─ 收集分片
   ↓
5. 更新进度
   ↓
6. 检查是否完成
   ├─ 未完成 → 继续扫描
   └─ 已完成 → 重建文件
   ↓
7. 接收完成
```

---

## ⚠️ 注意事项

1. **摄像头权限**
   - 需要用户授权摄像头权限
   - HTTPS 环境下才能访问摄像头

2. **初始化顺序**
   - 必须先初始化再开始接收
   - 确保视频元素有效

3. **错误处理**
   - 监听 error 事件
   - 检查每个操作的返回值

4. **状态管理**
   - 检查状态后再执行操作
   - 使用 getState() 获取当前状态

5. **文件保存**
   - 接收完成后及时保存文件
   - 使用 Electron IPC 保存到本地

---

**最后更新**: 2025-10-06 17:45

