// Admin 浮动按钮占位（中英文注释）
// Chinese: 任意连接钱包后可见的 Admin 按钮占位（此处默认展示）。
// English: Admin floating action button placeholder (visible by default for now).
import React from 'react'
import { Link } from 'react-router-dom'

export function AdminFabPlaceholder() {
  return (
    <Link
      to="/admin"
      className="fixed right-4 bottom-4 rounded-full shadow-lg bg-blue-600 text-white px-5 py-3 hover:bg-blue-700"
      title="Placeholder: visible after connecting any wallet"
    >
      Admin
    </Link>
  )
}


