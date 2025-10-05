# 开发环境配置说明

## 已完成的配置

### ✅ 1. React 开发环境
- React 19.2.0
- React DOM 19.2.0

### ✅ 2. Vite 构建工具
- Vite 7.1.9
- @vitejs/plugin-react 5.0.4
- vite-plugin-electron 0.29.0
- vite-plugin-electron-renderer 0.14.6

### ✅ 3. 项目结构
```
src/
├── main/
│   └── index.js          # Electron 主进程（临时版本）
├── renderer/
│   ├── index.html        # HTML 入口
│   └── src/
│       ├── main.jsx      # React 入口
│       ├── App.jsx       # 主应用组件
│       └── index.css     # 全局样式
└── preload/
    └── index.js          # 预加载脚本（临时版本）
```

### ✅ 4. Vite 配置
- 配置了 Electron 主进程和预加载脚本的构建
- 配置了 React 渲染进程
- 设置了路径别名（@, @shared）
- 配置了开发服务器（端口 5173）

---

## 运行开发环境

### 启动开发服务器
```bash
npm run dev
```

这将启动 Vite 开发服务器，支持热重载。

### 预览构建结果
```bash
npm run build
npm run preview
```

### 启动 Electron 应用（当前不可用）
```bash
npm start
```

**注意**: 完整的 Electron 开发环境将在任务 1.1.7 中配置。

---

## 开发服务器配置

### 端口
- **开发服务器**: http://localhost:5173
- **严格端口模式**: 启用（如果端口被占用会报错）

### 热重载
- ✅ React 组件热重载
- ✅ CSS 热重载
- ⏳ Electron 主进程热重载（任务 1.1.7）

---

## 路径别名

在代码中可以使用以下别名：

```javascript
// 渲染进程代码
import Component from '@/components/Component';

// 共享代码
import { utils } from '@shared/utils/helpers';
```

### 配置的别名
- `@` → `src/renderer/src`
- `@shared` → `src/shared`

---

## 构建输出

### 开发构建
```
dist/
├── main/           # 主进程构建输出
├── preload/        # 预加载脚本构建输出
└── renderer/       # 渲染进程构建输出
```

### 生产构建
将在任务 1.1.7 中配置完整的生产构建流程。

---

## 当前功能

### ✅ 已实现
1. **基础 React 应用**
   - 主应用组件（App.jsx）
   - 标签切换（发送/接收）
   - 基础样式

2. **Vite 开发环境**
   - 快速的热重载
   - React 插件支持
   - Electron 集成

3. **临时主进程**
   - 基础窗口创建
   - 安全配置（contextIsolation, nodeIntegration）
   - 开发/生产环境判断

4. **临时预加载脚本**
   - contextBridge API 暴露
   - 版本信息
   - API 占位符

### ⏳ 待实现（后续任务）
1. **完整的主进程**（任务 1.1.5）
   - IPC 通信处理
   - 文件操作
   - 窗口管理

2. **完整的预加载脚本**（任务 1.1.6）
   - 文件选择 API
   - 文件保存 API
   - 传输 API

3. **开发脚本**（任务 1.1.7）
   - 并行运行主进程和渲染进程
   - 自动重启
   - 生产构建脚本

---

## 故障排除

### 问题 1: 端口 5173 被占用
```bash
# 修改 vite.config.js 中的端口
server: {
  port: 5174,  // 改为其他端口
  strictPort: true
}
```

### 问题 2: 模块导入错误
确保使用正确的导入语法：
```javascript
// ✅ 正确
import React from 'react';

// ❌ 错误（CommonJS）
const React = require('react');
```

### 问题 3: 样式不生效
检查 CSS 文件是否正确导入：
```javascript
// main.jsx
import './index.css';
```

### 问题 4: Vite 构建失败
清理缓存并重新安装：
```bash
rm -rf node_modules dist
npm install
npm run dev
```

---

## 开发建议

### 1. 使用 React DevTools
在开发环境下，主进程会自动打开开发者工具。

### 2. 代码组织
- 组件放在 `src/renderer/src/components/`
- 业务逻辑放在 `src/renderer/src/services/`
- 自定义 Hooks 放在 `src/renderer/src/hooks/`
- 共享代码放在 `src/shared/`

### 3. 样式管理
当前使用原生 CSS，shadcn/ui 将在任务 1.1.4 中集成。

### 4. 类型检查
建议使用 JSDoc 注释提供类型提示：
```javascript
/**
 * @param {string} filePath - 文件路径
 * @returns {Promise<ArrayBuffer>} 文件数据
 */
async function readFile(filePath) {
  // ...
}
```

---

## 下一步

### 任务 1.1.4: 集成 shadcn/ui
- 安装 Tailwind CSS
- 配置 shadcn/ui
- 安装基础组件

### 任务 1.1.5: 配置 Electron 主进程
- 完善主进程代码
- 实现 IPC 处理器
- 添加文件操作功能

### 任务 1.1.6: 创建 Preload 脚本
- 完善 contextBridge API
- 实现安全的 IPC 通信
- 添加错误处理

### 任务 1.1.7: 配置开发脚本
- 配置并行运行脚本
- 添加自动重启
- 配置生产构建

---

**最后更新**: 2025-10-06 00:25

