// 通用布局组件（中英文注释，便于初学者理解）
// Chinese: 提供页面头部、主体容器与右下角 Admin 按钮的占位。
// English: Provides header, main container, and a floating Admin button placeholder.
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { WalletConnectPlaceholder } from '../../components/WalletConnectPlaceholder'
import { AdminFabPlaceholder } from '../../components/AdminFabPlaceholder'
import { PitchBackground } from '../../components/PitchBackground'

export function Layout({ children }) {
  const location = useLocation()
  return (
    <div className="min-h-screen flex flex-col">
      <PitchBackground />
      {/* Header: 顶部导航区域 / Top navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-semibold text-lg text-slate-100">FanForce AI</Link>
          <div className="flex items-center gap-4">
            <nav className="hidden sm:flex items-center gap-3 text-slate-300">
              <Link className={`px-2 py-1 rounded hover:bg-slate-800 ${location.pathname==='/'?'text-yellow-400':''}`} to="/">Home</Link>
              <Link className={`px-2 py-1 rounded hover:bg-slate-800 ${location.pathname.startsWith('/admin')?'text-yellow-400':''}`} to="/admin">Admin</Link>
              <Link className={`px-2 py-1 rounded hover:bg-slate-800 ${location.pathname.startsWith('/test')?'text-yellow-400':''}`} to="/test">Test</Link>
            </nav>
            <WalletConnectPlaceholder />
          </div>
        </div>
      </header>

      {/* Main: 主体容器 / Main content container */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-10">
          {children}
        </div>
      </main>

      {/* 右下角 Admin 按钮占位 / Floating Admin button placeholder */}
      <AdminFabPlaceholder />
    </div>
  )
}


