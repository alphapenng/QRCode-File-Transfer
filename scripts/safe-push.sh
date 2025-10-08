#!/bin/bash

###
# 安全推送脚本
# 在推送到 GitHub 前自动进行安全审核
###

echo "🔒 准备推送到 GitHub..."
echo ""

# 1. 运行安全审核
echo "📋 步骤 1/3: 安全审核"
node scripts/security-check.js

if [ $? -ne 0 ]; then
  echo ""
  echo "❌ 安全审核失败，推送已取消"
  exit 1
fi

echo ""

# 2. 检查 Git 状态
echo "📋 步骤 2/3: 检查 Git 状态"
git status

echo ""
read -p "是否继续推送？(y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ 推送已取消"
  exit 1
fi

echo ""

# 3. 推送到 GitHub
echo "📋 步骤 3/3: 推送到 GitHub"
git push origin main

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ 推送成功！"
  echo "🔗 GitHub: https://github.com/alphapenng/QRCode-File-Transfer"
else
  echo ""
  echo "❌ 推送失败，请检查错误信息"
  exit 1
fi

