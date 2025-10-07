# 编码工具使用指南

## 概述

`encodingUtils.js` 提供了完整的 Base64 编码和解码功能，支持多种数据类型转换。

**文件位置**: `src/shared/utils/encodingUtils.js`

**主要功能**:
- Uint8Array ↔ Base64
- ArrayBuffer ↔ Base64
- String ↔ Base64
- URL 安全的 Base64 编码
- 分块编码/解码
- 编码统计信息

---

## API 文档

### Uint8Array 和 Base64 互转

#### `uint8ArrayToBase64(uint8Array)`

将 Uint8Array 编码为 Base64 字符串。

**参数**:
- `uint8Array` (Uint8Array): 要编码的数据

**返回值**: `string` - Base64 字符串

**使用示例**:
```javascript
import { uint8ArrayToBase64 } from '@shared/utils/encodingUtils';

const data = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
const base64 = uint8ArrayToBase64(data);
console.log(base64); // "SGVsbG8="
```

---

#### `base64ToUint8Array(base64String)`

将 Base64 字符串解码为 Uint8Array。

**参数**:
- `base64String` (string): Base64 字符串

**返回值**: `Uint8Array` - 解码后的数据

**使用示例**:
```javascript
import { base64ToUint8Array } from '@shared/utils/encodingUtils';

const base64 = 'SGVsbG8=';
const data = base64ToUint8Array(base64);
console.log(data); // Uint8Array([72, 101, 108, 108, 111])
```

---

### ArrayBuffer 和 Base64 互转

#### `arrayBufferToBase64(arrayBuffer)`

将 ArrayBuffer 编码为 Base64 字符串。

**参数**:
- `arrayBuffer` (ArrayBuffer): 要编码的数据

**返回值**: `string` - Base64 字符串

**使用示例**:
```javascript
import { arrayBufferToBase64 } from '@shared/utils/encodingUtils';

const buffer = new ArrayBuffer(5);
const view = new Uint8Array(buffer);
view.set([72, 101, 108, 108, 111]);

const base64 = arrayBufferToBase64(buffer);
console.log(base64); // "SGVsbG8="
```

---

#### `base64ToArrayBuffer(base64String)`

将 Base64 字符串解码为 ArrayBuffer。

**参数**:
- `base64String` (string): Base64 字符串

**返回值**: `ArrayBuffer` - 解码后的数据

**使用示例**:
```javascript
import { base64ToArrayBuffer } from '@shared/utils/encodingUtils';

const base64 = 'SGVsbG8=';
const buffer = base64ToArrayBuffer(base64);
console.log(buffer.byteLength); // 5
```

---

### 字符串和 Base64 互转

#### `stringToBase64(str, encoding)`

将字符串编码为 Base64。

**参数**:
- `str` (string): 要编码的字符串
- `encoding` (string, 可选): 字符编码，默认 'utf-8'

**返回值**: `string` - Base64 字符串

**使用示例**:
```javascript
import { stringToBase64 } from '@shared/utils/encodingUtils';

const text = 'Hello, World!';
const base64 = stringToBase64(text);
console.log(base64);

// 支持 Unicode
const chinese = '你好，世界！';
const base64Chinese = stringToBase64(chinese);
console.log(base64Chinese);
```

---

#### `base64ToString(base64String, encoding)`

将 Base64 字符串解码为字符串。

**参数**:
- `base64String` (string): Base64 字符串
- `encoding` (string, 可选): 字符编码，默认 'utf-8'

**返回值**: `string` - 解码后的字符串

**使用示例**:
```javascript
import { stringToBase64, base64ToString } from '@shared/utils/encodingUtils';

const text = 'Hello, World!';
const base64 = stringToBase64(text);
const decoded = base64ToString(base64);
console.log(decoded); // "Hello, World!"
```

---

### 验证和计算

#### `isValidBase64(str)`

验证 Base64 字符串格式。

**参数**:
- `str` (string): 要验证的字符串

**返回值**: `boolean` - 是否为有效的 Base64 字符串

**使用示例**:
```javascript
import { isValidBase64 } from '@shared/utils/encodingUtils';

console.log(isValidBase64('SGVsbG8=')); // true
console.log(isValidBase64('Hello!')); // false
console.log(isValidBase64('SGVsbG8')); // false (长度不是 4 的倍数)
```

---

#### `getBase64Size(originalSize)`

计算 Base64 编码后的大小。

**参数**:
- `originalSize` (number): 原始数据大小（字节）

**返回值**: `number` - Base64 编码后的大小（字节）

**使用示例**:
```javascript
import { getBase64Size } from '@shared/utils/encodingUtils';

const originalSize = 1000;
const encodedSize = getBase64Size(originalSize);
console.log('原始大小:', originalSize);
console.log('编码后大小:', encodedSize);
console.log('增加:', ((encodedSize / originalSize - 1) * 100).toFixed(2) + '%');
```

---

#### `getDecodedSize(base64String)`

计算 Base64 解码后的大小。

**参数**:
- `base64String` (string): Base64 字符串

**返回值**: `number` - 解码后的大小（字节）

**使用示例**:
```javascript
import { getDecodedSize } from '@shared/utils/encodingUtils';

const base64 = 'SGVsbG8gV29ybGQh';
const size = getDecodedSize(base64);
console.log('解码后大小:', size, '字节');
```

---

### 分块编码和解码

#### `encodeInChunks(data, chunkSize)`

分块编码大数据。

**参数**:
- `data` (Uint8Array | ArrayBuffer): 要编码的数据
- `chunkSize` (number, 可选): 每块的大小（字节），默认 1MB

**返回值**: `string[]` - Base64 字符串数组

**使用示例**:
```javascript
import { encodeInChunks } from '@shared/utils/encodingUtils';

const largeData = new Uint8Array(5000000); // 5MB
const chunks = encodeInChunks(largeData, 1048576); // 1MB 每块

console.log('分块数量:', chunks.length);
chunks.forEach((chunk, index) => {
  console.log(`块 ${index + 1} 大小:`, chunk.length);
});
```

---

#### `decodeChunks(base64Chunks)`

解码分块数据。

**参数**:
- `base64Chunks` (string[]): Base64 字符串数组

**返回值**: `Uint8Array` - 解码后的完整数据

**使用示例**:
```javascript
import { encodeInChunks, decodeChunks } from '@shared/utils/encodingUtils';

const original = new Uint8Array(5000000);
const chunks = encodeInChunks(original, 1048576);
const decoded = decodeChunks(chunks);

console.log('原始大小:', original.length);
console.log('解码后大小:', decoded.length);
console.log('数据一致:', original.every((byte, i) => byte === decoded[i]));
```

---

### URL 安全的 Base64

#### `encodeBase64Url(data)`

URL 安全的 Base64 编码。

**参数**:
- `data` (Uint8Array | ArrayBuffer | string): 要编码的数据

**返回值**: `string` - URL 安全的 Base64 字符串

**特点**:
- 将 `+` 替换为 `-`
- 将 `/` 替换为 `_`
- 移除填充字符 `=`

**使用示例**:
```javascript
import { encodeBase64Url } from '@shared/utils/encodingUtils';

const data = new Uint8Array([255, 254, 253]);
const urlSafe = encodeBase64Url(data);

console.log('URL 安全:', urlSafe);
console.log('可用于 URL:', `https://example.com/data/${urlSafe}`);
```

---

#### `decodeBase64Url(base64UrlString)`

URL 安全的 Base64 解码。

**参数**:
- `base64UrlString` (string): URL 安全的 Base64 字符串

**返回值**: `Uint8Array` - 解码后的数据

**使用示例**:
```javascript
import { encodeBase64Url, decodeBase64Url } from '@shared/utils/encodingUtils';

const data = new Uint8Array([255, 254, 253]);
const urlSafe = encodeBase64Url(data);
const decoded = decodeBase64Url(urlSafe);

console.log('解码成功:', decoded.every((byte, i) => byte === data[i]));
```

---

### 统计信息

#### `encodeWithStats(data)`

编码并获取统计信息。

**参数**:
- `data` (Uint8Array | ArrayBuffer | string): 要编码的数据

**返回值**: `Object`
```typescript
{
  data: string;              // Base64 字符串
  originalSize: number;      // 原始大小
  encodedSize: number;       // 编码后大小
  encodingTime: number;      // 编码耗时（毫秒）
  overhead: number;          // 增加的字节数
  overheadPercentage: number; // 增加的百分比
}
```

**使用示例**:
```javascript
import { encodeWithStats } from '@shared/utils/encodingUtils';

const data = new Uint8Array(10000);
const result = encodeWithStats(data);

console.log('编码统计:');
console.log('- 原始大小:', result.originalSize, '字节');
console.log('- 编码后大小:', result.encodedSize, '字节');
console.log('- 增加:', result.overheadPercentage, '%');
console.log('- 耗时:', result.encodingTime, 'ms');
```

---

## 完整使用示例

### 示例 1: 文件编码和传输

```javascript
import { readFileAsArrayBuffer } from '@shared/utils/fileUtils';
import { arrayBufferToBase64, base64ToArrayBuffer } from '@shared/utils/encodingUtils';

async function encodeFile(file) {
  // 1. 读取文件
  const buffer = await readFileAsArrayBuffer(file);
  
  // 2. 编码为 Base64
  const base64 = arrayBufferToBase64(buffer);
  
  console.log('文件大小:', buffer.byteLength);
  console.log('Base64 大小:', base64.length);
  
  return base64;
}

function decodeFile(base64) {
  // 解码 Base64
  const buffer = base64ToArrayBuffer(base64);
  
  console.log('解码后大小:', buffer.byteLength);
  
  return buffer;
}
```

### 示例 2: 分片编码

```javascript
import { splitIntoChunks } from '@shared/utils/fileUtils';
import { uint8ArrayToBase64, base64ToUint8Array } from '@shared/utils/encodingUtils';

function encodeChunks(data, chunkSize = 2048) {
  // 1. 分片
  const chunks = splitIntoChunks(data, chunkSize);
  
  // 2. 编码每个分片
  const encodedChunks = chunks.map((chunk, index) => {
    const base64 = uint8ArrayToBase64(chunk);
    return {
      index,
      data: base64,
      size: base64.length
    };
  });
  
  console.log('分片数量:', encodedChunks.length);
  
  return encodedChunks;
}

function decodeChunks(encodedChunks) {
  // 解码每个分片
  const chunks = encodedChunks.map(item => base64ToUint8Array(item.data));
  
  // 合并分片
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  
  return result;
}
```

### 示例 3: 压缩后编码

```javascript
import { compress, decompress } from '@shared/utils/compressionUtils';
import { uint8ArrayToBase64, base64ToUint8Array } from '@shared/utils/encodingUtils';

function compressAndEncode(data) {
  // 1. 压缩
  const compressed = compress(data);
  console.log('压缩后大小:', compressed.length);
  
  // 2. 编码
  const base64 = uint8ArrayToBase64(compressed);
  console.log('Base64 大小:', base64.length);
  
  return base64;
}

function decodeAndDecompress(base64) {
  // 1. 解码
  const compressed = base64ToUint8Array(base64);
  
  // 2. 解压
  const decompressed = decompress(compressed);
  
  return decompressed;
}
```

---

## 性能优化建议

### 1. 大数据使用分块编码

```javascript
// ✅ 推荐：分块编码
const chunks = encodeInChunks(largeData, 1048576);

// ❌ 不推荐：一次性编码大数据
const base64 = uint8ArrayToBase64(largeData); // 可能导致内存问题
```

### 2. 验证 Base64 格式

```javascript
if (isValidBase64(input)) {
  const decoded = base64ToUint8Array(input);
} else {
  console.error('无效的 Base64 字符串');
}
```

### 3. 预计算编码大小

```javascript
const originalSize = data.length;
const estimatedSize = getBase64Size(originalSize);

if (estimatedSize > maxSize) {
  console.warn('编码后将超过大小限制');
}
```

---

## 注意事项

1. **大小增加**
   - Base64 编码会增加约 33% 的大小
   - 建议先压缩再编码

2. **内存使用**
   - 编码和解码都需要额外内存
   - 大文件建议使用分块处理

3. **字符编码**
   - 默认使用 UTF-8 编码
   - 支持其他编码格式

4. **URL 安全**
   - 在 URL 中使用 Base64 时，使用 `encodeBase64Url`
   - 避免 `+`、`/`、`=` 字符导致的问题

5. **错误处理**
   - 始终验证输入数据类型
   - 使用 `isValidBase64` 验证 Base64 字符串

---

**最后更新**: 2025-10-06 14:30

