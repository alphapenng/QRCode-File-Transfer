#!/usr/bin/env node

/**
 * 安全审核脚本
 * 在推送到 GitHub 前检查敏感信息
 */

const fs = require('fs');
const path = require('path');

// 敏感信息模式
const SENSITIVE_PATTERNS = [
  // API 密钥和令牌
  /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi,
  /api[_-]?secret\s*[:=]\s*['"][^'"]+['"]/gi,
  /access[_-]?token\s*[:=]\s*['"][^'"]+['"]/gi,
  /auth[_-]?token\s*[:=]\s*['"][^'"]+['"]/gi,
  
  // 密码
  /password\s*[:=]\s*['"][^'"]+['"]/gi,
  /passwd\s*[:=]\s*['"][^'"]+['"]/gi,
  /pwd\s*[:=]\s*['"][^'"]+['"]/gi,
  
  // 私钥
  /private[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi,
  /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/gi,
  
  // 数据库连接
  /mongodb:\/\/[^'"]+/gi,
  /mysql:\/\/[^'"]+/gi,
  /postgres:\/\/[^'"]+/gi,
  
  // AWS 密钥
  /AKIA[0-9A-Z]{16}/g,
  /aws[_-]?secret[_-]?access[_-]?key/gi,
  
  // 其他敏感信息
  /client[_-]?secret\s*[:=]\s*['"][^'"]+['"]/gi,
  /encryption[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi,
];

// 需要检查的文件扩展名
const CHECK_EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx', '.json', '.env', '.yml', '.yaml', '.md'];

// 排除的目录
const EXCLUDE_DIRS = ['node_modules', 'dist', 'build', 'out', '.git', 'coverage'];

/**
 * 递归扫描目录
 */
function scanDirectory(dir, results = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // 跳过排除的目录
      if (!EXCLUDE_DIRS.includes(file)) {
        scanDirectory(filePath, results);
      }
    } else {
      // 检查文件扩展名
      const ext = path.extname(file);
      if (CHECK_EXTENSIONS.includes(ext)) {
        results.push(filePath);
      }
    }
  }
  
  return results;
}

/**
 * 检查文件内容
 */
function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const issues = [];
  
  for (const pattern of SENSITIVE_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      issues.push({
        file: filePath,
        pattern: pattern.toString(),
        matches: matches
      });
    }
  }
  
  return issues;
}

/**
 * 主函数
 */
function main() {
  console.log('🔍 开始安全审核...\n');
  
  const projectRoot = path.resolve(__dirname, '..');
  const files = scanDirectory(projectRoot);
  
  console.log(`📁 扫描 ${files.length} 个文件...\n`);
  
  let totalIssues = 0;
  const allIssues = [];
  
  for (const file of files) {
    const issues = checkFile(file);
    if (issues.length > 0) {
      totalIssues += issues.length;
      allIssues.push(...issues);
    }
  }
  
  if (totalIssues > 0) {
    console.log('❌ 发现潜在的敏感信息：\n');
    
    for (const issue of allIssues) {
      console.log(`文件: ${path.relative(projectRoot, issue.file)}`);
      console.log(`模式: ${issue.pattern}`);
      console.log(`匹配: ${issue.matches.join(', ')}`);
      console.log('---');
    }
    
    console.log(`\n⚠️  共发现 ${totalIssues} 个潜在问题`);
    console.log('请检查并移除敏感信息后再推送到 GitHub\n');
    process.exit(1);
  } else {
    console.log('✅ 未发现敏感信息');
    console.log('✅ 安全审核通过\n');
    process.exit(0);
  }
}

// 运行
main();

