# 校验工具使用指南

## 概述

`hashUtils.js` 提供了完整的数据校验功能，支持 CRC32 和 SHA256 两种算法。

**文件位置**: `src/shared/utils/hashUtils.js`

**主要功能**:
- CRC32 校验（快速、适合分片校验）
- SHA256 哈希（安全、适合文件完整性校验）
- 批量计算
- 完整性验证
- 数据指纹生成

**依赖库**:
- `crc-32` - CRC32 计算
- `js-sha256` - SHA256 计算

---

## API 文档

### CRC32 校验

#### `calculateCRC32(data)`

计算 CRC32 校验值。

**参数**:
- `data` (Uint8Array | ArrayBuffer | string): 要计算校验值的数据

**返回值**: `string` - CRC32 校验值（8位十六进制字符串）

**使用示例**:
```javascript
import { calculateCRC32 } from '@shared/utils/hashUtils';

// 字符串
const crc1 = calculateCRC32('Hello, World!');
console.log('CRC32:', crc1); // 例如: "ec4ac3d0"

// Uint8Array
const data = new Uint8Array([1, 2, 3, 4, 5]);
const crc2 = calculateCRC32(data);
console.log('CRC32:', crc2);

// ArrayBuffer
const buffer = new ArrayBuffer(10);
const crc3 = calculateCRC32(buffer);
console.log('CRC32:', crc3);
```

---

#### `verifyCRC32(data, expectedCrc)`

验证 CRC32 校验值。

**参数**:
- `data` (Uint8Array | ArrayBuffer | string): 要验证的数据
- `expectedCrc` (string): 期望的 CRC32 值

**返回值**: `boolean` - 是否匹配

**使用示例**:
```javascript
import { calculateCRC32, verifyCRC32 } from '@shared/utils/hashUtils';

const data = 'Hello, World!';
const crc = calculateCRC32(data);

// 验证
if (verifyCRC32(data, crc)) {
  console.log('CRC32 校验通过');
} else {
  console.log('CRC32 校验失败');
}

// 大小写不敏感
verifyCRC32(data, crc.toUpperCase()); // true
verifyCRC32(data, crc.toLowerCase()); // true
```

---

### SHA256 哈希

#### `calculateSHA256(data)`

计算 SHA256 哈希值。

**参数**:
- `data` (Uint8Array | ArrayBuffer | string): 要计算哈希值的数据

**返回值**: `string` - SHA256 哈希值（64位十六进制字符串）

**使用示例**:
```javascript
import { calculateSHA256 } from '@shared/utils/hashUtils';

// 字符串
const hash1 = calculateSHA256('Hello, World!');
console.log('SHA256:', hash1);

// Uint8Array
const data = new Uint8Array([1, 2, 3, 4, 5]);
const hash2 = calculateSHA256(data);
console.log('SHA256:', hash2);

// 支持 Unicode
const hash3 = calculateSHA256('你好，世界！🌍');
console.log('SHA256:', hash3);
```

---

#### `verifySHA256(data, expectedHash)`

验证 SHA256 哈希值。

**参数**:
- `data` (Uint8Array | ArrayBuffer | string): 要验证的数据
- `expectedHash` (string): 期望的 SHA256 值

**返回值**: `boolean` - 是否匹配

**使用示例**:
```javascript
import { calculateSHA256, verifySHA256 } from '@shared/utils/hashUtils';

const data = 'Hello, World!';
const hash = calculateSHA256(data);

// 验证
if (verifySHA256(data, hash)) {
  console.log('SHA256 校验通过');
} else {
  console.log('SHA256 校验失败');
}
```

---

### 文件校验

#### `calculateFileCRC32(file)`

计算文件的 CRC32 校验值。

**参数**:
- `file` (File): 文件对象

**返回值**: `Promise<string>` - CRC32 校验值

**使用示例**:
```javascript
import { calculateFileCRC32 } from '@shared/utils/hashUtils';

async function checkFile(file) {
  try {
    const crc = await calculateFileCRC32(file);
    console.log('文件 CRC32:', crc);
  } catch (error) {
    console.error('计算失败:', error);
  }
}
```

---

#### `calculateFileSHA256(file)`

计算文件的 SHA256 哈希值。

**参数**:
- `file` (File): 文件对象

**返回值**: `Promise<string>` - SHA256 哈希值

**使用示例**:
```javascript
import { calculateFileSHA256 } from '@shared/utils/hashUtils';

async function checkFile(file) {
  try {
    const hash = await calculateFileSHA256(file);
    console.log('文件 SHA256:', hash);
  } catch (error) {
    console.error('计算失败:', error);
  }
}
```

---

### 批量计算

#### `calculateCRC32Batch(dataArray)`

批量计算 CRC32 校验值。

**参数**:
- `dataArray` (Array): 数据数组

**返回值**: `string[]` - CRC32 校验值数组

**使用示例**:
```javascript
import { calculateCRC32Batch } from '@shared/utils/hashUtils';

const chunks = [
  new Uint8Array([1, 2, 3]),
  new Uint8Array([4, 5, 6]),
  new Uint8Array([7, 8, 9])
];

const crcs = calculateCRC32Batch(chunks);
console.log('CRC32 列表:', crcs);
// ['xxxxxxxx', 'yyyyyyyy', 'zzzzzzzz']
```

---

#### `calculateSHA256Batch(dataArray)`

批量计算 SHA256 哈希值。

**参数**:
- `dataArray` (Array): 数据数组

**返回值**: `string[]` - SHA256 哈希值数组

**使用示例**:
```javascript
import { calculateSHA256Batch } from '@shared/utils/hashUtils';

const chunks = [
  new Uint8Array([1, 2, 3]),
  new Uint8Array([4, 5, 6]),
  new Uint8Array([7, 8, 9])
];

const hashes = calculateSHA256Batch(chunks);
console.log('SHA256 列表:', hashes);
```

---

### 统计信息

#### `calculateHashWithStats(data, algorithm)`

计算并获取统计信息。

**参数**:
- `data` (Uint8Array | ArrayBuffer | string): 要计算的数据
- `algorithm` (string): 算法类型 ('crc32' 或 'sha256')，默认 'sha256'

**返回值**: `Object`
```typescript
{
  hash: string;              // 校验值/哈希值
  algorithm: string;         // 算法类型
  dataSize: number;          // 数据大小
  hashLength: number;        // 哈希值长度
  calculationTime: number;   // 计算耗时（毫秒）
}
```

**使用示例**:
```javascript
import { calculateHashWithStats } from '@shared/utils/hashUtils';

const data = new Uint8Array(100000);
const result = calculateHashWithStats(data, 'sha256');

console.log('哈希值:', result.hash);
console.log('数据大小:', result.dataSize, '字节');
console.log('计算耗时:', result.calculationTime, 'ms');
```

---

### 完整性验证

#### `verifyIntegrity(data, checksums)`

验证数据完整性。

**参数**:
- `data` (Uint8Array | ArrayBuffer | string): 要验证的数据
- `checksums` (Object): 校验值对象
  - `crc32` (string, 可选): CRC32 校验值
  - `sha256` (string, 可选): SHA256 哈希值

**返回值**: `Object`
```typescript
{
  valid: boolean;      // 是否通过验证
  crc32: boolean;      // CRC32 验证结果
  sha256: boolean;     // SHA256 验证结果
  errors: string[];    // 错误信息列表
}
```

**使用示例**:
```javascript
import { verifyIntegrity, calculateCRC32, calculateSHA256 } from '@shared/utils/hashUtils';

// 发送端
const data = new Uint8Array([1, 2, 3, 4, 5]);
const checksums = {
  crc32: calculateCRC32(data),
  sha256: calculateSHA256(data)
};

// 接收端
const receivedData = new Uint8Array([1, 2, 3, 4, 5]);
const result = verifyIntegrity(receivedData, checksums);

if (result.valid) {
  console.log('数据完整性验证通过');
} else {
  console.error('数据完整性验证失败:', result.errors);
}
```

---

### 数据指纹

#### `generateFingerprint(data)`

生成数据指纹（包含多种校验值）。

**参数**:
- `data` (Uint8Array | ArrayBuffer | string): 要生成指纹的数据

**返回值**: `Object`
```typescript
{
  crc32: string;       // CRC32 校验值
  sha256: string;      // SHA256 哈希值
  dataSize: number;    // 数据大小
  timestamp: number;   // 时间戳
  version: string;     // 版本号
}
```

**使用示例**:
```javascript
import { generateFingerprint } from '@shared/utils/hashUtils';

const data = new Uint8Array([1, 2, 3, 4, 5]);
const fingerprint = generateFingerprint(data);

console.log('数据指纹:', fingerprint);
// {
//   crc32: 'xxxxxxxx',
//   sha256: 'yyyyyyyy...',
//   dataSize: 5,
//   timestamp: 1696598400000,
//   version: '1.0'
// }
```

---

### 数据比较

#### `compareData(data1, data2, algorithm)`

比较两个数据是否相同（通过哈希值）。

**参数**:
- `data1` (Uint8Array | ArrayBuffer | string): 第一个数据
- `data2` (Uint8Array | ArrayBuffer | string): 第二个数据
- `algorithm` (string): 算法类型，默认 'sha256'

**返回值**: `boolean` - 是否相同

**使用示例**:
```javascript
import { compareData } from '@shared/utils/hashUtils';

const data1 = 'Hello, World!';
const data2 = 'Hello, World!';
const data3 = 'Hello, World?';

console.log(compareData(data1, data2)); // true
console.log(compareData(data1, data3)); // false

// 使用 CRC32 比较（更快）
console.log(compareData(data1, data2, 'crc32')); // true
```

---

## 完整使用示例

### 示例 1: 分片传输校验

```javascript
import { splitIntoChunks } from '@shared/utils/fileUtils';
import { calculateCRC32Batch } from '@shared/utils/hashUtils';

// 发送端
function prepareChunks(data) {
  // 1. 分片
  const chunks = splitIntoChunks(data, 2048);
  
  // 2. 计算每个分片的 CRC32
  const crcs = calculateCRC32Batch(chunks);
  
  // 3. 组装传输数据
  const transferData = chunks.map((chunk, index) => ({
    index,
    data: chunk,
    crc32: crcs[index]
  }));
  
  return transferData;
}

// 接收端
function verifyChunks(receivedChunks) {
  const errors = [];
  
  receivedChunks.forEach((item, index) => {
    const actualCrc = calculateCRC32(item.data);
    if (actualCrc !== item.crc32) {
      errors.push(`分片 ${index} 校验失败`);
    }
  });
  
  return errors.length === 0;
}
```

### 示例 2: 文件完整性校验

```javascript
import { calculateFileSHA256, verifySHA256 } from '@shared/utils/hashUtils';
import { readFileAsArrayBuffer } from '@shared/utils/fileUtils';

// 发送端：生成文件哈希
async function generateFileHash(file) {
  const hash = await calculateFileSHA256(file);
  return {
    fileName: file.name,
    fileSize: file.size,
    sha256: hash
  };
}

// 接收端：验证文件
async function verifyFile(file, expectedHash) {
  const buffer = await readFileAsArrayBuffer(file);
  const isValid = verifySHA256(buffer, expectedHash);
  
  if (isValid) {
    console.log('文件完整性验证通过');
  } else {
    console.error('文件已损坏或被篡改');
  }
  
  return isValid;
}
```

### 示例 3: 双重校验

```javascript
import { verifyIntegrity, generateFingerprint } from '@shared/utils/hashUtils';

// 发送端：生成指纹
function createDataPackage(data) {
  const fingerprint = generateFingerprint(data);
  
  return {
    data,
    fingerprint
  };
}

// 接收端：验证指纹
function verifyDataPackage(package) {
  const result = verifyIntegrity(package.data, {
    crc32: package.fingerprint.crc32,
    sha256: package.fingerprint.sha256
  });
  
  if (!result.valid) {
    console.error('数据验证失败:', result.errors);
    return false;
  }
  
  console.log('数据验证通过');
  return true;
}
```

---

## 性能优化建议

### 1. 选择合适的算法

```javascript
// ✅ 分片校验：使用 CRC32（快速）
const chunkCrc = calculateCRC32(chunk);

// ✅ 文件完整性：使用 SHA256（安全）
const fileHash = await calculateFileSHA256(file);
```

### 2. 批量计算

```javascript
// ✅ 推荐：批量计算
const crcs = calculateCRC32Batch(chunks);

// ❌ 不推荐：逐个计算
const crcs = chunks.map(chunk => calculateCRC32(chunk));
```

### 3. 缓存计算结果

```javascript
const hashCache = new Map();

function getCachedHash(data, key) {
  if (hashCache.has(key)) {
    return hashCache.get(key);
  }
  
  const hash = calculateSHA256(data);
  hashCache.set(key, hash);
  return hash;
}
```

---

## 注意事项

1. **算法选择**
   - CRC32：快速，适合分片校验，但不够安全
   - SHA256：安全，适合文件完整性校验，但较慢

2. **性能考虑**
   - 大文件建议使用异步方法（calculateFileSHA256）
   - 批量计算使用批量方法

3. **错误处理**
   - 始终使用 try-catch 捕获异常
   - 验证方法返回 false 而不是抛出异常

4. **大小写**
   - 哈希值比较不区分大小写
   - 建议统一使用小写

5. **数据类型**
   - 支持 string、Uint8Array、ArrayBuffer
   - 字符串自动使用 UTF-8 编码

---

**最后更新**: 2025-10-06 15:00

