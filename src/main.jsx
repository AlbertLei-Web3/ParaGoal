// 中文/English：应用入口文件
// Chinese: 在此挂载 React 应用与全局样式（Tailwind）
// English: Mount React App and import global styles (Tailwind)
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './app/App'
import './styles/index.css'

const container = document.getElementById('root')
const root = createRoot(container)
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)


