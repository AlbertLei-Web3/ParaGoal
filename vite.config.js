/**
 * Vite 配置文件（中文/English）
 *
 * 中文：
 * - 使用 @vitejs/plugin-react 以支持 React 快速刷新与 JSX 转译。
 * - 该配置保持最小化，便于黑客松快速起步。
 *
 * English:
 * - Uses @vitejs/plugin-react for React fast refresh and JSX transform.
 * - Keep it minimal for quick hackathon bootstrap.
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()]
})

