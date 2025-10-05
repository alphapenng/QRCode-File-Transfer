# 二维码文件传输软件 - 开发规范

## 项目概述

本项目是一个基于 Electron + React + shadcn/ui 的桌面应用程序，用于在物理隔离的计算机之间通过二维码传输文件。

**目标操作系统**: Windows 7 及以上
**开发语言**: JavaScript
**技术栈**: Electron, React, shadcn/ui

---

## 1. Electron 开发最佳实践

### 1.1 进程模型

#### 主进程 (Main Process)
- 负责创建和管理 BrowserWindow 实例
- 处理系统级 API 调用（文件系统、对话框等）
- 管理应用生命周期
- 处理 IPC 通信的服务端

#### 渲染进程 (Renderer Process)
- 运行 React 应用
- 通过 IPC 与主进程通信
- 不直接访问 Node.js API（安全考虑）

#### 预加载脚本 (Preload Script)
- 在渲染进程加载前运行
- 使用 `contextBridge` 安全地暴露 API 给渲染进程
- 是主进程和渲染进程之间的桥梁

### 1.2 IPC 通信规范

**✅ 推荐做法：使用 contextBridge 暴露 API**

```javascript
// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // 单向通信：渲染进程 -> 主进程
  sendMessage: (channel, data) => ipcRenderer.send(channel, data),
  
  // 双向通信：渲染进程 <-> 主进程
  invoke: (channel, data) => ipcRenderer.invoke(channel, data),
  
  // 监听主进程消息
  on: (channel, callback) => {
    ipcRenderer.on(channel, (event, ...args) => callback(...args));
  }
});
```

**✅ 主进程处理 IPC**

```javascript
// main.js
const { ipcMain } = require('electron');

// 处理异步请求
ipcMain.handle('file:read', async (event, filePath) => {
  // 验证发送者
  if (!validateSender(event.senderFrame)) {
    throw new Error('Unauthorized');
  }
  
  const data = await readFile(filePath);
  return data;
});

// 处理单向消息
ipcMain.on('log:info', (event, message) => {
  console.log(message);
});
```

**❌ 避免的做法**

```javascript
// ❌ 不要直接暴露 ipcRenderer
contextBridge.exposeInMainWorld('electronAPI', {
  ipcRenderer: ipcRenderer  // 危险！
});

// ❌ 不要在渲染进程启用 nodeIntegration
const win = new BrowserWindow({
  webPreferences: {
    nodeIntegration: true,  // 危险！
    contextIsolation: false  // 危险！
  }
});
```

### 1.3 安全最佳实践

1. **始终启用 Context Isolation**
```javascript
const win = new BrowserWindow({
  webPreferences: {
    contextIsolation: true,  // ✅ 必须
    nodeIntegration: false,  // ✅ 必须
    sandbox: true,           // ✅ 推荐
    preload: path.join(__dirname, 'preload.js')
  }
});
```

2. **验证 IPC 消息来源**
```javascript
function validateSender(frame) {
  // 验证 URL 来源
  const url = new URL(frame.url);
  return url.protocol === 'file:' || url.host === 'localhost';
}
```

3. **使用 CSP (Content Security Policy)**
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self'">
```

### 1.4 Windows 7 兼容性

1. **Electron 版本选择**
   - 使用 Electron 22.x 或更早版本（Electron 23+ 不支持 Windows 7）
   - 推荐：Electron 22.3.27（最后支持 Windows 7 的稳定版本）

2. **Node.js 版本**
   - Electron 22 内置 Node.js 16.x
   - 确保依赖包兼容 Node.js 16

3. **打包配置**
```json
{
  "build": {
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": ["x64", "ia32"]
        }
      ]
    }
  }
}
```

---

## 2. React 开发最佳实践

### 2.1 组件设计原则

1. **函数式组件 + Hooks**
```javascript
// ✅ 推荐
function FileUploader({ onFileSelect }) {
  const [file, setFile] = useState(null);
  
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    onFileSelect(e.target.files[0]);
  };
  
  return (
    <input type="file" onChange={handleFileChange} />
  );
}
```

2. **状态管理**
```javascript
// 简单状态：useState
const [count, setCount] = useState(0);

// 复杂状态：useReducer
const [state, dispatch] = useReducer(reducer, initialState);

// 全局状态：Context API
const AppContext = createContext();
```

### 2.2 Hooks 使用规范

1. **只在顶层调用 Hooks**
```javascript
// ✅ 正确
function Component() {
  const [state, setState] = useState(0);
  
  useEffect(() => {
    // 副作用
  }, []);
}

// ❌ 错误
function Component() {
  if (condition) {
    const [state, setState] = useState(0);  // 错误！
  }
}
```

2. **自定义 Hooks**
```javascript
// 封装可复用逻辑
function useFileReader() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  
  const readFile = async (file) => {
    try {
      const result = await file.arrayBuffer();
      setData(result);
    } catch (err) {
      setError(err);
    }
  };
  
  return { data, error, readFile };
}
```

### 2.3 性能优化

1. **使用 useMemo 和 useCallback**
```javascript
const memoizedValue = useMemo(() => {
  return expensiveCalculation(a, b);
}, [a, b]);

const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

2. **列表渲染使用 key**
```javascript
{items.map(item => (
  <Item key={item.id} data={item} />
))}
```

---

## 3. shadcn/ui 使用规范

### 3.1 安装和配置

1. **初始化项目**
```bash
npx shadcn@latest init
```

2. **安装组件**
```bash
npx shadcn@latest add button
npx shadcn@latest add progress
npx shadcn@latest add card
```

3. **手动安装依赖**
```bash
npm install class-variance-authority clsx tailwind-merge lucide-react tw-animate-css
```

### 3.2 主题配置

1. **CSS 变量方式（推荐）**
```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  /* ... */
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* ... */
}
```

2. **components.json 配置**
```json
{
  "style": "default",
  "tailwind": {
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

### 3.3 组件使用示例

```javascript
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";

function TransferProgress({ progress }) {
  return (
    <Card>
      <Progress value={progress} />
      <Button onClick={handleCancel}>取消</Button>
    </Card>
  );
}
```

---

## 4. 项目结构规范

```
qrcode-app/
├── src/
│   ├── main/              # 主进程代码
│   │   ├── index.js       # 主进程入口
│   │   ├── ipc/           # IPC 处理器
│   │   └── utils/         # 工具函数
│   ├── preload/           # 预加载脚本
│   │   └── index.js
│   ├── renderer/          # 渲染进程（React）
│   │   ├── src/
│   │   │   ├── components/  # React 组件
│   │   │   ├── hooks/       # 自定义 Hooks
│   │   │   ├── utils/       # 工具函数
│   │   │   └── App.jsx      # 应用入口
│   │   └── index.html
│   └── shared/            # 共享代码
│       └── constants.js
├── docs/                  # 文档
├── package.json
└── electron-builder.json  # 打包配置
```

---

## 5. 编码规范

### 5.1 命名规范

- **文件名**: kebab-case (file-uploader.js)
- **组件名**: PascalCase (FileUploader)
- **函数名**: camelCase (handleFileSelect)
- **常量**: UPPER_SNAKE_CASE (MAX_FILE_SIZE)

### 5.2 注释规范

```javascript
/**
 * 读取文件并转换为 Base64
 * @param {File} file - 要读取的文件对象
 * @returns {Promise<string>} Base64 编码的字符串
 */
async function fileToBase64(file) {
  // 实现...
}
```

### 5.3 错误处理

```javascript
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  console.error('操作失败:', error);
  // 向用户显示友好的错误消息
  showErrorNotification(error.message);
  throw error;
}
```

---

## 6. 测试规范

### 6.1 单元测试
- 使用 Jest 进行单元测试
- 测试覆盖率目标：>80%

### 6.2 集成测试
- 使用 Spectron 测试 Electron 应用

---

## 7. Git 提交规范

```
feat: 添加文件选择功能
fix: 修复二维码生成错误
docs: 更新开发文档
style: 代码格式化
refactor: 重构文件处理模块
test: 添加单元测试
chore: 更新依赖包
```

---

## 8. 性能优化建议

1. **文件处理使用 Worker**
2. **二维码生成使用 Web Worker**
3. **大文件分片处理**
4. **使用虚拟列表渲染大量二维码**
5. **合理使用 React.memo 避免不必要的重渲染**

---

## 9. 安全注意事项

1. **文件路径验证**
2. **文件大小限制**
3. **文件类型白名单**
4. **防止路径遍历攻击**
5. **敏感数据加密存储**

