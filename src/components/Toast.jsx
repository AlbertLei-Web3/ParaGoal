// Toast notification system
// English: Provides success/error notifications using react-hot-toast
import { Toaster } from 'react-hot-toast'
import { createPortal } from 'react-dom'

export function ToastProvider() {
  return createPortal(
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#1e293b',
          color: '#f1f5f9',
          border: '1px solid #334155',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#f1f5f9',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#f1f5f9',
          },
        },
      }}
    />,
    document.body
  )
}
