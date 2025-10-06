/*
 * @Description: 
 * @Author: alphapenng
 * @Github: 
 * @Date: 2025-10-06 00:20:41
 * @LastEditors: alphapenng
 * @LastEditTime: 2025-10-06 12:26:34
 * @FilePath: \qrcode-app\vite.config.js
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        // 主进程入口文件
        entry: 'src/main/index.js',
        vite: {
          build: {
            outDir: 'dist/main',
            rollupOptions: {
              external: ['electron']
            }
          }
        }
      },
      {
        // 预加载脚本
        entry: 'src/preload/index.js',
        onstart(options) {
          // 通知渲染进程重新加载
          options.reload();
        },
        vite: {
          build: {
            outDir: 'dist/preload',
            rollupOptions: {
              external: ['electron']
            }
          }
        }
      }
    ]),
    renderer()
  ],
  
  // 渲染进程配置
  root: resolve(__dirname, 'src/renderer'),
  base: './',
  
  build: {
    outDir: resolve(__dirname, 'dist/renderer'),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'src/renderer/index.html')
    }
  },
  
  server: {
    port: 5173,
    strictPort: true
  },
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/renderer/src'),
      '@shared': resolve(__dirname, 'src/shared')
    }
  }
});

