# 数据分片服务使用指南

## 概述

`chunkService.js` 提供数据分片功能，包括传输包创建、分片编码解码和分片管理。

**文件位置**: `src/renderer/src/services/chunkService.js`

**主要功能**:
- 创建文件传输包
- 分片编码和解码
- 分片管理（发送端）
- 分片收集（接收端）

---

## 📋 常量定义

### 分片选项

```javascript
export const CHUNK_OPTIONS = {
  chunkSize: 2048,      // 分片大小（字节）
  compress: true,       // 是否压缩分片
  encode: true,         // 是否编码为 JSON
  validate: true        // 是否验证分片
};
```

---

## 🔧 API 文档

### 传输包创建

#### `createFileTransferPackage(fileInfo, fileData, options)`

创建文件传输包。

**参数**:
- `fileInfo` (Object): 文件信息
  - `name` (string): 文件名
  - `size` (number): 文件大小
  - `type` (string): 文件类型
- `fileData` (Uint8Array): 文件数据（已预处理）
- `options` (Object, 可选)
  - `chunkSize` (number): 分片大小，默认 2048
  - `compress` (boolean): 是否压缩，默认 true

**返回值**: `Object`

```typescript
{
  success: boolean;
  package?: {
    chunks: Array<Object>;
    header: Object;
    footer: Object;
  };
  stats?: {
    totalChunks: number;
    chunkSize: number;
    fileSize: number;
    creationTime: string;
  };
  error?: string;
  message?: string;
}
```

**使用示例**:

```javascript
import { createFileTransferPackage } from '@/services/chunkService';

const fileInfo = {
  name: 'document.pdf',
  size: 102400,
  type: '.pdf'
};
const fileData = new Uint8Array([...]); // 预处理后的数据

const result = createFileTransferPackage(fileInfo, fileData, {
  chunkSize: 2048,
  compress: true
});

if (result.success) {
  console.log('传输包创建成功！');
  console.log('总分片数:', result.stats.totalChunks);
  console.log('分片大小:', result.stats.chunkSize);
  console.log('创建耗时:', result.stats.creationTime + ' ms');
  
  const chunks = result.package.chunks;
  // 使用分片...
}
```

---

### 分片编码

#### `encodeChunks(chunks, options)`

编码分片为 JSON 字符串。

**参数**:
- `chunks` (Array<Object>): 分片数组
- `options` (Object, 可选)
  - `validate` (boolean): 是否验证，默认 true

**返回值**: `Object`

```typescript
{
  success: boolean;
  encodedChunks?: Array<string>;
  errors?: Array<Object>;
  stats?: {
    total: number;
    succeeded: number;
    failed: number;
    encodingTime: string;
  };
  error?: string;
  message?: string;
}
```

**使用示例**:

```javascript
import { encodeChunks } from '@/services/chunkService';

const chunks = [...]; // 分片数组

const result = encodeChunks(chunks, {
  validate: true
});

if (result.success) {
  console.log('编码成功！');
  console.log('成功:', result.stats.succeeded);
  console.log('失败:', result.stats.failed);
  
  const encodedChunks = result.encodedChunks;
  // 使用编码后的分片...
} else {
  console.error('编码失败:');
  result.errors.forEach(e => {
    console.error(`分片 ${e.index}: ${e.message}`);
  });
}
```

---

### 分片解码

#### `decodeChunks(encodedChunks, options)`

解码 JSON 字符串为分片。

**参数**:
- `encodedChunks` (Array<string>): 编码的分片数组
- `options` (Object, 可选)
  - `validate` (boolean): 是否验证，默认 true

**返回值**: `Object`

**使用示例**:

```javascript
import { decodeChunks } from '@/services/chunkService';

const encodedChunks = [...]; // 编码的分片数组

const result = decodeChunks(encodedChunks, {
  validate: true
});

if (result.success) {
  console.log('解码成功！');
  const chunks = result.chunks;
  // 使用解码后的分片...
}
```

---

### 分片管理器（发送端）

#### `ChunkManager`

分片管理器类，用于管理文件传输的分片。

**构造函数**:

```javascript
const manager = new ChunkManager(options);
```

**选项**:
- `chunkSize` (number): 分片大小，默认 2048
- `compress` (boolean): 是否压缩，默认 true
- `validate` (boolean): 是否验证，默认 true

---

#### `initialize(fileInfo, fileData)`

初始化分片管理器。

**参数**:
- `fileInfo` (Object): 文件信息
- `fileData` (Uint8Array): 文件数据

**返回值**: `Object`

```typescript
{
  success: boolean;
  totalChunks?: number;
  chunkSize?: number;
  error?: string;
  message?: string;
}
```

**使用示例**:

```javascript
import { ChunkManager } from '@/services/chunkService';

const manager = new ChunkManager({
  chunkSize: 2048,
  compress: true
});

const fileInfo = {
  name: 'document.pdf',
  size: 102400,
  type: '.pdf'
};
const fileData = new Uint8Array([...]); // 预处理后的数据

const result = manager.initialize(fileInfo, fileData);

if (result.success) {
  console.log('初始化成功！');
  console.log('总分片数:', result.totalChunks);
}
```

---

#### `getNextChunk()`

获取下一个分片。

**返回值**: `Object`

```typescript
{
  success: boolean;
  chunk?: string;
  index?: number;
  total?: number;
  progress?: string;
  completed?: boolean;
  error?: string;
  message?: string;
}
```

**使用示例**:

```javascript
const result = manager.getNextChunk();

if (result.success) {
  console.log('分片索引:', result.index);
  console.log('总分片数:', result.total);
  console.log('进度:', result.progress + '%');
  
  const chunk = result.chunk;
  // 生成二维码并显示...
} else if (result.completed) {
  console.log('所有分片已发送完成！');
}
```

---

#### `getChunkByIndex(index)`

获取指定索引的分片。

**参数**:
- `index` (number): 分片索引

**返回值**: `Object`

**使用示例**:

```javascript
const result = manager.getChunkByIndex(5);

if (result.success) {
  console.log('获取分片 5:', result.chunk);
}
```

---

#### `reset(index)`

重置到指定位置。

**参数**:
- `index` (number): 起始索引，默认 0

**返回值**: `Object`

**使用示例**:

```javascript
// 重置到开始
manager.reset(0);

// 重置到指定位置
manager.reset(10);
```

---

#### `getStats()`

获取统计信息。

**返回值**: `Object`

```typescript
{
  totalChunks: number;
  sentChunks: number;
  failedChunks: number;
  currentIndex: number;
  progress: string;
  completed: boolean;
}
```

**使用示例**:

```javascript
const stats = manager.getStats();

console.log('总分片数:', stats.totalChunks);
console.log('已发送:', stats.sentChunks);
console.log('当前索引:', stats.currentIndex);
console.log('进度:', stats.progress);
console.log('是否完成:', stats.completed);
```

---

#### `isCompleted()`

检查是否完成。

**返回值**: `boolean`

**使用示例**:

```javascript
if (manager.isCompleted()) {
  console.log('传输完成！');
}
```

---

### 分片收集器（接收端）

#### `ChunkCollector`

分片收集器类，用于接收和重建文件。

**使用示例**:

```javascript
import { ChunkCollector } from '@/services/chunkService';

const collector = new ChunkCollector();

// 添加分片
const result = collector.addChunk(chunk);

if (result.success) {
  console.log('分片已添加:', result.index);
  console.log('进度:', result.progress + '%');
  
  if (collector.isComplete()) {
    // 重建文件
    const fileResult = collector.reconstructFile();
    
    if (fileResult.success) {
      console.log('文件重建成功！');
      const fileData = fileResult.data;
      const fileInfo = fileResult.fileInfo;
      // 保存文件...
    }
  }
}
```

---

## 📝 完整使用示例

### 示例 1: 发送端完整流程

```javascript
import { selectAndValidateFile } from '@/services/fileService';
import { preprocessFile } from '@/services/filePreprocessService';
import { ChunkManager } from '@/services/chunkService';

async function handleSendFile() {
  // 1. 选择文件
  const selectResult = await selectAndValidateFile({
    maxSize: 1048576  // 1MB
  });
  
  if (!selectResult.success) {
    alert('文件选择失败');
    return;
  }
  
  const { file } = selectResult;
  
  // 2. 预处理文件
  const preprocessResult = await preprocessFile(file.path, {
    compress: true,
    calculateHash: true
  });
  
  if (!preprocessResult.success) {
    alert('预处理失败');
    return;
  }
  
  const { data } = preprocessResult;
  
  // 3. 创建分片管理器
  const manager = new ChunkManager({
    chunkSize: 2048,
    compress: true
  });
  
  const initResult = manager.initialize(
    {
      name: file.name,
      size: file.size,
      type: file.type
    },
    data.processed
  );
  
  if (!initResult.success) {
    alert('初始化失败');
    return;
  }
  
  console.log('总分片数:', initResult.totalChunks);
  
  // 4. 发送分片
  while (!manager.isCompleted()) {
    const chunkResult = manager.getNextChunk();
    
    if (chunkResult.success) {
      console.log(`发送分片 ${chunkResult.index}/${chunkResult.total}`);
      console.log('进度:', chunkResult.progress + '%');
      
      // 生成二维码并显示
      // await generateAndShowQRCode(chunkResult.chunk);
      
      // 等待一段时间（控制发送速度）
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  console.log('传输完成！');
}
```

### 示例 2: 接收端完整流程

```javascript
import { ChunkCollector } from '@/services/chunkService';

async function handleReceiveFile() {
  const collector = new ChunkCollector();
  
  // 扫描二维码并添加分片
  while (!collector.isComplete()) {
    // 扫描二维码
    const qrData = await scanQRCode();
    
    // 添加分片
    const result = collector.addChunk(qrData);
    
    if (result.success) {
      console.log(`接收分片 ${result.index}/${result.total}`);
      console.log('进度:', result.progress + '%');
    } else {
      console.error('添加分片失败:', result.message);
    }
  }
  
  // 重建文件
  const fileResult = collector.reconstructFile();
  
  if (fileResult.success) {
    console.log('文件重建成功！');
    console.log('文件名:', fileResult.fileInfo.name);
    console.log('文件大小:', fileResult.fileInfo.size);
    
    // 保存文件
    // await saveFile(fileResult.data, fileResult.fileInfo);
  }
}
```

---

## ⚠️ 注意事项

1. **分片大小**
   - 默认 2048 字节
   - 可根据二维码容量调整
   - 不建议超过 2900 字节

2. **压缩选项**
   - 默认启用压缩
   - 只在有效时使用压缩数据
   - 已压缩文件可能不会再压缩

3. **分片顺序**
   - 发送端按顺序发送
   - 接收端可乱序接收
   - ChunkCollector 会自动排序

4. **错误处理**
   - 始终检查 `success` 字段
   - 处理分片验证失败
   - 支持重新发送失败的分片

---

**最后更新**: 2025-10-06 16:30

