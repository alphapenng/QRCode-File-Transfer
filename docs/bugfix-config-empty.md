# Bug 修复：配置文件被清空问题

## 问题描述

**问题**: 关闭应用后，配置文件 `config.json` 的内容被清空。

**影响**: 用户的所有配置（窗口位置、传输设置、最近文件等）丢失。

**严重程度**: 🔴 高（数据丢失）

---

## 问题分析

### 根本原因

1. **异步保存未等待完成**
   - 在 `before-quit` 事件中调用 `configManager.save()` 是异步的
   - 应用退出不会等待异步操作完成
   - 配置文件可能在写入完成前就被中断

2. **缺少数据验证**
   - 保存配置时没有验证数据是否有效
   - 如果 `this.config` 为空或 `null`，会写入空数据

3. **窗口状态未保存**
   - 窗口关闭时没有保存窗口位置和大小
   - 配置对象可能不完整

### 问题代码

**src/main/index.js (修复前)**:
```javascript
// 应用退出前的清理工作
app.on('before-quit', () => {
  console.log('Application is quitting...');

  // 注销所有 IPC 处理器
  if (mainWindow) {
    unregisterFileHandlers();
    unregisterTransferHandlers();
    unregisterSystemHandlers();
  }

  // 保存配置 - ❌ 异步操作，不会等待完成
  configManager.save().catch(err => {
    console.error('Error saving config on quit:', err);
  });
});
```

**src/main/config.js (修复前)**:
```javascript
async save() {
  try {
    // 确保目录存在
    const dir = path.dirname(this.configPath);
    await fs.mkdir(dir, { recursive: true });

    // 写入配置文件 - ❌ 没有验证数据是否有效
    await fs.writeFile(
      this.configPath,
      JSON.stringify(this.config, null, 2),
      'utf-8'
    );
    console.log('Config saved:', this.configPath);
  } catch (error) {
    console.error('Error saving config:', error);
    throw error;
  }
}
```

---

## 修复方案

### 1. 修复异步保存问题

**修改文件**: `src/main/index.js`

**修改内容**:
```javascript
// 应用退出前的清理工作
app.on('before-quit', async (event) => {
  console.log('Application is quitting...');

  // ✅ 阻止默认退出行为，等待配置保存完成
  event.preventDefault();

  try {
    // ✅ 保存配置（同步等待）
    await configManager.save();
    console.log('Config saved successfully before quit');
  } catch (err) {
    console.error('Error saving config on quit:', err);
  }

  // 注销所有 IPC 处理器
  if (mainWindow) {
    unregisterFileHandlers();
    unregisterTransferHandlers();
    unregisterSystemHandlers();
  }

  // ✅ 配置保存完成后，真正退出应用
  app.exit(0);
});
```

**关键改进**:
- 使用 `event.preventDefault()` 阻止默认退出
- 使用 `await` 等待配置保存完成
- 使用 `app.exit(0)` 确保应用正常退出

### 2. 增强配置保存验证

**修改文件**: `src/main/config.js`

**修改内容**:
```javascript
async save() {
  try {
    // ✅ 确保配置对象存在且有效
    if (!this.config || typeof this.config !== 'object' || Object.keys(this.config).length === 0) {
      console.warn('Config is empty or invalid, skipping save');
      return;
    }

    // 确保目录存在
    const dir = path.dirname(this.configPath);
    await fs.mkdir(dir, { recursive: true });

    // 写入配置文件
    const configData = JSON.stringify(this.config, null, 2);
    
    // ✅ 验证 JSON 数据不为空
    if (!configData || configData === '{}' || configData === 'null') {
      console.error('Config data is empty, aborting save');
      return;
    }

    await fs.writeFile(
      this.configPath,
      configData,
      'utf-8'
    );
    console.log('Config saved successfully:', this.configPath);
    console.log('Config data length:', configData.length);
  } catch (error) {
    console.error('Error saving config:', error);
    throw error;
  }
}
```

**关键改进**:
- 验证 `this.config` 不为空
- 验证 JSON 字符串不为空
- 添加详细的日志输出

### 3. 保存窗口状态

**修改文件**: `src/main/index.js`

**修改内容**:
```javascript
// ✅ 从配置中恢复窗口位置和大小
function createWindow() {
  const windowConfig = configManager.get('window', {
    width: 1000,
    height: 700,
    x: undefined,
    y: undefined
  });

  mainWindow = new BrowserWindow({
    width: windowConfig.width || 1000,
    height: windowConfig.height || 700,
    x: windowConfig.x,
    y: windowConfig.y,
    // ... 其他配置
  });

  // ✅ 窗口关闭前保存窗口状态
  mainWindow.on('close', () => {
    const bounds = mainWindow.getBounds();
    configManager.set('window', {
      width: bounds.width,
      height: bounds.height,
      x: bounds.x,
      y: bounds.y
    });
    console.log('Window bounds saved:', bounds);
  });

  // ... 其他代码
}
```

**关键改进**:
- 启动时从配置恢复窗口位置和大小
- 关闭时保存窗口状态到配置

---

## 测试验证

### 测试步骤

1. **启动应用**
   ```bash
   npm run dev:electron
   ```

2. **修改窗口大小和位置**
   - 拖动窗口到不同位置
   - 调整窗口大小

3. **关闭应用**
   - 点击关闭按钮
   - 观察控制台输出

4. **检查配置文件**
   ```bash
   # Windows
   type %APPDATA%\qrcode-app\config.json
   
   # 或者在代码中查看路径
   console.log(app.getPath('userData'));
   ```

5. **重新启动应用**
   - 验证窗口位置和大小是否恢复
   - 验证配置文件内容完整

### 预期结果

**控制台输出**:
```
Application is quitting...
Window bounds saved: { x: 100, y: 100, width: 1200, height: 800 }
Config saved successfully: C:\Users\...\AppData\Roaming\qrcode-app\config.json
Config data length: 456
Config saved successfully before quit
```

**配置文件内容** (`config.json`):
```json
{
  "window": {
    "width": 1200,
    "height": 800,
    "x": 100,
    "y": 100
  },
  "transfer": {
    "chunkSize": 2048,
    "maxFileSize": 1048576,
    "compressionEnabled": true,
    "qrCodeSize": 400,
    "displayDuration": 500
  },
  "app": {
    "autoCheckUpdate": true,
    "language": "zh-CN",
    "theme": "light"
  },
  "recentFiles": []
}
```

---

## 防止类似问题

### 最佳实践

1. **异步操作必须等待**
   - 在应用退出前，使用 `event.preventDefault()` 和 `await`
   - 确保所有异步操作完成后再退出

2. **数据验证**
   - 保存前验证数据有效性
   - 避免写入空数据或无效数据

3. **日志记录**
   - 添加详细的日志输出
   - 便于调试和问题追踪

4. **备份机制**（可选，后续实现）
   - 保存前备份旧配置
   - 保存失败时可以恢复

### 代码审查清单

- [ ] 所有异步操作都有 `await`
- [ ] 应用退出前等待关键操作完成
- [ ] 数据保存前进行验证
- [ ] 添加足够的日志输出
- [ ] 错误处理完善

---

## 相关文件

- `src/main/index.js` - 主进程入口
- `src/main/config.js` - 配置管理器
- `docs/main-process-architecture.md` - 主进程架构文档

---

**修复时间**: 2025-10-06 13:15  
**修复版本**: v1.0.0-alpha  
**修复人员**: AI Assistant

