/*
 * @Description: 
 * @Author: alphapenng
 * @Github: 
 * @Date: 2025-10-08 17:52:55
 * @LastEditors: alphapenng
 * @LastEditTime: 2025-10-17 16:10:13
 * @FilePath: \qrcode-app\src\renderer\src\components\layout\MainLayout.jsx
 */
/**
 * 主布局组件
 * 提供应用的整体布局结构
 */

import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui';

export function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      {/* 头部 */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5 text-primary-foreground"
                >
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </div>
              <h1 className="text-xl font-bold">码上传报</h1>
            </div>
            <div className="text-sm text-muted-foreground">
              v1.0.0
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>

      {/* 底部 */}
      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-sm text-muted-foreground">
            © 2025 东海通
          </p>
        </div>
      </footer>
    </div>
  );
}

export default MainLayout;

