// components/NotificationList.tsx
'use client'

interface Notification {
  id: string
  message: string
  createdAt: string
  isRead?: boolean
}

interface Props {
  notifications: Notification[]
  markAsRead: (id: string) => void
}

export default function NotificationList({ notifications, markAsRead }: Props) {
  return (
    <div className="sm:absolute right-0 mt-8 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
      <div className="p-2 text-sm font-semibold border-b">Notificações</div>
      <ul className="max-h-60 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map(n => (
            <li
              key={n.id}
              className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                n.isRead ? "text-gray-400" : "text-gray-900 font-medium"
              }`}
              onClick={() => markAsRead(n.id)}
            >
              {n.message}
              <div className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</div>
            </li>
          ))
        ) : (
          <li className="px-3 py-2 text-sm text-gray-500">Sem notificações</li>
        )}
      </ul>
    </div>
  )
}
