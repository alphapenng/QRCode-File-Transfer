# 二维码容量优化说明

## 问题描述

在二维码生成过程中遇到错误：
```
Error: 二维码生成失败: The amount of data is too big to be stored in a QR Code
```

## 根本原因

### 1. 二维码容量限制

二维码的容量取决于纠错级别：

| 纠错级别 | 纠错能力 | 最大容量（字节） |
|---------|---------|----------------|
| L       | 7%      | 约 2953        |
| M       | 15%     | 约 2331        |
| Q       | 25%     | 约 1663        |
| H       | 30%     | 约 1273        |

### 2. 数据编码流程

```
原始数据 (chunkSize bytes)
    ↓ 压缩 (gzip)
压缩数据 (约 70% 原始大小)
    ↓ Base64 编码 (+33%)
Base64 字符串 (约 93% 原始大小)
    ↓ JSON 包装 (+200 bytes 元数据)
JSON 字符串 (约 93% + 200 bytes)
    ↓ 二维码生成
二维码 (需要 < 2953 bytes)
```

### 3. 示例计算

**原配置（chunkSize = 2048, errorCorrectionLevel = 'M'）**：

```
原始数据: 2048 bytes
    ↓ 压缩 (70%)
压缩数据: 1434 bytes
    ↓ Base64 (+33%)
Base64: 1907 bytes
    ↓ JSON 包装
JSON: {
  "version": "1.0",
  "type": "FILE_DATA",
  "index": 0,
  "total": 10,
  "data": "1907 字符的 Base64...",
  "crc32": "abc123",
  "compressed": true,
  "size": 1434,
  "originalSize": 2048
}
总大小: 约 2100+ bytes

问题：接近或超过 M 级容量限制 (2331 bytes)
```

## 解决方案

### 方案 1：减小分片大小（已实施）

将 `chunkSize` 从 2048 减小到 1024：

```
原始数据: 1024 bytes
    ↓ 压缩 (70%)
压缩数据: 717 bytes
    ↓ Base64 (+33%)
Base64: 954 bytes
    ↓ JSON 包装
JSON: 约 1150 bytes

结果：远小于 L 级容量限制 (2953 bytes) ✅
```

### 方案 2：使用更低的纠错级别（已实施）

从 `M` (15%) 改为 `L` (7%)：
- 容量从 2331 bytes 增加到 2953 bytes
- 纠错能力从 15% 降低到 7%
- 对于室内、近距离扫描，L 级足够

### 方案 3：优化 JSON 结构（未实施）

可以使用更短的字段名来减少 JSON 开销：

```javascript
// 当前结构
{
  "version": "1.0",
  "type": "FILE_DATA",
  "index": 0,
  "total": 10,
  "data": "...",
  "crc32": "...",
  "compressed": true,
  "size": 1434,
  "originalSize": 2048
}

// 优化后结构（可选）
{
  "v": "1.0",
  "t": "D",  // D=DATA, H=HEADER, F=FOOTER
  "i": 0,
  "n": 10,
  "d": "...",
  "c": "...",
  "z": 1,    // 1=compressed, 0=not compressed
  "s": 1434,
  "o": 2048
}

节省：约 50-80 bytes
```

## 实施的更改

### 1. `chunkService.js`

```javascript
export const CHUNK_OPTIONS = {
  chunkSize: 1024,  // 从 2048 减小到 1024
  compress: true,
  encode: true,
  validate: true
};
```

### 2. `qrcodeService.js`

```javascript
export const QRCODE_OPTIONS = {
  errorCorrectionLevel: 'L',  // 从 'M' 改为 'L'
  width: 400,
  height: 400,
  margin: 2,
  color: {
    dark: '#000000',
    light: '#FFFFFF'
  }
};
```

### 3. `senderIPCService.js`

```javascript
constructor(options = {}) {
  this.options = {
    maxFileSize: 1048576,  // 1MB
    chunkSize: 1024,  // 从 2048 减小到 1024
    qrCodeSpeed: 5,
    qrCodeErrorCorrectionLevel: 'L',  // 从 'M' 改为 'L'
    ...options
  };
}
```

### 4. `protocolUtils.js`

```javascript
// createFileHeader
chunkSize: 1024  // 从 2048 减小到 1024

// createTransferPackage
const { chunkSize = 1024, ... } = options;  // 从 2048 减小到 1024
```

## 影响分析

### 优点

1. **解决容量问题**：JSON 字符串大小远小于二维码容量限制
2. **更可靠**：有足够的余量应对不可压缩的数据
3. **兼容性好**：L 级纠错对于室内扫描足够

### 缺点

1. **分片数量增加**：传输相同大小的文件需要更多分片
   - 1MB 文件：从 512 个分片增加到 1024 个分片
   - 传输时间增加约 2 倍
2. **纠错能力降低**：从 15% 降低到 7%
   - 对于清晰的屏幕显示，影响很小

### 性能对比

| 配置 | 分片大小 | 纠错级别 | 1MB 文件分片数 | 预计传输时间 (5 fps) |
|-----|---------|---------|---------------|---------------------|
| 旧  | 2048    | M       | 512           | 102 秒              |
| 新  | 1024    | L       | 1024          | 205 秒              |

## 未来优化方向

### 1. 动态分片大小

根据数据压缩率动态调整分片大小：
- 高压缩率数据：使用更大的分片
- 低压缩率数据：使用更小的分片

### 2. 自适应纠错级别

根据扫描环境动态调整：
- 室内、近距离：使用 L 级
- 室外、远距离：使用 M 或 Q 级

### 3. 优化 JSON 结构

使用更短的字段名，减少元数据开销。

### 4. 二进制协议

使用二进制格式代替 JSON，可以显著减小数据大小。

## 测试建议

1. **小文件测试**（< 10KB）
   - 验证基本功能
   - 检查分片数量

2. **中等文件测试**（100KB - 500KB）
   - 验证传输稳定性
   - 测量传输时间

3. **大文件测试**（接近 1MB）
   - 验证内存使用
   - 测试边界情况

4. **不同文件类型**
   - 文本文件（高压缩率）
   - 图片文件（低压缩率）
   - Office 文档（中等压缩率）

## 监控指标

在控制台中添加了以下监控信息：

```javascript
console.log(`分片 ${n}/${total} 大小: ${size} bytes`);

if (size > 2900) {
  console.warn(`⚠️ 分片数据过大 (${size} bytes)，可能超过二维码容量限制`);
}
```

## 总结

通过减小分片大小（2048 → 1024）和降低纠错级别（M → L），成功解决了二维码容量限制问题。虽然传输时间增加了约 2 倍，但确保了系统的稳定性和可靠性。

对于 MVP 阶段，这是一个合理的权衡。未来可以通过动态分片大小和自适应纠错级别来优化性能。

