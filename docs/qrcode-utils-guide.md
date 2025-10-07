# 二维码工具使用指南

## 概述

`qrcodeUtils.js` 提供了完整的二维码生成和解析功能，支持分片传输场景。

**文件位置**: `src/shared/utils/qrcodeUtils.js`

**主要功能**:
- 二维码生成（Data URL、Canvas）
- 二维码解析
- 批量生成
- 容量计算
- 数据验证
- 序列创建

**依赖库**:
- `qrcode` - 二维码生成
- `jsqr` - 二维码解析

---

## API 文档

### 二维码生成

#### `generateQRCode(data, options)`

生成二维码（Data URL 格式）。

**参数**:
- `data` (string): 要编码的数据
- `options` (Object, 可选): 配置选项
  - `width` (number): 二维码宽度，默认 400
  - `margin` (number): 边距，默认 2
  - `errorCorrectionLevel` (string): 纠错级别 ('L', 'M', 'Q', 'H')，默认 'M'
  - `color.dark` (string): 前景色，默认 '#000000'
  - `color.light` (string): 背景色，默认 '#FFFFFF'

**返回值**: `Promise<string>` - Data URL 格式的二维码图像

**使用示例**:
```javascript
import { generateQRCode } from '@shared/utils/qrcodeUtils';

// 基本使用
const dataUrl = await generateQRCode('Hello, World!');
console.log(dataUrl); // data:image/png;base64,...

// 自定义选项
const dataUrl2 = await generateQRCode('Hello, World!', {
  width: 300,
  margin: 4,
  errorCorrectionLevel: 'H',
  color: {
    dark: '#FF0000',
    light: '#FFFFFF'
  }
});

// 在 React 中使用
<img src={dataUrl} alt="QR Code" />
```

---

#### `generateQRCodeToCanvas(canvas, data, options)`

生成二维码到 Canvas 元素。

**参数**:
- `canvas` (HTMLCanvasElement): Canvas 元素
- `data` (string): 要编码的数据
- `options` (Object, 可选): 配置选项（同上）

**返回值**: `Promise<void>`

**使用示例**:
```javascript
import { generateQRCodeToCanvas } from '@shared/utils/qrcodeUtils';

const canvas = document.getElementById('qrCanvas');
await generateQRCodeToCanvas(canvas, 'Hello, World!', {
  width: 400,
  errorCorrectionLevel: 'M'
});
```

---

#### `generateQRCodeBatch(dataArray, options)`

批量生成二维码。

**参数**:
- `dataArray` (string[]): 数据数组
- `options` (Object, 可选): 配置选项

**返回值**: `Promise<string[]>` - Data URL 数组

**使用示例**:
```javascript
import { generateQRCodeBatch } from '@shared/utils/qrcodeUtils';

const chunks = ['Chunk 1', 'Chunk 2', 'Chunk 3'];
const qrCodes = await generateQRCodeBatch(chunks, {
  width: 400,
  errorCorrectionLevel: 'M'
});

console.log('生成了', qrCodes.length, '个二维码');
```

---

### 二维码解析

#### `parseQRCode(imageData)`

从图像数据解析二维码。

**参数**:
- `imageData` (ImageData): 图像数据

**返回值**: `Object|null` - 解析结果
```typescript
{
  data: string;        // 解码的数据
  location: Object;    // 二维码位置
  version: number;     // 二维码版本
  binaryData: Uint8Array; // 二进制数据
}
```

**使用示例**:
```javascript
import { parseQRCode } from '@shared/utils/qrcodeUtils';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

const result = parseQRCode(imageData);
if (result) {
  console.log('解析成功:', result.data);
} else {
  console.log('未找到二维码');
}
```

---

#### `parseQRCodeFromCanvas(canvas)`

从 Canvas 解析二维码。

**参数**:
- `canvas` (HTMLCanvasElement): Canvas 元素

**返回值**: `Object|null` - 解析结果

**使用示例**:
```javascript
import { parseQRCodeFromCanvas } from '@shared/utils/qrcodeUtils';

const canvas = document.getElementById('canvas');
const result = parseQRCodeFromCanvas(canvas);

if (result) {
  console.log('解析成功:', result.data);
}
```

---

#### `parseQRCodeFromImage(imageUrl)`

从图像 URL 解析二维码。

**参数**:
- `imageUrl` (string): 图像 URL

**返回值**: `Promise<Object|null>` - 解析结果

**使用示例**:
```javascript
import { parseQRCodeFromImage } from '@shared/utils/qrcodeUtils';

const result = await parseQRCodeFromImage('path/to/qrcode.png');
if (result) {
  console.log('解析成功:', result.data);
}
```

---

### 容量计算

#### `calculateQRCodeCapacity(data, errorCorrectionLevel)`

计算二维码容量。

**参数**:
- `data` (string): 要编码的数据
- `errorCorrectionLevel` (string): 纠错级别，默认 'M'

**返回值**: `Object`
```typescript
{
  dataLength: number;           // 数据长度
  maxCapacity: number;          // 最大容量
  usagePercentage: number;      // 使用百分比
  canEncode: boolean;           // 是否可以编码
  errorCorrectionLevel: string; // 纠错级别
}
```

**使用示例**:
```javascript
import { calculateQRCodeCapacity } from '@shared/utils/qrcodeUtils';

const data = 'A'.repeat(2000);
const capacity = calculateQRCodeCapacity(data, 'M');

console.log('数据长度:', capacity.dataLength);
console.log('最大容量:', capacity.maxCapacity);
console.log('使用率:', capacity.usagePercentage + '%');
console.log('可以编码:', capacity.canEncode);
```

**纠错级别容量**:
- **L (Low)**: 2953 字节，7% 纠错
- **M (Medium)**: 2331 字节，15% 纠错
- **Q (Quartile)**: 1663 字节，25% 纠错
- **H (High)**: 1273 字节，30% 纠错

---

#### `getRecommendedErrorCorrectionLevel(dataLength, priority)`

获取推荐的纠错级别。

**参数**:
- `dataLength` (number): 数据长度（字节）
- `priority` (string): 优先级 ('speed' 或 'reliability')，默认 'reliability'

**返回值**: `string` - 推荐的纠错级别

**使用示例**:
```javascript
import { getRecommendedErrorCorrectionLevel } from '@shared/utils/qrcodeUtils';

const dataLength = 1500;

// 优先可靠性
const level1 = getRecommendedErrorCorrectionLevel(dataLength, 'reliability');
console.log('推荐级别:', level1); // 'Q'

// 优先速度
const level2 = getRecommendedErrorCorrectionLevel(dataLength, 'speed');
console.log('推荐级别:', level2); // 'L'
```

---

### 统计信息

#### `generateQRCodeWithStats(data, options)`

生成二维码并获取统计信息。

**参数**:
- `data` (string): 要编码的数据
- `options` (Object, 可选): 配置选项

**返回值**: `Promise<Object>`
```typescript
{
  dataUrl: string;              // 二维码 Data URL
  dataLength: number;           // 数据长度
  maxCapacity: number;          // 最大容量
  usagePercentage: number;      // 使用百分比
  errorCorrectionLevel: string; // 纠错级别
  width: number;                // 二维码宽度
  generationTime: number;       // 生成耗时（毫秒）
}
```

**使用示例**:
```javascript
import { generateQRCodeWithStats } from '@shared/utils/qrcodeUtils';

const data = 'Hello, World!';
const result = await generateQRCodeWithStats(data, {
  width: 400,
  errorCorrectionLevel: 'M'
});

console.log('生成统计:');
console.log('- 数据长度:', result.dataLength);
console.log('- 使用率:', result.usagePercentage + '%');
console.log('- 生成耗时:', result.generationTime + 'ms');
```

---

### 数据验证

#### `validateQRCodeData(data, errorCorrectionLevel)`

验证二维码数据。

**参数**:
- `data` (string): 要验证的数据
- `errorCorrectionLevel` (string): 纠错级别，默认 'M'

**返回值**: `Object`
```typescript
{
  valid: boolean;      // 是否有效
  errors: string[];    // 错误信息
  warnings: string[];  // 警告信息
}
```

**使用示例**:
```javascript
import { validateQRCodeData } from '@shared/utils/qrcodeUtils';

const data = 'A'.repeat(2000);
const result = validateQRCodeData(data, 'M');

if (result.valid) {
  console.log('数据有效');
  if (result.warnings.length > 0) {
    console.warn('警告:', result.warnings);
  }
} else {
  console.error('数据无效:', result.errors);
}
```

---

### 序列创建

#### `createQRCodeSequence(dataArray, options)`

创建二维码序列（用于分片传输）。

**参数**:
- `dataArray` (string[]): 数据数组
- `options` (Object, 可选): 配置选项

**返回值**: `Promise<Object[]>`
```typescript
[
  {
    index: number;    // 序号
    total: number;    // 总数
    dataUrl: string;  // 二维码 Data URL
    data: string;     // 原始数据
  }
]
```

**使用示例**:
```javascript
import { createQRCodeSequence } from '@shared/utils/qrcodeUtils';

const chunks = ['Chunk 1', 'Chunk 2', 'Chunk 3'];
const sequence = await createQRCodeSequence(chunks, {
  width: 400,
  errorCorrectionLevel: 'M'
});

sequence.forEach(item => {
  console.log(`二维码 ${item.index + 1}/${item.total}`);
  // 显示二维码: <img src={item.dataUrl} />
});
```

---

### 时间估算

#### `estimateGenerationTime(count, avgDataLength)`

估算二维码生成时间。

**参数**:
- `count` (number): 二维码数量
- `avgDataLength` (number): 平均数据长度，默认 2048

**返回值**: `Object`
```typescript
{
  count: number;                // 数量
  avgDataLength: number;        // 平均数据长度
  estimatedTime: number;        // 估算时间（毫秒）
  estimatedTimeSeconds: number; // 估算时间（秒）
}
```

**使用示例**:
```javascript
import { estimateGenerationTime } from '@shared/utils/qrcodeUtils';

const estimate = estimateGenerationTime(100, 2048);

console.log('生成 100 个二维码预计需要:');
console.log('- 毫秒:', estimate.estimatedTime);
console.log('- 秒:', estimate.estimatedTimeSeconds);
```

---

## 完整使用示例

### 示例 1: 分片传输

```javascript
import { splitIntoChunks } from '@shared/utils/fileUtils';
import { uint8ArrayToBase64 } from '@shared/utils/encodingUtils';
import { calculateCRC32 } from '@shared/utils/hashUtils';
import { createQRCodeSequence } from '@shared/utils/qrcodeUtils';

async function prepareFileForTransfer(fileData) {
  // 1. 分片
  const chunks = splitIntoChunks(fileData, 2048);
  
  // 2. 编码和校验
  const chunkData = chunks.map((chunk, index) => {
    const base64 = uint8ArrayToBase64(chunk);
    const crc32 = calculateCRC32(chunk);
    
    return JSON.stringify({
      index,
      total: chunks.length,
      data: base64,
      crc32
    });
  });
  
  // 3. 生成二维码序列
  const qrSequence = await createQRCodeSequence(chunkData, {
    width: 400,
    errorCorrectionLevel: 'M'
  });
  
  return qrSequence;
}
```

### 示例 2: 二维码播放器

```javascript
import { generateQRCode } from '@shared/utils/qrcodeUtils';

class QRCodePlayer {
  constructor(dataArray, options = {}) {
    this.dataArray = dataArray;
    this.currentIndex = 0;
    this.interval = options.interval || 200; // 5个/秒
    this.timer = null;
  }
  
  async start(displayCallback) {
    this.timer = setInterval(async () => {
      if (this.currentIndex >= this.dataArray.length) {
        this.currentIndex = 0; // 循环播放
      }
      
      const data = this.dataArray[this.currentIndex];
      const qrCode = await generateQRCode(data);
      
      displayCallback(qrCode, this.currentIndex, this.dataArray.length);
      
      this.currentIndex++;
    }, this.interval);
  }
  
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
  
  setSpeed(qrPerSecond) {
    this.interval = 1000 / qrPerSecond;
    if (this.timer) {
      this.stop();
      this.start();
    }
  }
}

// 使用
const player = new QRCodePlayer(chunkData, { interval: 200 });
player.start((qrCode, index, total) => {
  document.getElementById('qrImage').src = qrCode;
  document.getElementById('progress').textContent = `${index + 1}/${total}`;
});
```

### 示例 3: 扫码接收

```javascript
import { parseQRCodeFromCanvas } from '@shared/utils/qrcodeUtils';
import { base64ToUint8Array } from '@shared/utils/encodingUtils';
import { verifyCRC32 } from '@shared/utils/hashUtils';

class QRCodeReceiver {
  constructor() {
    this.chunks = new Map();
    this.totalChunks = 0;
  }
  
  async processQRCode(canvas) {
    // 1. 解析二维码
    const result = parseQRCodeFromCanvas(canvas);
    if (!result) {
      return { success: false, error: '未找到二维码' };
    }
    
    // 2. 解析数据
    let chunkInfo;
    try {
      chunkInfo = JSON.parse(result.data);
    } catch (error) {
      return { success: false, error: '数据格式错误' };
    }
    
    // 3. 验证 CRC32
    const chunkData = base64ToUint8Array(chunkInfo.data);
    if (!verifyCRC32(chunkData, chunkInfo.crc32)) {
      return { success: false, error: 'CRC32 校验失败' };
    }
    
    // 4. 保存分片
    this.chunks.set(chunkInfo.index, chunkData);
    this.totalChunks = chunkInfo.total;
    
    // 5. 检查是否完成
    const isComplete = this.chunks.size === this.totalChunks;
    
    return {
      success: true,
      index: chunkInfo.index,
      total: this.totalChunks,
      received: this.chunks.size,
      complete: isComplete
    };
  }
  
  getCompleteData() {
    if (this.chunks.size !== this.totalChunks) {
      throw new Error('数据不完整');
    }
    
    // 合并分片
    const totalLength = Array.from(this.chunks.values())
      .reduce((sum, chunk) => sum + chunk.length, 0);
    
    const result = new Uint8Array(totalLength);
    let offset = 0;
    
    for (let i = 0; i < this.totalChunks; i++) {
      const chunk = this.chunks.get(i);
      result.set(chunk, offset);
      offset += chunk.length;
    }
    
    return result;
  }
}
```

---

## 性能优化建议

### 1. 选择合适的纠错级别

```javascript
// ✅ 推荐：根据数据长度选择
const level = getRecommendedErrorCorrectionLevel(dataLength, 'reliability');
const qrCode = await generateQRCode(data, { errorCorrectionLevel: level });

// ❌ 不推荐：总是使用最高级别
const qrCode = await generateQRCode(data, { errorCorrectionLevel: 'H' });
```

### 2. 批量生成

```javascript
// ✅ 推荐：批量生成
const qrCodes = await generateQRCodeBatch(dataArray);

// ❌ 不推荐：逐个生成
const qrCodes = [];
for (const data of dataArray) {
  qrCodes.push(await generateQRCode(data));
}
```

### 3. 控制二维码大小

```javascript
// ✅ 推荐：根据显示需求选择大小
const qrCode = await generateQRCode(data, { width: 300 });

// ❌ 不推荐：使用过大的尺寸
const qrCode = await generateQRCode(data, { width: 1000 });
```

---

## 注意事项

1. **容量限制**
   - 二维码有容量限制，建议数据 <2KB
   - 使用 `validateQRCodeData` 验证数据

2. **纠错级别**
   - L: 7% 纠错，容量最大
   - M: 15% 纠错，推荐使用
   - Q: 25% 纠错，环境较差时使用
   - H: 30% 纠错，容量最小

3. **性能考虑**
   - 批量生成使用 `generateQRCodeBatch`
   - 大量二维码建议分批生成

4. **解析准确性**
   - 确保图像清晰
   - 光线充足
   - 二维码完整可见

5. **浏览器兼容性**
   - Canvas API 支持
   - ImageData 支持
   - 现代浏览器均支持

---

**最后更新**: 2025-10-06 15:30

