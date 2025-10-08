@echo off
REM 安全推送脚本 (Windows)
REM 在推送到 GitHub 前自动进行安全审核

echo.
echo 🔒 准备推送到 GitHub...
echo.

REM 1. 运行安全审核
echo 📋 步骤 1/3: 安全审核
node scripts/security-check.js

if %errorlevel% neq 0 (
  echo.
  echo ❌ 安全审核失败，推送已取消
  pause
  exit /b 1
)

echo.

REM 2. 检查 Git 状态
echo 📋 步骤 2/3: 检查 Git 状态
git status

echo.
set /p confirm="是否继续推送？(y/n): "

if /i not "%confirm%"=="y" (
  echo ❌ 推送已取消
  pause
  exit /b 1
)

echo.

REM 3. 推送到 GitHub
echo 📋 步骤 3/3: 推送到 GitHub
git push origin main

if %errorlevel% equ 0 (
  echo.
  echo ✅ 推送成功！
  echo 🔗 GitHub: https://github.com/alphapenng/QRCode-File-Transfer
) else (
  echo.
  echo ❌ 推送失败，请检查错误信息
  pause
  exit /b 1
)

echo.
pause

