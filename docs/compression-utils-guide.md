# 压缩工具使用指南

## 概述

`compressionUtils.js` 提供了基于 pako 库的 gzip 压缩和解压缩功能，用于减小文件传输大小。

**文件位置**: `src/shared/utils/compressionUtils.js`

**依赖库**: pako 2.1.0

---

## API 文档

### 基础压缩和解压

#### `compress(data, options)`

压缩数据（gzip 格式）。

**参数**:
- `data` (Uint8Array | ArrayBuffer | string): 要压缩的数据
- `options` (Object, 可选): 压缩选项
  - `level` (number): 压缩级别 (0-9)，默认 6
    - 0: 不压缩
    - 1-3: 快速压缩
    - 4-6: 平衡压缩（推荐）
    - 7-9: 最大压缩

**返回值**: `Uint8Array` - 压缩后的数据

**使用示例**:
```javascript
import { compress } from '@shared/utils/compressionUtils';

// 压缩 Uint8Array
const data = new Uint8Array([1, 2, 3, 4, 5]);
const compressed = compress(data);

// 压缩字符串
const text = 'Hello, World!';
const compressedText = compress(text);

// 使用自定义压缩级别
const highCompressed = compress(data, { level: 9 });
```

---

#### `decompress(compressedData, options)`

解压缩数据（gzip 格式）。

**参数**:
- `compressedData` (Uint8Array | ArrayBuffer): 压缩的数据
- `options` (Object, 可选): 解压选项
  - `to` (string): 输出格式 ('string' 或 'uint8array')，默认 'uint8array'

**返回值**: `Uint8Array | string` - 解压后的数据

**使用示例**:
```javascript
import { compress, decompress } from '@shared/utils/compressionUtils';

const data = new Uint8Array([1, 2, 3, 4, 5]);
const compressed = compress(data);

// 解压为 Uint8Array
const decompressed = decompress(compressed);

// 解压为字符串
const text = 'Hello, World!';
const compressedText = compress(text);
const decompressedText = decompress(compressedText, { to: 'string' });
```

---

### 字符串专用函数

#### `compressString(str, options)`

压缩字符串。

**参数**:
- `str` (string): 要压缩的字符串
- `options` (Object, 可选): 压缩选项

**返回值**: `Uint8Array`

**使用示例**:
```javascript
import { compressString } from '@shared/utils/compressionUtils';

const text = 'This is a long text that needs compression...';
const compressed = compressString(text);
```

---

#### `decompressToString(compressedData)`

解压缩为字符串。

**参数**:
- `compressedData` (Uint8Array | ArrayBuffer): 压缩的数据

**返回值**: `string`

**使用示例**:
```javascript
import { compressString, decompressToString } from '@shared/utils/compressionUtils';

const text = 'Hello, World!';
const compressed = compressString(text);
const decompressed = decompressToString(compressed);

console.log(decompressed); // 'Hello, World!'
```

---

### 统计和分析

#### `getCompressionRatio(originalSize, compressedSize)`

计算压缩率。

**参数**:
- `originalSize` (number): 原始大小（字节）
- `compressedSize` (number): 压缩后大小（字节）

**返回值**: `Object`
```typescript
{
  ratio: number;           // 压缩比例 (0-1+)
  percentage: number;      // 压缩百分比
  saved: number;           // 节省的字节数
  savedPercentage: number; // 节省的百分比
}
```

**使用示例**:
```javascript
import { getCompressionRatio } from '@shared/utils/compressionUtils';

const ratio = getCompressionRatio(1000, 300);

console.log('压缩比例:', ratio.ratio);           // 0.3
console.log('压缩百分比:', ratio.percentage);     // 30%
console.log('节省字节:', ratio.saved);            // 700
console.log('节省百分比:', ratio.savedPercentage); // 70%
```

---

#### `isGzipCompressed(data)`

检查数据是否为 gzip 格式。

**参数**:
- `data` (Uint8Array | ArrayBuffer): 要检查的数据

**返回值**: `boolean`

**使用示例**:
```javascript
import { compress, isGzipCompressed } from '@shared/utils/compressionUtils';

const data = new Uint8Array([1, 2, 3]);
const compressed = compress(data);

console.log(isGzipCompressed(data));       // false
console.log(isGzipCompressed(compressed)); // true
```

---

#### `compressWithStats(data, options)`

压缩并返回详细统计信息。

**参数**:
- `data` (Uint8Array | ArrayBuffer | string): 要压缩的数据
- `options` (Object, 可选): 压缩选项

**返回值**: `Object`
```typescript
{
  data: Uint8Array;        // 压缩后的数据
  originalSize: number;    // 原始大小
  compressedSize: number;  // 压缩后大小
  compressionTime: number; // 压缩耗时（毫秒）
  ratio: number;           // 压缩比例
  percentage: number;      // 压缩百分比
  saved: number;           // 节省的字节数
  savedPercentage: number; // 节省的百分比
}
```

**使用示例**:
```javascript
import { compressWithStats } from '@shared/utils/compressionUtils';

const data = new Uint8Array(10000).fill(65); // 10KB 的 'A'
const result = compressWithStats(data);

console.log('原始大小:', result.originalSize);
console.log('压缩后大小:', result.compressedSize);
console.log('压缩耗时:', result.compressionTime, 'ms');
console.log('节省:', result.savedPercentage, '%');
```

---

#### `decompressWithStats(compressedData, options)`

解压并返回详细统计信息。

**参数**:
- `compressedData` (Uint8Array | ArrayBuffer): 压缩的数据
- `options` (Object, 可选): 解压选项

**返回值**: `Object`
```typescript
{
  data: Uint8Array | string;  // 解压后的数据
  compressedSize: number;     // 压缩数据大小
  decompressedSize: number;   // 解压后大小
  decompressionTime: number;  // 解压耗时（毫秒）
  ratio: number;              // 压缩比例
  percentage: number;         // 压缩百分比
  saved: number;              // 节省的字节数
  savedPercentage: number;    // 节省的百分比
}
```

---

### 批量操作

#### `compressBatch(dataArray, options)`

批量压缩多个数据块。

**参数**:
- `dataArray` (Array): 数据数组
- `options` (Object, 可选): 压缩选项

**返回值**: `Array<Uint8Array>`

**使用示例**:
```javascript
import { compressBatch } from '@shared/utils/compressionUtils';

const chunks = [
  new Uint8Array([1, 2, 3]),
  new Uint8Array([4, 5, 6]),
  new Uint8Array([7, 8, 9])
];

const compressed = compressBatch(chunks);
console.log('压缩了', compressed.length, '个数据块');
```

---

#### `decompressBatch(compressedArray, options)`

批量解压多个数据块。

**参数**:
- `compressedArray` (Array): 压缩数据数组
- `options` (Object, 可选): 解压选项

**返回值**: `Array<Uint8Array | string>`

---

### 工具函数

#### `getRecommendedCompressionLevel(fileSize, priority)`

获取推荐的压缩级别。

**参数**:
- `fileSize` (number): 文件大小（字节）
- `priority` (string, 可选): 优先级
  - `'speed'`: 速度优先
  - `'size'`: 大小优先
  - `'balanced'`: 平衡（默认）

**返回值**: `number` - 推荐的压缩级别 (0-9)

**使用示例**:
```javascript
import { getRecommendedCompressionLevel, compress } from '@shared/utils/compressionUtils';

const fileSize = 500000; // 500KB
const level = getRecommendedCompressionLevel(fileSize, 'speed');

const compressed = compress(data, { level });
```

---

## 完整使用示例

### 示例 1: 文件压缩和解压

```javascript
import {
  readFileAsArrayBuffer
} from '@shared/utils/fileUtils';
import {
  compressWithStats,
  decompressWithStats
} from '@shared/utils/compressionUtils';

async function compressFile(file) {
  // 1. 读取文件
  const buffer = await readFileAsArrayBuffer(file);
  
  // 2. 压缩并获取统计信息
  const result = compressWithStats(buffer);
  
  console.log('压缩统计:');
  console.log('- 原始大小:', result.originalSize, '字节');
  console.log('- 压缩后大小:', result.compressedSize, '字节');
  console.log('- 节省:', result.savedPercentage, '%');
  console.log('- 耗时:', result.compressionTime, 'ms');
  
  return result.data;
}

async function decompressFile(compressedData) {
  // 解压并获取统计信息
  const result = decompressWithStats(compressedData);
  
  console.log('解压统计:');
  console.log('- 解压后大小:', result.decompressedSize, '字节');
  console.log('- 耗时:', result.decompressionTime, 'ms');
  
  return result.data;
}
```

### 示例 2: 分片压缩

```javascript
import { splitIntoChunks } from '@shared/utils/fileUtils';
import { compressBatch, decompressBatch } from '@shared/utils/compressionUtils';

function compressChunks(data, chunkSize = 2048) {
  // 1. 分片
  const chunks = splitIntoChunks(data, chunkSize);
  console.log('分片数量:', chunks.length);
  
  // 2. 批量压缩
  const compressed = compressBatch(chunks);
  
  // 3. 计算总压缩率
  const originalSize = data.length;
  const compressedSize = compressed.reduce((sum, chunk) => sum + chunk.length, 0);
  
  console.log('原始大小:', originalSize);
  console.log('压缩后大小:', compressedSize);
  console.log('压缩率:', ((1 - compressedSize / originalSize) * 100).toFixed(2), '%');
  
  return compressed;
}
```

---

## 性能优化建议

### 1. 选择合适的压缩级别

```javascript
// 小文件，速度优先
const level = getRecommendedCompressionLevel(fileSize, 'speed');

// 大文件，大小优先
const level = getRecommendedCompressionLevel(fileSize, 'size');
```

### 2. 批量操作

```javascript
// ✅ 推荐：批量压缩
const compressed = compressBatch(chunks);

// ❌ 不推荐：逐个压缩
const compressed = chunks.map(chunk => compress(chunk));
```

### 3. 检查是否已压缩

```javascript
if (!isGzipCompressed(data)) {
  data = compress(data);
}
```

---

## 注意事项

1. **压缩效果**
   - 重复数据压缩效果好
   - 随机数据压缩效果差
   - 已压缩的数据（如 JPEG、PNG）不建议再压缩

2. **性能考虑**
   - 压缩级别越高，耗时越长
   - 小文件（< 1KB）压缩可能反而变大
   - 建议对 > 1KB 的数据进行压缩

3. **内存使用**
   - 压缩和解压都需要额外内存
   - 大文件建议分片处理

4. **错误处理**
   - 始终使用 try-catch 处理压缩/解压错误
   - 验证数据格式（使用 `isGzipCompressed`）

---

**最后更新**: 2025-10-06 14:00

