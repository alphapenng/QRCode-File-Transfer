# 安全推送指南

## 概述

本项目配置了自动安全审核机制，在每次推送到 GitHub 前会自动检查代码中的敏感信息，防止密钥、密码等敏感数据泄露。

---

## 🔒 安全审核功能

### 检查内容

安全审核脚本会检查以下敏感信息：

1. **API 密钥和令牌**
   - `api_key`、`api_secret`
   - `access_token`、`auth_token`

2. **密码**
   - `password`、`passwd`、`pwd`

3. **私钥**
   - `private_key`
   - RSA 私钥（`-----BEGIN PRIVATE KEY-----`）

4. **数据库连接字符串**
   - MongoDB、MySQL、PostgreSQL 连接 URL

5. **云服务密钥**
   - AWS Access Key（`AKIA...`）
   - AWS Secret Access Key

6. **其他敏感信息**
   - `client_secret`
   - `encryption_key`

### 扫描范围

- **文件类型**: `.js`, `.ts`, `.jsx`, `.tsx`, `.json`, `.env`, `.yml`, `.yaml`, `.md`
- **排除目录**: `node_modules`, `dist`, `build`, `out`, `.git`, `coverage`

---

## 📋 使用方法

### 方法 1: 使用 npm 命令（推荐）

#### 1. 安全推送

```bash
npm run push
```

这个命令会：
1. 运行安全审核
2. 如果通过，推送到 GitHub
3. 如果失败，取消推送并显示问题

#### 2. 仅运行安全审核

```bash
npm run security-check
```

#### 3. 强制推送（谨慎使用）

```bash
npm run push:force
```

**注意**: 即使使用 `push:force`，也会先运行安全审核。

---

### 方法 2: 使用脚本文件

#### Windows 系统

```bash
scripts\safe-push.bat
```

这个脚本会：
1. 运行安全审核
2. 显示 Git 状态
3. 询问是否继续推送
4. 推送到 GitHub

#### Linux/Mac 系统

```bash
bash scripts/safe-push.sh
```

---

## ⚠️ 如果发现敏感信息

### 1. 审核失败示例

```
❌ 发现潜在的敏感信息：

文件: src/config/database.js
模式: /password\s*[:=]\s*['"][^'"]+['"]/gi
匹配: password: "mySecretPassword"
---

⚠️  共发现 1 个潜在问题
请检查并移除敏感信息后再推送到 GitHub
```

### 2. 处理步骤

1. **检查文件**
   - 打开提示的文件
   - 查看匹配的内容

2. **移除敏感信息**
   - 将敏感信息移到环境变量（`.env` 文件）
   - 使用配置文件（不提交到 Git）
   - 使用占位符替代

3. **更新 .gitignore**
   - 确保敏感文件已添加到 `.gitignore`

4. **重新推送**
   - 再次运行 `npm run push`

---

## 🛡️ 最佳实践

### 1. 使用环境变量

**不推荐** ❌:
```javascript
const apiKey = "sk-1234567890abcdef";
```

**推荐** ✅:
```javascript
const apiKey = process.env.API_KEY;
```

在 `.env` 文件中：
```
API_KEY=sk-1234567890abcdef
```

### 2. 使用配置文件

创建 `config.local.js`（已在 `.gitignore` 中）:
```javascript
module.exports = {
  apiKey: "sk-1234567890abcdef",
  database: {
    host: "localhost",
    password: "myPassword"
  }
};
```

在代码中使用：
```javascript
const config = require('./config.local.js');
```

### 3. 使用占位符

在提交的代码中使用占位符：
```javascript
const config = {
  apiKey: "<YOUR_API_KEY>",
  password: "<YOUR_PASSWORD>"
};
```

---

## 📝 .gitignore 配置

项目已配置以下敏感文件保护：

```gitignore
# Environment variables
.env
.env.local
.env.*.local
*.key
*.pem
*.p12
*.pfx

# 敏感配置文件
config.local.js
secrets.json
credentials.json
```

---

## 🔧 自定义安全规则

如果需要添加自定义的敏感信息检查规则，编辑 `scripts/security-check.js`：

```javascript
const SENSITIVE_PATTERNS = [
  // 添加你的自定义规则
  /your[_-]?custom[_-]?pattern/gi,
  
  // 现有规则...
  /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi,
  // ...
];
```

---

## 📊 工作流程

### 正常推送流程

```
1. 编写代码
   ↓
2. git add .
   ↓
3. git commit -m "message"
   ↓
4. npm run push
   ↓
5. 安全审核 ✅
   ↓
6. 推送到 GitHub ✅
```

### 发现敏感信息流程

```
1. npm run push
   ↓
2. 安全审核 ❌
   ↓
3. 查看问题报告
   ↓
4. 移除敏感信息
   ↓
5. git add .
   ↓
6. git commit --amend
   ↓
7. npm run push
   ↓
8. 安全审核 ✅
   ↓
9. 推送到 GitHub ✅
```

---

## 🚨 紧急情况处理

### 如果已经推送了敏感信息

1. **立即撤销密钥**
   - 如果是 API 密钥，立即在服务商处撤销
   - 生成新的密钥

2. **从 Git 历史中移除**
   ```bash
   # 使用 git filter-branch 或 BFG Repo-Cleaner
   # 详细步骤请参考 GitHub 文档
   ```

3. **强制推送**
   ```bash
   git push origin master --force
   ```

4. **通知团队**
   - 告知团队成员密钥已泄露
   - 更新所有使用该密钥的地方

---

## 📚 相关资源

- [GitHub - 从仓库中删除敏感数据](https://docs.github.com/cn/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
- [Git Secrets](https://github.com/awslabs/git-secrets)

---

## ✅ 检查清单

在推送前，请确认：

- [ ] 代码中没有硬编码的密码
- [ ] 没有 API 密钥或令牌
- [ ] 没有数据库连接字符串
- [ ] 没有私钥文件
- [ ] `.env` 文件已在 `.gitignore` 中
- [ ] 敏感配置文件已在 `.gitignore` 中
- [ ] 运行了 `npm run security-check`

---

**最后更新**: 2025-10-06 15:30

