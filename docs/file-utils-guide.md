# 文件处理工具使用指南

## 概述

`fileUtils.js` 提供了一套完整的文件处理工具函数，包括文件读取、分片、合并、验证等功能。

**文件位置**: `src/shared/utils/fileUtils.js`

---

## API 文档

### 文件读取

#### `readFileAsArrayBuffer(file)`

读取文件为 ArrayBuffer。

**参数**:
- `file` (File): 文件对象

**返回值**: `Promise<ArrayBuffer>`

**使用示例**:
```javascript
import { readFileAsArrayBuffer } from '@shared/utils/fileUtils';

const file = document.querySelector('input[type="file"]').files[0];
const buffer = await readFileAsArrayBuffer(file);
console.log('文件大小:', buffer.byteLength);
```

---

#### `readFileAsBase64(file)`

读取文件为 Base64 字符串。

**参数**:
- `file` (File): 文件对象

**返回值**: `Promise<string>`

**使用示例**:
```javascript
import { readFileAsBase64 } from '@shared/utils/fileUtils';

const file = document.querySelector('input[type="file"]').files[0];
const base64 = await readFileAsBase64(file);
console.log('Base64 数据:', base64.substring(0, 50) + '...');
```

---

#### `readFileAsText(file, encoding)`

读取文件为文本。

**参数**:
- `file` (File): 文件对象
- `encoding` (string, 可选): 编码格式，默认 'utf-8'

**返回值**: `Promise<string>`

**使用示例**:
```javascript
import { readFileAsText } from '@shared/utils/fileUtils';

const file = document.querySelector('input[type="file"]').files[0];
const text = await readFileAsText(file);
console.log('文件内容:', text);
```

---

### 数据分片

#### `splitIntoChunks(data, chunkSize)`

将数据分片。

**参数**:
- `data` (ArrayBuffer | Uint8Array): 要分片的数据
- `chunkSize` (number, 可选): 每个分片的大小（字节），默认 2048

**返回值**: `Uint8Array[]`

**使用示例**:
```javascript
import { readFileAsArrayBuffer, splitIntoChunks } from '@shared/utils/fileUtils';

const file = document.querySelector('input[type="file"]').files[0];
const buffer = await readFileAsArrayBuffer(file);
const chunks = splitIntoChunks(buffer, 2048);

console.log('总分片数:', chunks.length);
console.log('第一个分片大小:', chunks[0].length);
```

---

#### `mergeChunks(chunks)`

合并分片。

**参数**:
- `chunks` (Uint8Array[]): 分片数组

**返回值**: `Uint8Array`

**使用示例**:
```javascript
import { mergeChunks } from '@shared/utils/fileUtils';

const chunks = [
  new Uint8Array([1, 2, 3]),
  new Uint8Array([4, 5, 6]),
  new Uint8Array([7, 8, 9])
];

const merged = mergeChunks(chunks);
console.log('合并后的数据:', merged);
// 输出: Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9])
```

---

### 文件信息

#### `getFileInfo(file)`

获取文件信息。

**参数**:
- `file` (File): 文件对象

**返回值**: `Object`
```typescript
{
  name: string;
  size: number;
  type: string;
  lastModified: number;
  lastModifiedDate: Date;
  extension: string;
}
```

**使用示例**:
```javascript
import { getFileInfo } from '@shared/utils/fileUtils';

const file = document.querySelector('input[type="file"]').files[0];
const info = getFileInfo(file);

console.log('文件名:', info.name);
console.log('文件大小:', info.size);
console.log('文件类型:', info.type);
console.log('扩展名:', info.extension);
```

---

#### `getFileExtension(fileName)`

获取文件扩展名。

**参数**:
- `fileName` (string): 文件名

**返回值**: `string` (小写，不含点号)

**使用示例**:
```javascript
import { getFileExtension } from '@shared/utils/fileUtils';

console.log(getFileExtension('document.txt'));  // 'txt'
console.log(getFileExtension('image.PNG'));     // 'png'
console.log(getFileExtension('archive.tar.gz')); // 'gz'
```

---

### 文件验证

#### `validateFileSize(file, maxSize)`

验证文件大小。

**参数**:
- `file` (File): 文件对象
- `maxSize` (number): 最大文件大小（字节）

**返回值**: `boolean`

**使用示例**:
```javascript
import { validateFileSize } from '@shared/utils/fileUtils';

const file = document.querySelector('input[type="file"]').files[0];
const maxSize = 1048576; // 1MB

if (!validateFileSize(file, maxSize)) {
  alert('文件大小超过 1MB 限制');
}
```

---

#### `validateFileType(file, allowedTypes)`

验证文件类型。

**参数**:
- `file` (File): 文件对象
- `allowedTypes` (string[]): 允许的文件类型数组（扩展名）

**返回值**: `boolean`

**使用示例**:
```javascript
import { validateFileType } from '@shared/utils/fileUtils';

const file = document.querySelector('input[type="file"]').files[0];
const allowedTypes = ['txt', 'md', 'json'];

if (!validateFileType(file, allowedTypes)) {
  alert('只支持 txt、md、json 文件');
}
```

---

### 工具函数

#### `formatFileSize(bytes, decimals)`

格式化文件大小。

**参数**:
- `bytes` (number): 字节数
- `decimals` (number, 可选): 小数位数，默认 2

**返回值**: `string`

**使用示例**:
```javascript
import { formatFileSize } from '@shared/utils/fileUtils';

console.log(formatFileSize(0));        // '0 Bytes'
console.log(formatFileSize(1024));     // '1 KB'
console.log(formatFileSize(1048576));  // '1 MB'
console.log(formatFileSize(1536));     // '1.5 KB'
```

---

#### `calculateChunkCount(fileSize, chunkSize)`

计算分片数量。

**参数**:
- `fileSize` (number): 文件大小（字节）
- `chunkSize` (number): 分片大小（字节）

**返回值**: `number`

**使用示例**:
```javascript
import { calculateChunkCount } from '@shared/utils/fileUtils';

const fileSize = 10240;
const chunkSize = 2048;
const count = calculateChunkCount(fileSize, chunkSize);

console.log('需要', count, '个分片'); // 需要 5 个分片
```

---

#### `getChunkInfo(chunkIndex, totalChunks, chunkSize, fileSize)`

获取分片信息。

**参数**:
- `chunkIndex` (number): 分片索引（从 0 开始）
- `totalChunks` (number): 总分片数
- `chunkSize` (number): 分片大小
- `fileSize` (number): 文件总大小

**返回值**: `Object`
```typescript
{
  index: number;
  start: number;
  end: number;
  size: number;
  isLast: boolean;
  progress: string;
}
```

**使用示例**:
```javascript
import { getChunkInfo } from '@shared/utils/fileUtils';

const info = getChunkInfo(0, 5, 2048, 10240);

console.log('分片索引:', info.index);      // 0
console.log('起始位置:', info.start);      // 0
console.log('结束位置:', info.end);        // 2048
console.log('分片大小:', info.size);       // 2048
console.log('是否最后:', info.isLast);     // false
console.log('进度:', info.progress);       // '20.00'
```

---

### 数据转换

#### `arrayBufferToUint8Array(buffer)`

ArrayBuffer 转 Uint8Array。

**参数**:
- `buffer` (ArrayBuffer): ArrayBuffer

**返回值**: `Uint8Array`

---

#### `uint8ArrayToArrayBuffer(uint8Array)`

Uint8Array 转 ArrayBuffer。

**参数**:
- `uint8Array` (Uint8Array): Uint8Array

**返回值**: `ArrayBuffer`

---

#### `createBlob(data, type)`

创建 Blob 对象。

**参数**:
- `data` (Uint8Array | ArrayBuffer): 数据
- `type` (string, 可选): MIME 类型，默认 'application/octet-stream'

**返回值**: `Blob`

---

#### `downloadFile(data, fileName, type)`

下载文件。

**参数**:
- `data` (Blob | Uint8Array | ArrayBuffer): 文件数据
- `fileName` (string): 文件名
- `type` (string, 可选): MIME 类型

**使用示例**:
```javascript
import { downloadFile } from '@shared/utils/fileUtils';

const data = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
downloadFile(data, 'hello.txt', 'text/plain');
```

---

## 完整使用示例

### 示例 1: 文件分片和合并

```javascript
import {
  readFileAsArrayBuffer,
  splitIntoChunks,
  mergeChunks,
  calculateChunkCount
} from '@shared/utils/fileUtils';

async function processFile(file) {
  // 1. 读取文件
  const buffer = await readFileAsArrayBuffer(file);
  console.log('文件大小:', buffer.byteLength);
  
  // 2. 计算分片数量
  const chunkSize = 2048;
  const chunkCount = calculateChunkCount(buffer.byteLength, chunkSize);
  console.log('分片数量:', chunkCount);
  
  // 3. 分片
  const chunks = splitIntoChunks(buffer, chunkSize);
  console.log('实际分片数:', chunks.length);
  
  // 4. 合并（模拟接收端）
  const merged = mergeChunks(chunks);
  console.log('合并后大小:', merged.length);
  
  // 5. 验证
  const original = new Uint8Array(buffer);
  const isEqual = original.every((byte, index) => byte === merged[index]);
  console.log('数据完整性:', isEqual ? '✓' : '✗');
}
```

### 示例 2: 文件验证

```javascript
import {
  getFileInfo,
  validateFileSize,
  validateFileType,
  formatFileSize
} from '@shared/utils/fileUtils';

function validateFile(file) {
  // 获取文件信息
  const info = getFileInfo(file);
  console.log('文件信息:', info);
  
  // 验证文件大小（1MB）
  const maxSize = 1048576;
  if (!validateFileSize(file, maxSize)) {
    throw new Error(`文件大小超过限制（最大 ${formatFileSize(maxSize)}）`);
  }
  
  // 验证文件类型
  const allowedTypes = ['txt', 'md', 'json', 'doc', 'docx'];
  if (!validateFileType(file, allowedTypes)) {
    throw new Error(`不支持的文件类型（仅支持 ${allowedTypes.join(', ')}）`);
  }
  
  console.log('文件验证通过 ✓');
  return true;
}
```

---

## 注意事项

1. **内存使用**
   - 大文件会占用大量内存
   - 建议使用流式处理（将在后续版本实现）

2. **浏览器兼容性**
   - FileReader API 需要现代浏览器支持
   - Uint8Array 和 ArrayBuffer 在所有现代浏览器中都可用

3. **错误处理**
   - 所有异步函数都应使用 try-catch 处理错误
   - 文件读取失败会抛出错误

4. **性能优化**
   - 分片大小应根据实际情况调整
   - 默认 2048 字节适合二维码传输

---

**最后更新**: 2025-10-06 12:00

