/**
 * 应用主组件
 * 整合主布局和标签页
 *
 * @Author: alphapenng
 * @Date: 2025-10-06 00:21:09
 * @LastEditTime: 2025-10-06 18:50:00
 */

import React from 'react';
import { MainLayout, AppTabs } from './components/layout';

function App() {
  return (
    <MainLayout>
      <AppTabs />
    </MainLayout>
  );
}

export default App;

