// 通用布局组件（中英文注释，便于初学者理解）
// Chinese: 提供页面头部、主体容器与右下角 Admin 按钮的占位。
// English: Provides header, main container, and a floating Admin button placeholder.
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { WalletConnectPlaceholder } from '../../components/WalletConnectPlaceholder'
import { AdminFabPlaceholder } from '../../components/AdminFabPlaceholder'

export function Layout({ children }) {
  const location = useLocation()
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header: 顶部导航区域 / Top navigation */}
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-semibold text-lg">ParaGoal</Link>
          <div className="flex items-center gap-4">
            <nav className="hidden sm:flex items-center gap-3">
              <Link className={`px-2 py-1 rounded hover:bg-gray-100 ${location.pathname==='/'?'text-blue-600':''}`} to="/">首页</Link>
              <Link className={`px-2 py-1 rounded hover:bg-gray-100 ${location.pathname.startsWith('/admin')?'text-blue-600':''}`} to="/admin">Admin</Link>
            </nav>
            <WalletConnectPlaceholder />
          </div>
        </div>
      </header>

      {/* Main: 主体容器 / Main content container */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {children}
        </div>
      </main>

      {/* 右下角 Admin 按钮占位 / Floating Admin button placeholder */}
      <AdminFabPlaceholder />
    </div>
  )
}


