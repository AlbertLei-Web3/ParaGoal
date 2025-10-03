// 应用根组件（中文/English 注释）
// Chinese: 定义应用路由与通用布局，不包含任何模拟数据。
// English: Define routes and common layout. No mock data included.
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from '../pages/HomePage'
import { MatchPage } from '../pages/MatchPage'
import { AdminPage } from '../pages/AdminPage'
import { TestPage } from '../pages/TestPage'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/match/:id" element={<MatchPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}


