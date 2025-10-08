# 二维码生成服务使用指南

## 概述

`qrcodeService.js` 提供二维码生成功能，包括生成、解析和容量计算。

**文件位置**: `src/renderer/src/services/qrcodeService.js`

**主要功能**:
- 生成二维码（Data URL）
- 生成二维码到 Canvas
- 解析二维码
- 计算二维码容量
- 估算二维码版本
- 批量生成

---

## 📋 常量定义

### 二维码选项

```javascript
export const QRCODE_OPTIONS = {
  errorCorrectionLevel: 'M',  // 纠错级别: L(7%), M(15%), Q(25%), H(30%)
  width: 400,                 // 宽度（像素）
  height: 400,                // 高度（像素）
  margin: 2,                  // 边距
  color: {
    dark: '#000000',          // 前景色
    light: '#FFFFFF'          // 背景色
  }
};
```

### 纠错级别

```javascript
export const QRErrorCorrectionLevel = {
  L: 'L',  // 7% 纠错能力
  M: 'M',  // 15% 纠错能力（推荐）
  Q: 'Q',  // 25% 纠错能力
  H: 'H'   // 30% 纠错能力
};
```

---

## 🔧 API 文档

### 二维码生成

#### `generateQRCodeDataURL(data, options)`

生成二维码为 Data URL。

**参数**:
- `data` (string): 要编码的数据
- `options` (Object, 可选)
  - `errorCorrectionLevel` (string): 纠错级别，默认 'M'
  - `width` (number): 宽度，默认 400
  - `height` (number): 高度，默认 400
  - `margin` (number): 边距，默认 2
  - `color` (Object): 颜色配置

**返回值**: `Promise<Object>`

```typescript
{
  success: boolean;
  dataURL?: string;
  stats?: {
    dataLength: number;
    errorCorrectionLevel: string;
    width: number;
    height: number;
    generationTime: string;
  };
  error?: string;
  message?: string;
}
```

**使用示例**:

```javascript
import { generateQRCodeDataURL } from '@/services/qrcodeService';

async function handleGenerateQRCode() {
  const data = 'Hello, World!';
  
  const result = await generateQRCodeDataURL(data, {
    errorCorrectionLevel: 'M',
    width: 400,
    height: 400,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });
  
  if (result.success) {
    console.log('二维码生成成功！');
    console.log('Data URL:', result.dataURL);
    console.log('生成耗时:', result.stats.generationTime + ' ms');
    
    // 显示二维码
    const img = document.createElement('img');
    img.src = result.dataURL;
    document.body.appendChild(img);
  }
}
```

---

#### `generateQRCodeToCanvasElement(canvas, data, options)`

生成二维码到 Canvas 元素。

**参数**:
- `canvas` (HTMLCanvasElement): Canvas 元素
- `data` (string): 要编码的数据
- `options` (Object, 可选)

**返回值**: `Promise<Object>`

**使用示例**:

```javascript
import { generateQRCodeToCanvasElement } from '@/services/qrcodeService';

async function handleGenerateToCanvas() {
  const canvas = document.getElementById('qrcode-canvas');
  const data = 'Hello, World!';
  
  const result = await generateQRCodeToCanvasElement(canvas, data, {
    errorCorrectionLevel: 'M',
    margin: 2
  });
  
  if (result.success) {
    console.log('二维码已生成到 Canvas！');
  }
}
```

---

### 二维码解析

#### `parseQRCodeFromSource(source)`

解析二维码。

**参数**:
- `source` (ImageData|HTMLImageElement|HTMLCanvasElement|string): 图像源

**返回值**: `Promise<Object>`

```typescript
{
  success: boolean;
  data?: string;
  stats?: {
    dataLength: number;
    parsingTime: string;
  };
  error?: string;
  message?: string;
}
```

**使用示例**:

```javascript
import { parseQRCodeFromSource } from '@/services/qrcodeService';

async function handleParseQRCode(imageElement) {
  const result = await parseQRCodeFromSource(imageElement);
  
  if (result.success) {
    console.log('解析成功！');
    console.log('数据:', result.data);
    console.log('解析耗时:', result.stats.parsingTime + ' ms');
  }
}
```

---

### 容量计算

#### `getQRCodeCapacity(data, errorCorrectionLevel)`

计算二维码容量。

**参数**:
- `data` (string): 数据
- `errorCorrectionLevel` (string): 纠错级别，默认 'M'

**返回值**: `Object`

```typescript
{
  success: boolean;
  capacity?: Object;
  canEncode?: boolean;
  version?: number;
  maxCapacity?: number;
  dataLength?: number;
  error?: string;
  message?: string;
}
```

**使用示例**:

```javascript
import { getQRCodeCapacity } from '@/services/qrcodeService';

const data = 'Hello, World!';
const result = getQRCodeCapacity(data, 'M');

if (result.success) {
  console.log('可以编码:', result.canEncode);
  console.log('二维码版本:', result.version);
  console.log('最大容量:', result.maxCapacity);
  console.log('数据长度:', result.dataLength);
}
```

---

#### `estimateQRVersion(dataLength, errorCorrectionLevel)`

估算二维码版本。

**参数**:
- `dataLength` (number): 数据长度
- `errorCorrectionLevel` (string): 纠错级别，默认 'M'

**返回值**: `Object`

**使用示例**:

```javascript
import { estimateQRVersion } from '@/services/qrcodeService';

const dataLength = 1000;
const result = estimateQRVersion(dataLength, 'M');

if (result.success) {
  console.log('估算版本:', result.version);
}
```

---

### 二维码生成器类

#### `QRCodeGenerator`

二维码生成器类，提供批量生成和统计功能。

**构造函数**:

```javascript
const generator = new QRCodeGenerator(options);
```

**选项**:
- `errorCorrectionLevel` (string): 纠错级别，默认 'M'
- `width` (number): 宽度，默认 400
- `height` (number): 高度，默认 400
- `margin` (number): 边距，默认 2
- `color` (Object): 颜色配置

---

#### `generate(data, options)`

生成二维码。

**参数**:
- `data` (string): 数据
- `options` (Object, 可选): 选项（覆盖默认选项）

**返回值**: `Promise<Object>`

**使用示例**:

```javascript
import { QRCodeGenerator } from '@/services/qrcodeService';

const generator = new QRCodeGenerator({
  errorCorrectionLevel: 'M',
  width: 400
});

async function handleGenerate() {
  const result = await generator.generate('Hello, World!');
  
  if (result.success) {
    console.log('二维码:', result.dataURL);
  }
}
```

---

#### `generateToCanvas(canvas, data, options)`

生成二维码到 Canvas。

**参数**:
- `canvas` (HTMLCanvasElement): Canvas 元素
- `data` (string): 数据
- `options` (Object, 可选): 选项

**返回值**: `Promise<Object>`

---

#### `generateBatch(dataArray, options)`

批量生成二维码。

**参数**:
- `dataArray` (Array<string>): 数据数组
- `options` (Object, 可选): 选项

**返回值**: `Promise<Object>`

```typescript
{
  success: boolean;
  total: number;
  succeeded: number;
  failed: number;
  results: Array<Object>;
  errors: Array<Object>;
}
```

**使用示例**:

```javascript
const generator = new QRCodeGenerator();

async function handleBatchGenerate() {
  const dataArray = ['Data1', 'Data2', 'Data3'];
  
  const result = await generator.generateBatch(dataArray);
  
  console.log('总数:', result.total);
  console.log('成功:', result.succeeded);
  console.log('失败:', result.failed);
  
  result.results.forEach(r => {
    console.log(`二维码 ${r.index}:`, r.dataURL);
  });
}
```

---

#### `getStats()`

获取统计信息。

**返回值**: `Object`

```typescript
{
  totalGenerated: number;
  totalFailed: number;
  averageTime: string;
  successRate: string;
}
```

**使用示例**:

```javascript
const stats = generator.getStats();

console.log('总生成数:', stats.totalGenerated);
console.log('失败数:', stats.totalFailed);
console.log('平均耗时:', stats.averageTime + ' ms');
console.log('成功率:', stats.successRate);
```

---

#### `resetStats()`

重置统计信息。

**使用示例**:

```javascript
generator.resetStats();
```

---

#### `setOptions(options)`

设置选项。

**参数**:
- `options` (Object): 新选项

**使用示例**:

```javascript
generator.setOptions({
  errorCorrectionLevel: 'H',
  width: 500
});
```

---

#### `getOptions()`

获取当前选项。

**返回值**: `Object`

**使用示例**:

```javascript
const options = generator.getOptions();
console.log('当前选项:', options);
```

---

## 📝 完整使用示例

### 示例 1: 生成单个二维码

```javascript
import { generateQRCodeDataURL } from '@/services/qrcodeService';

async function generateSingleQRCode() {
  const chunkData = '{"type":"FILE_DATA","index":0,"data":"..."}';
  
  const result = await generateQRCodeDataURL(chunkData, {
    errorCorrectionLevel: 'M',
    width: 400,
    height: 400
  });
  
  if (result.success) {
    // 显示二维码
    const img = document.getElementById('qrcode-img');
    img.src = result.dataURL;
    
    console.log('生成耗时:', result.stats.generationTime + ' ms');
  } else {
    console.error('生成失败:', result.message);
  }
}
```

### 示例 2: 使用生成器批量生成

```javascript
import { QRCodeGenerator } from '@/services/qrcodeService';
import { ChunkManager } from '@/services/chunkService';

async function generateQRCodesForFile() {
  // 1. 创建分片管理器
  const chunkManager = new ChunkManager();
  await chunkManager.initialize(fileInfo, fileData);
  
  // 2. 创建二维码生成器
  const qrGenerator = new QRCodeGenerator({
    errorCorrectionLevel: 'M',
    width: 400,
    height: 400
  });
  
  // 3. 生成所有二维码
  const qrCodes = [];
  
  while (!chunkManager.isCompleted()) {
    const chunkResult = chunkManager.getNextChunk();
    
    if (chunkResult.success) {
      const qrResult = await qrGenerator.generate(chunkResult.chunk);
      
      if (qrResult.success) {
        qrCodes.push({
          index: chunkResult.index,
          dataURL: qrResult.dataURL
        });
        
        console.log(`生成二维码 ${chunkResult.index + 1}/${chunkResult.total}`);
      }
    }
  }
  
  // 4. 查看统计
  const stats = qrGenerator.getStats();
  console.log('生成统计:', stats);
  
  return qrCodes;
}
```

### 示例 3: 实时生成和显示

```javascript
import { QRCodeGenerator } from '@/services/qrcodeService';

async function displayQRCodesRealtime(chunks) {
  const generator = new QRCodeGenerator();
  const canvas = document.getElementById('qrcode-canvas');
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    
    // 生成到 Canvas
    const result = await generator.generateToCanvas(canvas, chunk);
    
    if (result.success) {
      console.log(`显示二维码 ${i + 1}/${chunks.length}`);
      
      // 等待一段时间（控制显示速度）
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
}
```

---

## ⚠️ 注意事项

1. **纠错级别选择**
   - L (7%): 适合干净环境
   - M (15%): 推荐使用（平衡）
   - Q (25%): 适合可能有污损的环境
   - H (30%): 最高纠错，但容量最小

2. **数据容量**
   - 二维码有容量限制
   - 使用 `getQRCodeCapacity` 检查是否可编码
   - 分片大小应控制在 2KB 左右

3. **性能考虑**
   - 生成二维码是异步操作
   - 批量生成时注意内存占用
   - 使用 Canvas 方式可以提高性能

4. **显示建议**
   - 推荐大小: 400x400 像素
   - 保持足够的边距
   - 使用高对比度颜色

---

**最后更新**: 2025-10-06 16:40

