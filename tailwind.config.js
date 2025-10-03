/**
 * TailwindCSS 配置（中文/English）
 *
 * 中文：
 * - content 指向 index.html 与 src 下的所有文件，确保类名能被收集。
 * - 可在 theme.extend 中添加品牌色、字号等设计令牌。
 *
 * English:
 * - content targets index.html and src/**/* for class scanning.
 * - Customize theme.extend for brand colors, typography, etc.
 */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {}
  },
  plugins: []
}

