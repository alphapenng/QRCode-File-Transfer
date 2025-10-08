# GitHub 同步快速参考

## 🚀 快速开始

### 推送代码到 GitHub（推荐方式）

```bash
# 1. 添加修改的文件
git add .

# 2. 提交更改
git commit -m "你的提交信息"

# 3. 安全推送（自动进行安全审核）
npm run push
```

---

## 📋 常用命令

### 1. 安全推送（推荐）

```bash
npm run push
```

**功能**:
- ✅ 自动运行安全审核
- ✅ 检查敏感信息（密钥、密码等）
- ✅ 推送到 GitHub

---

### 2. 仅安全审核

```bash
npm run security-check
```

**功能**:
- ✅ 扫描代码中的敏感信息
- ✅ 不推送代码

---

### 3. 查看状态

```bash
git status
```

---

### 4. 查看提交历史

```bash
git log --oneline -10
```

---

### 5. 拉取最新代码

```bash
git pull origin main
```

---

## ⚠️ 注意事项

### 1. 每次推送前都会自动进行安全审核

使用 `npm run push` 会自动检查：
- API 密钥和令牌
- 密码
- 私钥
- 数据库连接字符串
- 其他敏感信息

### 2. 如果发现敏感信息

审核失败时会显示：
```
❌ 发现潜在的敏感信息：

文件: src/config/database.js
模式: /password\s*[:=]\s*['"][^'"]+['"]/gi
匹配: password: "mySecretPassword"
```

**处理步骤**:
1. 检查提示的文件
2. 移除敏感信息（使用环境变量或配置文件）
3. 重新提交和推送

### 3. 敏感信息应该放在哪里？

**✅ 推荐做法**:

1. **使用 .env 文件**（已在 .gitignore 中）
   ```
   API_KEY=your-api-key
   DATABASE_PASSWORD=your-password
   ```

2. **使用 config.local.js**（已在 .gitignore 中）
   ```javascript
   module.exports = {
     apiKey: "your-api-key",
     password: "your-password"
   };
   ```

3. **使用环境变量**
   ```javascript
   const apiKey = process.env.API_KEY;
   ```

---

## 🔧 Git 工作流程

### 标准流程

```bash
# 1. 查看当前状态
git status

# 2. 添加修改的文件
git add .

# 3. 提交更改
git commit -m "feat: 添加新功能"

# 4. 安全推送
npm run push
```

### 提交信息规范

使用语义化提交信息：

- `feat:` - 新功能
- `fix:` - 修复 bug
- `docs:` - 文档更新
- `style:` - 代码格式调整
- `refactor:` - 重构代码
- `test:` - 添加测试
- `chore:` - 构建/工具更新

**示例**:
```bash
git commit -m "feat: 添加文件选择功能"
git commit -m "fix: 修复二维码生成错误"
git commit -m "docs: 更新 README"
```

---

## 🔗 GitHub 仓库

**仓库地址**: https://github.com/alphapenng/QRCode-File-Transfer

**查看代码**: https://github.com/alphapenng/QRCode-File-Transfer/tree/main

**提交历史**: https://github.com/alphapenng/QRCode-File-Transfer/commits/main

---

## 📚 相关文档

- [安全推送指南](./docs/security-guide.md) - 详细的安全审核说明
- [开发规范](./docs/development-guidelines.md) - 代码规范和最佳实践

---

## 🆘 常见问题

### Q1: 推送失败怎么办？

**A**: 检查错误信息：

1. **认证失败**
   ```bash
   # 配置 Git 凭据
   git config --global user.name "alphapenng"
   git config --global user.email "your-email@example.com"
   ```

2. **网络问题**
   - 检查网络连接
   - 尝试使用 VPN

3. **冲突**
   ```bash
   # 先拉取最新代码
   git pull origin main
   # 解决冲突后再推送
   npm run push
   ```

---

### Q2: 如何撤销上一次提交？

**A**: 使用以下命令：

```bash
# 撤销提交，保留修改
git reset --soft HEAD~1

# 撤销提交和修改
git reset --hard HEAD~1
```

---

### Q3: 如何修改上一次提交信息？

**A**: 使用以下命令：

```bash
git commit --amend -m "新的提交信息"
```

---

### Q4: 如何查看某个文件的修改历史？

**A**: 使用以下命令：

```bash
git log --oneline -- path/to/file
```

---

## ✅ 检查清单

每次推送前确认：

- [ ] 代码已测试
- [ ] 提交信息清晰
- [ ] 没有硬编码的敏感信息
- [ ] 运行了 `npm run security-check`
- [ ] 使用 `npm run push` 推送

---

**最后更新**: 2025-10-06 15:35

