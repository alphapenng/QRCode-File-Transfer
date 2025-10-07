# 分片协议使用指南

## 概述

`protocolUtils.js` 定义了文件传输的分片协议，提供完整的分片创建、编码、验证和重建功能。

**文件位置**: `src/shared/utils/protocolUtils.js`

**主要功能**:
- 分片数据结构定义
- 文件头/数据/尾分片创建
- 分片编码和解码
- 分片验证和校验
- 文件重建
- 传输进度跟踪

---

## 协议设计

### 分片类型

```javascript
export const ChunkType = {
  FILE_HEADER: 'FILE_HEADER',    // 文件头信息
  FILE_DATA: 'FILE_DATA',        // 文件数据分片
  FILE_FOOTER: 'FILE_FOOTER'     // 文件尾信息
};
```

### 文件头结构

```typescript
{
  version: string;           // 协议版本 "1.0"
  type: 'FILE_HEADER';       // 分片类型
  timestamp: number;         // 时间戳
  fileInfo: {
    fileName: string;        // 文件名
    fileSize: number;        // 文件大小
    fileType: string;        // 文件类型
    sha256: string;          // 文件 SHA256 哈希
  };
  totalChunks: number;       // 总分片数
  chunkSize: number;         // 分片大小
}
```

### 数据分片结构

```typescript
{
  version: string;           // 协议版本 "1.0"
  type: 'FILE_DATA';         // 分片类型
  index: number;             // 分片索引（从 0 开始）
  total: number;             // 总分片数
  data: string;              // Base64 编码的数据
  crc32: string;             // CRC32 校验值
  compressed: boolean;       // 是否压缩
  size: number;              // 处理后的大小
  originalSize: number;      // 原始大小
}
```

### 文件尾结构

```typescript
{
  version: string;           // 协议版本 "1.0"
  type: 'FILE_FOOTER';       // 分片类型
  timestamp: number;         // 时间戳
  summary: {
    totalChunks: number;     // 总分片数
    totalSize: number;       // 总大小
    sha256: string;          // 文件 SHA256
  };
}
```

---

## API 文档

### 分片创建

#### `createFileHeader(fileInfo, totalChunks)`

创建文件头分片。

**参数**:
- `fileInfo` (Object): 文件信息
  - `fileName` (string): 文件名
  - `fileSize` (number): 文件大小
  - `fileType` (string): 文件类型
  - `sha256` (string): 文件 SHA256 哈希
- `totalChunks` (number): 总分片数

**返回值**: `Object` - 文件头分片

**使用示例**:
```javascript
import { createFileHeader } from '@shared/utils/protocolUtils';

const fileInfo = {
  fileName: 'document.pdf',
  fileSize: 102400,
  fileType: 'application/pdf',
  sha256: 'abc123...'
};

const header = createFileHeader(fileInfo, 50);
console.log(header);
```

---

#### `createDataChunk(data, index, total, options)`

创建数据分片。

**参数**:
- `data` (Uint8Array): 原始数据
- `index` (number): 分片索引
- `total` (number): 总分片数
- `options` (Object, 可选): 配置选项
  - `compress` (boolean): 是否压缩，默认 true

**返回值**: `Object` - 数据分片

**使用示例**:
```javascript
import { createDataChunk } from '@shared/utils/protocolUtils';

const chunkData = new Uint8Array([1, 2, 3, 4, 5]);
const chunk = createDataChunk(chunkData, 0, 10, {
  compress: true
});

console.log('分片索引:', chunk.index);
console.log('CRC32:', chunk.crc32);
console.log('是否压缩:', chunk.compressed);
```

---

#### `createFileFooter(summary)`

创建文件尾分片。

**参数**:
- `summary` (Object): 传输摘要
  - `totalChunks` (number): 总分片数
  - `totalSize` (number): 总大小
  - `sha256` (string): 文件 SHA256

**返回值**: `Object` - 文件尾分片

**使用示例**:
```javascript
import { createFileFooter } from '@shared/utils/protocolUtils';

const footer = createFileFooter({
  totalChunks: 50,
  totalSize: 102400,
  sha256: 'abc123...'
});
```

---

### 分片编码和解码

#### `encodeChunk(chunk)`

封装分片为 JSON 字符串。

**参数**:
- `chunk` (Object): 分片对象

**返回值**: `string` - JSON 字符串

**使用示例**:
```javascript
import { encodeChunk } from '@shared/utils/protocolUtils';

const chunk = createDataChunk(data, 0, 10);
const jsonString = encodeChunk(chunk);

// 用于二维码生成
const qrCode = await generateQRCode(jsonString);
```

---

#### `decodeChunk(jsonString)`

解析 JSON 字符串为分片对象。

**参数**:
- `jsonString` (string): JSON 字符串

**返回值**: `Object` - 分片对象

**使用示例**:
```javascript
import { decodeChunk } from '@shared/utils/protocolUtils';

// 从二维码解析的数据
const jsonString = '{"version":"1.0",...}';
const chunk = decodeChunk(jsonString);

console.log('分片类型:', chunk.type);
console.log('分片索引:', chunk.index);
```

---

### 分片验证

#### `validateChunk(chunk)`

验证分片数据。

**参数**:
- `chunk` (Object): 分片对象

**返回值**: `Object`
```typescript
{
  valid: boolean;      // 是否有效
  errors: string[];    // 错误信息
}
```

**使用示例**:
```javascript
import { validateChunk } from '@shared/utils/protocolUtils';

const result = validateChunk(chunk);

if (result.valid) {
  console.log('分片有效');
} else {
  console.error('分片无效:', result.errors);
}
```

---

#### `verifyChunkCRC32(chunk)`

验证数据分片的 CRC32。

**参数**:
- `chunk` (Object): 数据分片

**返回值**: `boolean` - 是否通过验证

**使用示例**:
```javascript
import { verifyChunkCRC32 } from '@shared/utils/protocolUtils';

if (verifyChunkCRC32(chunk)) {
  console.log('CRC32 校验通过');
} else {
  console.error('CRC32 校验失败');
}
```

---

#### `extractChunkData(chunk)`

解压数据分片。

**参数**:
- `chunk` (Object): 数据分片

**返回值**: `Uint8Array` - 解压后的数据

**使用示例**:
```javascript
import { extractChunkData } from '@shared/utils/protocolUtils';

const data = extractChunkData(chunk);
console.log('数据长度:', data.length);
```

---

### 传输包创建

#### `createTransferPackage(fileData, fileInfo, options)`

创建完整的传输包。

**参数**:
- `fileData` (Uint8Array): 文件数据
- `fileInfo` (Object): 文件信息
- `options` (Object, 可选): 配置选项
  - `chunkSize` (number): 分片大小，默认 2048
  - `compress` (boolean): 是否压缩，默认 true

**返回值**: `Object[]` - 传输包数组（包含文件头、数据分片、文件尾）

**使用示例**:
```javascript
import { createTransferPackage } from '@shared/utils/protocolUtils';

const fileData = new Uint8Array([...]); // 文件数据
const fileInfo = {
  fileName: 'document.pdf',
  fileSize: fileData.length,
  fileType: 'application/pdf'
};

const packages = createTransferPackage(fileData, fileInfo, {
  chunkSize: 2048,
  compress: true
});

console.log('总包数:', packages.length);
console.log('文件头:', packages[0]);
console.log('第一个数据分片:', packages[1]);
console.log('文件尾:', packages[packages.length - 1]);
```

---

### 分片收集器

#### `ChunkCollector`

分片收集器类，用于接收和重建文件。

**方法**:
- `addChunk(chunk)` - 添加分片
- `isComplete()` - 检查是否完成
- `getMissingChunks()` - 获取缺失的分片索引
- `reconstructFile()` - 重建文件数据
- `verifyFile(fileData)` - 验证文件完整性
- `getStats()` - 获取传输统计
- `reset()` - 重置收集器

**使用示例**:
```javascript
import { ChunkCollector, decodeChunk } from '@shared/utils/protocolUtils';

// 创建收集器
const collector = new ChunkCollector();

// 接收分片（例如从二维码扫描）
function onQRCodeScanned(qrData) {
  // 解码分片
  const chunk = decodeChunk(qrData);
  
  // 添加到收集器
  const result = collector.addChunk(chunk);
  
  if (result.success) {
    console.log('分片已接收:', result);
    
    // 显示进度
    const stats = collector.getStats();
    console.log('进度:', stats.progress + '%');
    
    // 检查是否完成
    if (collector.isComplete()) {
      // 重建文件
      const fileData = collector.reconstructFile();
      
      // 验证文件
      if (collector.verifyFile(fileData)) {
        console.log('文件接收成功！');
        saveFile(fileData);
      } else {
        console.error('文件校验失败');
      }
    }
  } else {
    console.error('分片接收失败:', result.error);
  }
}
```

---

## 完整使用示例

### 示例 1: 发送端完整流程

```javascript
import { readFileAsArrayBuffer } from '@shared/utils/fileUtils';
import { createTransferPackage, encodeChunk } from '@shared/utils/protocolUtils';
import { generateQRCode } from '@shared/utils/qrcodeUtils';

async function sendFile(file) {
  // 1. 读取文件
  const fileData = await readFileAsArrayBuffer(file);
  const uint8Data = new Uint8Array(fileData);
  
  // 2. 创建传输包
  const fileInfo = {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type
  };
  
  const packages = createTransferPackage(uint8Data, fileInfo, {
    chunkSize: 2048,
    compress: true
  });
  
  console.log('总包数:', packages.length);
  
  // 3. 生成二维码序列
  const qrCodes = [];
  for (const pkg of packages) {
    const jsonString = encodeChunk(pkg);
    const qrCode = await generateQRCode(jsonString, {
      width: 400,
      errorCorrectionLevel: 'M'
    });
    qrCodes.push(qrCode);
  }
  
  // 4. 播放二维码
  let currentIndex = 0;
  const interval = setInterval(() => {
    if (currentIndex >= qrCodes.length) {
      currentIndex = 0; // 循环播放
    }
    
    displayQRCode(qrCodes[currentIndex]);
    updateProgress(currentIndex + 1, qrCodes.length);
    
    currentIndex++;
  }, 200); // 5个/秒
  
  return () => clearInterval(interval); // 返回停止函数
}
```

### 示例 2: 接收端完整流程

```javascript
import { ChunkCollector, decodeChunk } from '@shared/utils/protocolUtils';
import { parseQRCodeFromCanvas } from '@shared/utils/qrcodeUtils';
import { downloadFile } from '@shared/utils/fileUtils';

class FileReceiver {
  constructor() {
    this.collector = new ChunkCollector();
    this.canvas = document.getElementById('scanCanvas');
    this.video = document.getElementById('video');
  }
  
  async startScanning() {
    // 启动摄像头
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    });
    this.video.srcObject = stream;
    
    // 定时扫描
    this.scanInterval = setInterval(() => {
      this.scanQRCode();
    }, 100); // 每100ms扫描一次
  }
  
  scanQRCode() {
    // 绘制视频帧到 Canvas
    const ctx = this.canvas.getContext('2d');
    ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    
    // 解析二维码
    const result = parseQRCodeFromCanvas(this.canvas);
    
    if (result) {
      this.processQRCode(result.data);
    }
  }
  
  processQRCode(qrData) {
    try {
      // 解码分片
      const chunk = decodeChunk(qrData);
      
      // 添加到收集器
      const result = this.collector.addChunk(chunk);
      
      if (result.success) {
        // 更新 UI
        this.updateProgress();
        
        // 检查是否完成
        if (this.collector.isComplete()) {
          this.onTransferComplete();
        }
      } else {
        console.error('分片接收失败:', result.error);
      }
    } catch (error) {
      console.error('处理二维码失败:', error);
    }
  }
  
  updateProgress() {
    const stats = this.collector.getStats();
    
    document.getElementById('progress').textContent = 
      `${stats.receivedChunks}/${stats.totalChunks} (${stats.progress}%)`;
    
    // 显示缺失的分片
    const missing = this.collector.getMissingChunks();
    if (missing.length > 0) {
      console.log('缺失分片:', missing);
    }
  }
  
  onTransferComplete() {
    // 停止扫描
    clearInterval(this.scanInterval);
    
    // 重建文件
    const fileData = this.collector.reconstructFile();
    
    // 验证文件
    if (this.collector.verifyFile(fileData)) {
      console.log('文件接收成功！');
      
      // 保存文件
      const fileName = this.collector.header.fileInfo.fileName;
      const fileType = this.collector.header.fileInfo.fileType;
      
      downloadFile(fileData, fileName, fileType);
      
      // 重置收集器
      this.collector.reset();
    } else {
      console.error('文件校验失败');
      alert('文件校验失败，请重新传输');
    }
  }
  
  stopScanning() {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
    }
    
    if (this.video.srcObject) {
      this.video.srcObject.getTracks().forEach(track => track.stop());
    }
  }
}

// 使用
const receiver = new FileReceiver();
receiver.startScanning();
```

---

## 性能优化建议

### 1. 选择合适的分片大小

```javascript
// ✅ 推荐：2KB 分片（适合二维码）
const packages = createTransferPackage(fileData, fileInfo, {
  chunkSize: 2048
});

// ❌ 不推荐：过大的分片
const packages = createTransferPackage(fileData, fileInfo, {
  chunkSize: 10240 // 可能超出二维码容量
});
```

### 2. 启用压缩

```javascript
// ✅ 推荐：启用压缩
const packages = createTransferPackage(fileData, fileInfo, {
  compress: true
});
```

### 3. 批量处理

```javascript
// ✅ 推荐：批量生成二维码
const jsonStrings = packages.map(pkg => encodeChunk(pkg));
const qrCodes = await generateQRCodeBatch(jsonStrings);
```

---

## 注意事项

1. **协议版本**
   - 当前版本：1.0
   - 版本不匹配会导致解码失败

2. **分片大小**
   - 默认 2048 字节
   - 建议不超过 2KB（二维码容量限制）

3. **压缩**
   - 自动判断压缩效果
   - 只有压缩后更小才使用压缩数据

4. **校验**
   - 每个分片都有 CRC32 校验
   - 文件整体有 SHA256 校验

5. **错误处理**
   - 始终验证分片有效性
   - 检查 CRC32 校验
   - 验证文件完整性

---

**最后更新**: 2025-10-06 16:00

