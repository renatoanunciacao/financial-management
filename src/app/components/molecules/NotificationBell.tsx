// components/NotificationBell.tsx
'use client'

import { Bell } from 'lucide-react'

interface Props {
  unreadCount: number
  onClick: () => void
}

export default function NotificationBell({ unreadCount, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="relative flex items-center justify-center p-2 hover:bg-gray-100 rounded-full"
    >
      <Bell size={20} />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
          {unreadCount}
        </span>
      )}
    </button>
  )
}
