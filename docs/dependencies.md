# 项目依赖说明

## 核心依赖

### 生产依赖 (dependencies)

| 包名 | 版本 | 说明 | Windows 7 兼容性 |
|------|------|------|-----------------|
| electron | ^22.3.27 | Electron 框架 | ✅ 最后支持 Windows 7 的版本 |

**注意**: Electron 22.3.27 是最后一个支持 Windows 7 的稳定版本，使用 Node.js 16.x。

---

## 开发依赖

### 构建工具 (devDependencies)

| 包名 | 版本 | 说明 | 用途 |
|------|------|------|------|
| electron-builder | ^26.0.12 | Electron 应用打包工具 | 生成 Windows 安装包 |
| concurrently | ^9.2.1 | 并行运行多个命令 | 同时运行主进程和渲染进程 |
| wait-on | ^9.0.1 | 等待资源可用 | 等待开发服务器启动 |
| cross-env | ^10.1.0 | 跨平台环境变量设置 | 设置 NODE_ENV 等环境变量 |

---

## 即将安装的依赖

### React 相关 (任务 1.1.3)
- `react` ^18.2.0 - React 核心库
- `react-dom` ^18.2.0 - React DOM 渲染器

### 构建工具 (任务 1.1.3)
- `vite` ^5.0.0 - 快速的前端构建工具
- `@vitejs/plugin-react` ^4.0.0 - Vite 的 React 插件
- `vite-plugin-electron` - Vite 的 Electron 插件
- `vite-plugin-electron-renderer` - Vite 的 Electron 渲染进程插件

### UI 框架 (任务 1.1.4)
- `tailwindcss` ^3.4.0 - CSS 框架
- `autoprefixer` - CSS 自动添加浏览器前缀
- `postcss` - CSS 后处理器
- `class-variance-authority` - CSS 类变体管理
- `clsx` - 条件类名工具
- `tailwind-merge` - Tailwind 类名合并
- `lucide-react` - 图标库

### 核心功能库 (任务 1.2.x)
- `pako` ^2.1.0 - gzip 压缩/解压缩
- `qrcode` ^1.5.3 - 二维码生成
- `crypto-js` ^4.2.0 - 加密和哈希工具
- `uuid` ^9.0.0 - UUID 生成器

### 测试工具 (任务 1.6.1)
- `jest` ^29.0.0 - JavaScript 测试框架
- `@testing-library/react` - React 测试工具
- `@testing-library/jest-dom` - Jest DOM 匹配器

---

## 依赖版本兼容性

### Node.js 版本要求
- **最低版本**: Node.js 16.x
- **推荐版本**: Node.js 16.x 或 18.x
- **原因**: Electron 22.3.27 内置 Node.js 16.x

### Windows 7 兼容性检查清单

#### ✅ 已验证兼容
- [x] Electron 22.3.27
- [x] electron-builder 26.0.12
- [x] concurrently 9.2.1
- [x] wait-on 9.0.1
- [x] cross-env 10.1.0

#### ⏳ 待验证
- [ ] React 18.x
- [ ] Vite 5.x
- [ ] Tailwind CSS 3.x
- [ ] pako 2.x
- [ ] qrcode 1.5.x
- [ ] crypto-js 4.x

---

## 安装说明

### 安装所有依赖
```bash
npm install
```

### 仅安装生产依赖
```bash
npm install --production
```

### 更新依赖
```bash
# 检查过时的包
npm outdated

# 更新所有包到最新版本（谨慎使用）
npm update

# 更新特定包
npm update <package-name>
```

### 清理依赖
```bash
# 删除 node_modules
rm -rf node_modules

# 删除 package-lock.json
rm package-lock.json

# 重新安装
npm install
```

---

## 依赖安全

### 安全审计
```bash
# 检查安全漏洞
npm audit

# 自动修复（可能会升级版本）
npm audit fix

# 强制修复（可能包含破坏性更改）
npm audit fix --force
```

### 当前安全状态
- **最后检查时间**: 2025-10-06
- **已知漏洞**: 1 个中等严重性漏洞
- **建议**: 定期运行 `npm audit` 检查

---

## 依赖大小

### 当前安装大小
```
node_modules: ~400 个包
总大小: 约 200-300 MB
```

### 生产构建大小（预估）
- **应用本体**: ~50-80 MB
- **Electron 运行时**: ~120-150 MB
- **总安装包**: ~170-230 MB

---

## 依赖更新策略

### 版本锁定策略
- **Electron**: 锁定在 22.3.27（Windows 7 兼容性要求）
- **其他依赖**: 使用 `^` 允许小版本更新

### 更新频率
- **安全更新**: 立即应用
- **小版本更新**: 每月检查一次
- **大版本更新**: 谨慎评估，需要充分测试

### 更新前检查清单
- [ ] 阅读更新日志（CHANGELOG）
- [ ] 检查破坏性变更（Breaking Changes）
- [ ] 在开发环境测试
- [ ] 运行完整测试套件
- [ ] 在 Windows 7 环境验证
- [ ] 更新文档

---

## 故障排除

### 常见问题

#### 1. Electron 安装失败
```bash
# 使用国内镜像
npm config set electron_mirror https://npmmirror.com/mirrors/electron/
npm install electron
```

#### 2. node-gyp 编译错误
```bash
# 安装 Windows 构建工具
npm install --global windows-build-tools

# 或者安装 Visual Studio Build Tools
```

#### 3. 依赖冲突
```bash
# 清理缓存
npm cache clean --force

# 删除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

#### 4. 版本不兼容
```bash
# 检查 Node.js 版本
node --version

# 使用 nvm 切换版本
nvm use 16
```

---

## 参考资料

- [Electron 文档](https://www.electronjs.org/docs)
- [electron-builder 文档](https://www.electron.build/)
- [npm 文档](https://docs.npmjs.com/)
- [Node.js 兼容性表](https://nodejs.org/en/about/releases/)

---

**最后更新**: 2025-10-06 00:14

