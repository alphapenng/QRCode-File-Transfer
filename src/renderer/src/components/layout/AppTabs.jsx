/**
 * 应用标签页组件
 * 提供发送端和接收端的切换
 */

import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui';
import { SenderLayout } from './SenderLayout';
import { ReceiverLayout } from './ReceiverLayout';

export function AppTabs() {
  return (
    <Tabs defaultValue="sender" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="sender" className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          发送文件
        </TabsTrigger>
        <TabsTrigger value="receiver" className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          接收文件
        </TabsTrigger>
      </TabsList>

      <TabsContent value="sender">
        <SenderLayout />
      </TabsContent>

      <TabsContent value="receiver">
        <ReceiverLayout />
      </TabsContent>
    </Tabs>
  );
}

export default AppTabs;

