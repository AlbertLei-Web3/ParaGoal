// Admin 页面骨架（中英文注释）
// Chinese: 包含队伍与比赛的增删改查占位、注入奖池/关闭/结算按钮占位。
// English: Placeholders for CRUD on teams/matches and pool/states controls.
import React from 'react'

export function AdminPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin 管理台</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="border bg-white rounded-lg p-4 shadow-sm">
          <h2 className="font-semibold mb-3">队伍管理（占位）</h2>
          <div className="text-sm text-gray-500">新增/编辑/删除队伍功能将在连接合约后实现。</div>
          <button className="mt-3 px-3 py-2 rounded bg-gray-200 text-gray-600 cursor-not-allowed">添加队伍（未接链）</button>
        </section>
        <section className="border bg-white rounded-lg p-4 shadow-sm">
          <h2 className="font-semibold mb-3">比赛管理（占位）</h2>
          <div className="text-sm text-gray-500">创建/开启/关闭/结算等操作将在连接合约后实现。</div>
          <div className="flex gap-2 mt-3">
            <button className="px-3 py-2 rounded bg-gray-200 text-gray-600 cursor-not-allowed">创建比赛</button>
            <button className="px-3 py-2 rounded bg-gray-200 text-gray-600 cursor-not-allowed">注入奖池</button>
            <button className="px-3 py-2 rounded bg-gray-200 text-gray-600 cursor-not-allowed">关闭下注</button>
            <button className="px-3 py-2 rounded bg-gray-200 text-gray-600 cursor-not-allowed">结算</button>
          </div>
        </section>
      </div>
      <p className="text-sm text-gray-500">说明：当前页面仅为 UI 骨架，后续将接入 Paseo 合约与钱包。</p>
    </div>
  )
}


