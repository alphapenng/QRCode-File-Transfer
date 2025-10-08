# 二维码扫描服务使用指南

## 概述

`qrcodeScannerService.js` 提供二维码扫描功能，包括摄像头访问、二维码识别和扫描控制。

**文件位置**: `src/renderer/src/services/qrcodeScannerService.js`

**主要功能**:
- 摄像头访问和控制
- 实时二维码识别
- 扫描控制（启动、暂停、停止）
- 事件回调
- 统计信息

---

## 📋 常量定义

### 扫描器状态

```javascript
export const ScannerState = {
  IDLE: 'idle',           // 空闲
  STARTING: 'starting',   // 启动中
  SCANNING: 'scanning',   // 扫描中
  PAUSED: 'paused',       // 暂停
  STOPPED: 'stopped',     // 停止
  ERROR: 'error'          // 错误
};
```

### 扫描器选项

```javascript
export const SCANNER_OPTIONS = {
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: 'environment'  // 后置摄像头
  },
  scanInterval: 100,  // 扫描间隔（毫秒）
  autoStart: false    // 是否自动开始
};
```

---

## 🔧 API 文档

### 二维码扫描器类

#### `QRCodeScanner`

二维码扫描器类，管理摄像头和二维码识别。

**构造函数**:

```javascript
const scanner = new QRCodeScanner(options);
```

**选项**:
- `video` (Object): 视频约束
  - `width` (Object): 宽度约束
  - `height` (Object): 高度约束
  - `facingMode` (string): 摄像头方向（'user' 或 'environment'）
- `scanInterval` (number): 扫描间隔（毫秒），默认 100
- `autoStart` (boolean): 是否自动开始，默认 false

**使用示例**:

```javascript
import { QRCodeScanner } from '@/services/qrcodeScannerService';

const scanner = new QRCodeScanner({
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: 'environment'
  },
  scanInterval: 100
});
```

---

#### `initialize(videoElement, canvasElement)`

初始化扫描器。

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

const result = scanner.initialize(video, canvas);

if (result.success) {
  console.log('扫描器初始化成功');
}
```

---

#### `start()`

启动扫描器。

**返回值**: `Promise<Object>`

```typescript
{
  success: boolean;
  videoWidth?: number;
  videoHeight?: number;
  error?: string;
  message?: string;
}
```

**使用示例**:

```javascript
const result = await scanner.start();

if (result.success) {
  console.log('扫描器启动成功');
  console.log('视频尺寸:', result.videoWidth, 'x', result.videoHeight);
}
```

---

#### `pause()`

暂停扫描。

**返回值**: `Object`

**使用示例**:

```javascript
const result = scanner.pause();

if (result.success) {
  console.log('扫描已暂停');
}
```

---

#### `resume()`

恢复扫描。

**返回值**: `Object`

**使用示例**:

```javascript
const result = scanner.resume();

if (result.success) {
  console.log('扫描已恢复');
}
```

---

#### `stop()`

停止扫描器。

**返回值**: `Object`

**使用示例**:

```javascript
const result = scanner.stop();

if (result.success) {
  console.log('扫描器已停止');
}
```

---

#### `getState()`

获取当前状态。

**返回值**: `Object`

```typescript
{
  state: string;
  hasStream: boolean;
  videoWidth: number;
  videoHeight: number;
}
```

**使用示例**:

```javascript
const state = scanner.getState();

console.log('状态:', state.state);
console.log('是否有视频流:', state.hasStream);
console.log('视频尺寸:', state.videoWidth, 'x', state.videoHeight);
```

---

#### `getStats()`

获取统计信息。

**返回值**: `Object`

```typescript
{
  totalScans: number;
  successfulScans: number;
  failedScans: number;
  startTime: number;
  lastScanTime: number;
  elapsedTime: number;
  elapsedTimeFormatted: string;
  successRate: string;
}
```

**使用示例**:

```javascript
const stats = scanner.getStats();

console.log('总扫描次数:', stats.totalScans);
console.log('成功次数:', stats.successfulScans);
console.log('成功率:', stats.successRate);
console.log('已用时间:', stats.elapsedTimeFormatted);
```

---

#### `on(event, callback)`

设置事件回调。

**参数**:
- `event` (string): 事件名称
  - `'scan'`: 扫描到二维码
  - `'stateChange'`: 状态变化
  - `'error'`: 错误
- `callback` (Function): 回调函数

**使用示例**:

```javascript
// 扫描事件
scanner.on('scan', (data) => {
  console.log('扫描到二维码:', data.data);
  console.log('位置:', data.location);
  console.log('时间戳:', data.timestamp);
});

// 状态变化事件
scanner.on('stateChange', (data) => {
  console.log('状态变化:', data.state);
});

// 错误事件
scanner.on('error', (data) => {
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
scanner.off('scan');
scanner.off('stateChange');
```

---

## 📝 完整使用示例

### 示例 1: 基本使用

```javascript
import { QRCodeScanner } from '@/services/qrcodeScannerService';

async function startScanning() {
  // 1. 创建扫描器
  const scanner = new QRCodeScanner({
    scanInterval: 100
  });
  
  // 2. 设置扫描回调
  scanner.on('scan', (data) => {
    console.log('扫描到二维码:', data.data);
    
    // 处理扫描结果
    handleQRCode(data.data);
  });
  
  // 3. 设置错误回调
  scanner.on('error', (data) => {
    console.error('扫描错误:', data.message);
  });
  
  // 4. 初始化扫描器
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  
  const initResult = scanner.initialize(video, canvas);
  
  if (!initResult.success) {
    console.error('初始化失败:', initResult.message);
    return;
  }
  
  // 5. 启动扫描器
  const startResult = await scanner.start();
  
  if (!startResult.success) {
    console.error('启动失败:', startResult.message);
    return;
  }
  
  console.log('扫描器已启动');
}

function handleQRCode(data) {
  // 处理二维码数据
  console.log('处理二维码:', data);
}

// 执行
startScanning();
```

### 示例 2: 带 UI 的完整流程

```javascript
import { QRCodeScanner, ScannerState } from '@/services/qrcodeScannerService';

class ScannerUI {
  constructor() {
    this.scanner = new QRCodeScanner();
    this.setupEventListeners();
    this.setupScannerCallbacks();
  }
  
  setupEventListeners() {
    // 启动按钮
    document.getElementById('btn-start').addEventListener('click', async () => {
      await this.startScanner();
    });
    
    // 暂停按钮
    document.getElementById('btn-pause').addEventListener('click', () => {
      this.scanner.pause();
    });
    
    // 恢复按钮
    document.getElementById('btn-resume').addEventListener('click', () => {
      this.scanner.resume();
    });
    
    // 停止按钮
    document.getElementById('btn-stop').addEventListener('click', () => {
      this.scanner.stop();
    });
  }
  
  setupScannerCallbacks() {
    // 扫描事件
    this.scanner.on('scan', (data) => {
      this.handleScan(data);
    });
    
    // 状态变化
    this.scanner.on('stateChange', (data) => {
      this.updateUIState(data.state);
    });
    
    // 错误
    this.scanner.on('error', (data) => {
      this.showError(data);
    });
  }
  
  async startScanner() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    
    // 初始化
    const initResult = this.scanner.initialize(video, canvas);
    
    if (!initResult.success) {
      alert('初始化失败: ' + initResult.message);
      return;
    }
    
    // 启动
    const startResult = await this.scanner.start();
    
    if (!startResult.success) {
      alert('启动失败: ' + startResult.message);
    }
  }
  
  handleScan(data) {
    // 显示扫描结果
    const resultDiv = document.getElementById('scan-result');
    resultDiv.textContent = data.data;
    
    // 更新统计
    const stats = this.scanner.getStats();
    document.getElementById('total-scans').textContent = stats.totalScans;
    document.getElementById('success-rate').textContent = stats.successRate;
  }
  
  updateUIState(state) {
    const btnStart = document.getElementById('btn-start');
    const btnPause = document.getElementById('btn-pause');
    const btnResume = document.getElementById('btn-resume');
    const btnStop = document.getElementById('btn-stop');
    
    switch (state) {
      case ScannerState.SCANNING:
        btnStart.disabled = true;
        btnPause.disabled = false;
        btnResume.disabled = true;
        btnStop.disabled = false;
        break;
      case ScannerState.PAUSED:
        btnPause.disabled = true;
        btnResume.disabled = false;
        break;
      case ScannerState.STOPPED:
        btnStart.disabled = false;
        btnPause.disabled = true;
        btnResume.disabled = true;
        btnStop.disabled = true;
        break;
    }
  }
  
  showError(data) {
    alert('错误: ' + data.message);
  }
}

// 初始化
const scannerUI = new ScannerUI();
```

---

## ⚠️ 注意事项

1. **摄像头权限**
   - 需要用户授权摄像头权限
   - HTTPS 环境下才能访问摄像头

2. **性能优化**
   - 调整 scanInterval 以平衡性能和识别率
   - 推荐值: 100-200ms

3. **视频元素**
   - 必须是有效的 HTMLVideoElement
   - 建议设置合适的尺寸

4. **Canvas 元素**
   - 如果不提供会自动创建
   - 用于图像处理

5. **错误处理**
   - 监听 error 事件
   - 检查每个操作的返回值

---

**最后更新**: 2025-10-06 17:15

