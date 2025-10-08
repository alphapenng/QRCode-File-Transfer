# 数据接收服务使用指南

## 概述

`dataReceiverService.js` 提供数据接收功能，包括分片数据解析、验证和收集。

**文件位置**: `src/renderer/src/services/dataReceiverService.js`

**主要功能**:
- 分片数据解析
- 分片数据验证
- 分片数据收集
- 进度跟踪
- 文件重建
- 统计信息

**集成的工具**:
- `protocolUtils` - 分片协议工具
  - `decodeChunk` - 解析分片
  - `validateChunk` - 验证分片
  - `ChunkCollector` - 分片收集器

---

## 📋 常量定义

### 接收器状态

```javascript
export const ReceiverState = {
  IDLE: 'idle',           // 空闲
  RECEIVING: 'receiving', // 接收中
  PAUSED: 'paused',       // 暂停
  COMPLETED: 'completed', // 完成
  ERROR: 'error'          // 错误
};
```

---

## 🔧 API 文档

### 数据接收器类

#### `DataReceiver`

数据接收器类，管理分片数据的接收和处理。

**构造函数**:

```javascript
const receiver = new DataReceiver(options);
```

**选项**:
- `autoValidate` (boolean): 是否自动验证分片，默认 true

**使用示例**:

```javascript
import { DataReceiver } from '@/services/dataReceiverService';

const receiver = new DataReceiver({
  autoValidate: true
});
```

---

#### `start()`

开始接收。

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
const result = receiver.start();

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

#### `reset()`

重置接收器。

**返回值**: `Object`

**使用示例**:

```javascript
const result = receiver.reset();

if (result.success) {
  console.log('接收器已重置');
}
```

---

#### `parseChunk(data)`

解析分片数据。

**参数**:
- `data` (string): 分片数据（JSON 字符串）

**返回值**: `Object`

```typescript
{
  success: boolean;
  chunk?: Object;
  error?: string;
  message?: string;
}
```

**使用示例**:

```javascript
const result = receiver.parseChunk(jsonString);

if (result.success) {
  console.log('分片解析成功:', result.chunk);
}
```

---

#### `validateChunk(chunk)`

验证分片数据。

**参数**:
- `chunk` (Object): 分片对象

**返回值**: `Object`

```typescript
{
  success: boolean;
  errors?: Array<string>;
}
```

**使用示例**:

```javascript
const result = receiver.validateChunk(chunk);

if (result.success) {
  console.log('分片验证通过');
} else {
  console.error('验证错误:', result.errors);
}
```

---

#### `receiveChunk(data)`

接收分片数据（解析、验证、收集）。

**参数**:
- `data` (string): 分片数据（JSON 字符串）

**返回值**: `Object`

```typescript
{
  success: boolean;
  index?: number;
  total?: number;
  progress?: string;
  error?: string;
  message?: string;
}
```

**使用示例**:

```javascript
const result = receiver.receiveChunk(qrCodeData);

if (result.success) {
  console.log(`接收进度: ${result.index + 1}/${result.total} (${result.progress})`);
}
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

#### `getStats()`

获取统计信息。

**返回值**: `Object`

```typescript
{
  totalReceived: number;
  validChunks: number;
  invalidChunks: number;
  duplicateChunks: number;
  startTime: number;
  endTime: number;
  elapsedTime: number;
  elapsedTimeFormatted: string;
  validRate: string;
}
```

**使用示例**:

```javascript
const stats = receiver.getStats();

console.log('总接收:', stats.totalReceived);
console.log('有效分片:', stats.validChunks);
console.log('无效分片:', stats.invalidChunks);
console.log('重复分片:', stats.duplicateChunks);
console.log('有效率:', stats.validRate);
console.log('已用时间:', stats.elapsedTimeFormatted);
```

---

#### `getState()`

获取当前状态。

**返回值**: `Object`

```typescript
{
  state: string;
  progress: Object;
  stats: Object;
}
```

**使用示例**:

```javascript
const state = receiver.getState();

console.log('状态:', state.state);
console.log('进度:', state.progress);
console.log('统计:', state.stats);
```

---

#### `reconstructFile()`

重建文件。

**返回值**: `Object`

```typescript
{
  success: boolean;
  data?: Uint8Array;
  fileInfo?: Object;
  error?: string;
  message?: string;
}
```

**使用示例**:

```javascript
const result = receiver.reconstructFile();

if (result.success) {
  console.log('文件重建成功');
  console.log('文件信息:', result.fileInfo);
  console.log('文件数据:', result.data);
}
```

---

#### `on(event, callback)`

设置事件回调。

**参数**:
- `event` (string): 事件名称
  - `'progress'`: 进度更新
  - `'complete'`: 接收完成
  - `'error'`: 错误
- `callback` (Function): 回调函数

**使用示例**:

```javascript
// 进度事件
receiver.on('progress', (data) => {
  console.log(`进度: ${data.index + 1}/${data.total} (${data.progress})`);
});

// 完成事件
receiver.on('complete', (data) => {
  console.log('接收完成！');
  console.log('文件信息:', data.fileInfo);
  console.log('统计:', data.stats);
});

// 错误事件
receiver.on('error', (data) => {
  console.error('错误:', data.error);
  console.error('消息:', data.message);
});
```

---

#### `off(event)`

移除事件回调。

**参数**:
- `event` (string): 事件名称

**使用示例**:

```javascript
receiver.off('progress');
receiver.off('complete');
```

---

## 📝 完整使用示例

### 示例 1: 基本使用

```javascript
import { DataReceiver } from '@/services/dataReceiverService';

async function receiveFile() {
  // 1. 创建接收器
  const receiver = new DataReceiver({
    autoValidate: true
  });
  
  // 2. 设置进度回调
  receiver.on('progress', (data) => {
    console.log(`接收进度: ${data.index + 1}/${data.total} (${data.progress})`);
  });
  
  // 3. 设置完成回调
  receiver.on('complete', (data) => {
    console.log('接收完成！');
    console.log('文件名:', data.fileInfo.name);
    console.log('文件大小:', data.fileInfo.size);
    
    // 保存文件
    saveFile(data.data, data.fileInfo);
  });
  
  // 4. 设置错误回调
  receiver.on('error', (data) => {
    console.error('接收错误:', data.message);
  });
  
  // 5. 开始接收
  receiver.start();
  
  // 6. 接收分片（从扫描器获取）
  // 这部分将在集成扫描器时实现
}

function saveFile(data, fileInfo) {
  // 保存文件逻辑
  console.log('保存文件:', fileInfo.name);
}
```

### 示例 2: 与扫描器集成

```javascript
import { QRCodeScanner } from '@/services/qrcodeScannerService';
import { DataReceiver } from '@/services/dataReceiverService';

class FileReceiver {
  constructor() {
    this.scanner = new QRCodeScanner();
    this.receiver = new DataReceiver();
    this.setupCallbacks();
  }
  
  setupCallbacks() {
    // 扫描器回调
    this.scanner.on('scan', (data) => {
      this.handleScan(data);
    });
    
    // 接收器回调
    this.receiver.on('progress', (data) => {
      this.updateProgress(data);
    });
    
    this.receiver.on('complete', (data) => {
      this.handleComplete(data);
    });
    
    this.receiver.on('error', (data) => {
      this.handleError(data);
    });
  }
  
  async start() {
    // 初始化扫描器
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    
    this.scanner.initialize(video, canvas);
    
    // 启动扫描器
    await this.scanner.start();
    
    // 启动接收器
    this.receiver.start();
  }
  
  handleScan(data) {
    // 接收扫描到的分片
    const result = this.receiver.receiveChunk(data.data);
    
    if (!result.success) {
      console.error('接收失败:', result.message);
    }
  }
  
  updateProgress(data) {
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    
    progressBar.style.width = data.progress;
    progressText.textContent = `${data.index + 1}/${data.total}`;
  }
  
  handleComplete(data) {
    // 停止扫描器
    this.scanner.stop();
    
    // 显示完成信息
    alert('文件接收完成！\n文件名: ' + data.fileInfo.name);
    
    // 保存文件
    this.saveFile(data.data, data.fileInfo);
  }
  
  handleError(data) {
    alert('错误: ' + data.message);
  }
  
  saveFile(data, fileInfo) {
    // 使用 Electron IPC 保存文件
    window.electronAPI.file.save(data, fileInfo.name);
  }
}

// 使用
const fileReceiver = new FileReceiver();
fileReceiver.start();
```

---

## 🔄 接收流程

### 完整流程图

```
1. 开始接收 (start)
   ↓
2. 扫描二维码
   ↓
3. 接收分片 (receiveChunk)
   ├─ 解析分片 (parseChunk)
   ├─ 验证分片 (validateChunk)
   └─ 收集分片 (ChunkCollector)
   ↓
4. 更新进度
   ↓
5. 检查是否完成
   ├─ 未完成 → 继续接收
   └─ 已完成 → 重建文件
   ↓
6. 接收完成
```

---

## ⚠️ 注意事项

1. **自动验证**
   - 默认启用自动验证
   - 可通过选项禁用

2. **重复分片**
   - 自动检测重复分片
   - 不会影响接收进度

3. **错误处理**
   - 监听 error 事件
   - 检查每个操作的返回值

4. **状态管理**
   - 检查状态后再执行操作
   - 使用 getState() 获取当前状态

5. **文件重建**
   - 只有在接收完成后才能重建
   - 重建会自动验证数据完整性

---

**最后更新**: 2025-10-06 17:30

