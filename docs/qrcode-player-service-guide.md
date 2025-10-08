# 二维码播放器服务使用指南

## 概述

`qrcodePlayerService.js` 提供二维码序列播放功能，包括播放控制、速度调节和进度管理。

**文件位置**: `src/renderer/src/services/qrcodePlayerService.js`

**主要功能**:
- 播放控制（播放、暂停、停止）
- 速度控制
- 进度跟踪
- 事件回调
- 循环播放
- 统计信息

---

## 📋 常量定义

### 播放器状态

```javascript
export const PlayerState = {
  IDLE: 'idle',           // 空闲
  PLAYING: 'playing',     // 播放中
  PAUSED: 'paused',       // 暂停
  STOPPED: 'stopped',     // 停止
  COMPLETED: 'completed'  // 完成
};
```

### 播放器选项

```javascript
export const PLAYER_OPTIONS = {
  speed: 5,        // 播放速度（每秒显示的二维码数量）
  loop: false,     // 是否循环播放
  autoPlay: false  // 是否自动播放
};
```

---

## 🔧 API 文档

### 二维码播放器类

#### `QRCodePlayer`

二维码播放器类，管理二维码序列的播放。

**构造函数**:

```javascript
const player = new QRCodePlayer(options);
```

**选项**:
- `speed` (number): 播放速度（每秒帧数），默认 5
- `loop` (boolean): 是否循环播放，默认 false
- `autoPlay` (boolean): 是否自动播放，默认 false

**使用示例**:

```javascript
import { QRCodePlayer } from '@/services/qrcodePlayerService';

const player = new QRCodePlayer({
  speed: 5,
  loop: false,
  autoPlay: false
});
```

---

#### `load(qrCodes)`

加载二维码序列。

**参数**:
- `qrCodes` (Array<string>): 二维码数组（Data URL）

**返回值**: `Object`

```typescript
{
  success: boolean;
  totalFrames?: number;
  error?: string;
  message?: string;
}
```

**使用示例**:

```javascript
const qrCodes = [
  'data:image/png;base64,...',
  'data:image/png;base64,...',
  'data:image/png;base64,...'
];

const result = player.load(qrCodes);

if (result.success) {
  console.log('加载成功，总帧数:', result.totalFrames);
}
```

---

#### `play()`

开始播放。

**返回值**: `Object`

```typescript
{
  success: boolean;
  state?: string;
  error?: string;
  message?: string;
}
```

**使用示例**:

```javascript
const result = player.play();

if (result.success) {
  console.log('播放开始');
}
```

---

#### `pause()`

暂停播放。

**返回值**: `Object`

**使用示例**:

```javascript
const result = player.pause();

if (result.success) {
  console.log('播放已暂停');
}
```

---

#### `stop()`

停止播放。

**返回值**: `Object`

**使用示例**:

```javascript
const result = player.stop();

if (result.success) {
  console.log('播放已停止');
}
```

---

#### `seekTo(index)`

跳转到指定帧。

**参数**:
- `index` (number): 帧索引（从 0 开始）

**返回值**: `Object`

```typescript
{
  success: boolean;
  currentIndex?: number;
  error?: string;
  message?: string;
}
```

**使用示例**:

```javascript
// 跳转到第 10 帧
const result = player.seekTo(9);

if (result.success) {
  console.log('已跳转到帧:', result.currentIndex);
}
```

---

#### `setSpeed(speed)`

设置播放速度。

**参数**:
- `speed` (number): 速度（每秒帧数，1-60）

**返回值**: `Object`

**使用示例**:

```javascript
// 设置为每秒 10 帧
const result = player.setSpeed(10);

if (result.success) {
  console.log('速度已设置为:', result.speed);
}
```

---

#### `getState()`

获取当前状态。

**返回值**: `Object`

```typescript
{
  state: string;
  currentIndex: number;
  totalFrames: number;
  progress: string;
  speed: number;
  loop: boolean;
}
```

**使用示例**:

```javascript
const state = player.getState();

console.log('状态:', state.state);
console.log('当前帧:', state.currentIndex);
console.log('总帧数:', state.totalFrames);
console.log('进度:', state.progress);
console.log('速度:', state.speed);
```

---

#### `getStats()`

获取统计信息。

**返回值**: `Object`

```typescript
{
  totalFrames: number;
  playedFrames: number;
  startTime: number;
  pauseTime: number;
  totalPauseTime: number;
  elapsedTime: number;
  elapsedTimeFormatted: string;
  averageSpeed: string;
}
```

**使用示例**:

```javascript
const stats = player.getStats();

console.log('总帧数:', stats.totalFrames);
console.log('已播放:', stats.playedFrames);
console.log('已用时间:', stats.elapsedTimeFormatted);
console.log('平均速度:', stats.averageSpeed, '帧/秒');
```

---

#### `on(event, callback)`

设置事件回调。

**参数**:
- `event` (string): 事件名称
  - `'frameChange'`: 帧变化
  - `'stateChange'`: 状态变化
  - `'complete'`: 播放完成
  - `'error'`: 错误
- `callback` (Function): 回调函数

**使用示例**:

```javascript
// 帧变化事件
player.on('frameChange', (data) => {
  console.log('当前帧:', data.index);
  console.log('进度:', data.progress + '%');
  
  // 显示二维码
  const img = document.getElementById('qrcode-img');
  img.src = data.qrCode;
});

// 状态变化事件
player.on('stateChange', (data) => {
  console.log('状态变化:', data.state);
});

// 完成事件
player.on('complete', (data) => {
  console.log('播放完成！');
  console.log('统计:', data.stats);
});

// 错误事件
player.on('error', (data) => {
  console.error('错误:', data.error);
});
```

---

#### `off(event)`

移除事件回调。

**参数**:
- `event` (string): 事件名称

**使用示例**:

```javascript
player.off('frameChange');
player.off('stateChange');
```

---

## 📝 完整使用示例

### 示例 1: 基本播放

```javascript
import { QRCodePlayer } from '@/services/qrcodePlayerService';

async function playQRCodes(qrCodes) {
  // 1. 创建播放器
  const player = new QRCodePlayer({
    speed: 5,
    loop: false
  });
  
  // 2. 设置帧变化回调
  player.on('frameChange', (data) => {
    // 显示二维码
    const img = document.getElementById('qrcode-img');
    img.src = data.qrCode;
    
    // 更新进度
    const progress = document.getElementById('progress');
    progress.textContent = `${data.index + 1}/${data.total} (${data.progress}%)`;
  });
  
  // 3. 设置完成回调
  player.on('complete', (data) => {
    console.log('传输完成！');
    console.log('统计:', data.stats);
  });
  
  // 4. 加载二维码
  const loadResult = player.load(qrCodes);
  
  if (!loadResult.success) {
    console.error('加载失败:', loadResult.message);
    return;
  }
  
  // 5. 开始播放
  const playResult = player.play();
  
  if (!playResult.success) {
    console.error('播放失败:', playResult.message);
  }
}
```

### 示例 2: 带控制按钮

```javascript
import { QRCodePlayer, PlayerState } from '@/services/qrcodePlayerService';

class QRCodePlayerUI {
  constructor() {
    this.player = new QRCodePlayer({ speed: 5 });
    this.setupEventListeners();
    this.setupPlayerCallbacks();
  }
  
  setupEventListeners() {
    // 播放按钮
    document.getElementById('btn-play').addEventListener('click', () => {
      this.player.play();
    });
    
    // 暂停按钮
    document.getElementById('btn-pause').addEventListener('click', () => {
      this.player.pause();
    });
    
    // 停止按钮
    document.getElementById('btn-stop').addEventListener('click', () => {
      this.player.stop();
    });
    
    // 速度滑块
    document.getElementById('speed-slider').addEventListener('input', (e) => {
      const speed = parseInt(e.target.value);
      this.player.setSpeed(speed);
      document.getElementById('speed-value').textContent = speed;
    });
  }
  
  setupPlayerCallbacks() {
    // 帧变化
    this.player.on('frameChange', (data) => {
      const img = document.getElementById('qrcode-img');
      img.src = data.qrCode;
      
      const progress = document.getElementById('progress-bar');
      progress.style.width = data.progress + '%';
      
      const text = document.getElementById('progress-text');
      text.textContent = `${data.index + 1}/${data.total}`;
    });
    
    // 状态变化
    this.player.on('stateChange', (data) => {
      this.updateButtonStates(data.state);
    });
    
    // 完成
    this.player.on('complete', (data) => {
      alert('传输完成！');
    });
  }
  
  updateButtonStates(state) {
    const btnPlay = document.getElementById('btn-play');
    const btnPause = document.getElementById('btn-pause');
    const btnStop = document.getElementById('btn-stop');
    
    switch (state) {
      case PlayerState.PLAYING:
        btnPlay.disabled = true;
        btnPause.disabled = false;
        btnStop.disabled = false;
        break;
      case PlayerState.PAUSED:
        btnPlay.disabled = false;
        btnPause.disabled = true;
        btnStop.disabled = false;
        break;
      case PlayerState.STOPPED:
      case PlayerState.COMPLETED:
        btnPlay.disabled = false;
        btnPause.disabled = true;
        btnStop.disabled = true;
        break;
    }
  }
  
  loadAndPlay(qrCodes) {
    const result = this.player.load(qrCodes);
    
    if (result.success) {
      this.player.play();
    }
  }
}

// 使用
const playerUI = new QRCodePlayerUI();
playerUI.loadAndPlay(qrCodes);
```

### 示例 3: 完整的发送流程

```javascript
import { selectAndValidateFile } from '@/services/fileService';
import { preprocessFile } from '@/services/filePreprocessService';
import { ChunkManager } from '@/services/chunkService';
import { QRCodeGenerator } from '@/services/qrcodeService';
import { QRCodePlayer } from '@/services/qrcodePlayerService';

async function sendFile() {
  // 1. 选择文件
  const selectResult = await selectAndValidateFile();
  if (!selectResult.success) return;
  
  const { file } = selectResult;
  
  // 2. 预处理文件
  const preprocessResult = await preprocessFile(file.path);
  if (!preprocessResult.success) return;
  
  const { data } = preprocessResult;
  
  // 3. 创建分片
  const chunkManager = new ChunkManager();
  const initResult = chunkManager.initialize(
    { name: file.name, size: file.size, type: file.type },
    data.processed
  );
  if (!initResult.success) return;
  
  // 4. 生成二维码
  const qrGenerator = new QRCodeGenerator();
  const qrCodes = [];
  
  while (!chunkManager.isCompleted()) {
    const chunkResult = chunkManager.getNextChunk();
    if (chunkResult.success) {
      const qrResult = await qrGenerator.generate(chunkResult.chunk);
      if (qrResult.success) {
        qrCodes.push(qrResult.dataURL);
      }
    }
  }
  
  // 5. 播放二维码
  const player = new QRCodePlayer({ speed: 5 });
  
  player.on('frameChange', (data) => {
    const img = document.getElementById('qrcode-img');
    img.src = data.qrCode;
    console.log(`显示二维码 ${data.index + 1}/${data.total}`);
  });
  
  player.on('complete', () => {
    console.log('文件传输完成！');
  });
  
  player.load(qrCodes);
  player.play();
}
```

---

## ⚠️ 注意事项

1. **播放速度**
   - 推荐速度: 5 帧/秒
   - 范围: 1-60 帧/秒
   - 速度过快可能导致扫描失败

2. **内存管理**
   - 加载大量二维码会占用内存
   - 播放完成后及时清理

3. **事件回调**
   - 回调函数中的错误会被捕获
   - 使用 `error` 事件处理错误

4. **状态管理**
   - 检查状态后再执行操作
   - 使用 `getState()` 获取当前状态

---

**最后更新**: 2025-10-06 16:50

