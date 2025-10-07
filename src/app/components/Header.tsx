'use client'

import { signOut, useSession } from 'next-auth/react'
import { useState, useEffect, useRef } from 'react'
import { Menu, X } from 'lucide-react'
import NotificationBell from './NotificationBell'
import NotificationList from './NotificationList'

interface Notification {
  id: string
  message: string
  createdAt: string
  isRead?: boolean
}

export default function Header() {
  const { data: session } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])

  const dropdownRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.isRead).length

  // Buscar notificações
  useEffect(() => {
    fetch("/api/notifications/all")
      .then(res => res.json())
      .then(data => setNotifications(data.all || []))
  }, [])

  // SSE
  useEffect(() => {
    const eventSource = new EventSource("/api/notifications/stream")
    eventSource.onmessage = (event) => {
      const newNotification: Notification = JSON.parse(event.data)
      setNotifications(prev => [newNotification, ...prev])
    }
    eventSource.onerror = () => eventSource.close()
    return () => eventSource.close()
  }, [])

  // Fechar dropdown clicando fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const markAsRead = async (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    )
    await fetch("/api/notifications/mark-as-read", {
      method: "POST",
      body: JSON.stringify({ id }),
      headers: { "Content-Type": "application/json" },
    })
  }

  return (
    <header className="bg-white dark:bg-gray-900 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 text-xl font-bold text-blue-600 dark:text-blue-400">
            Controle Financeiro
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-6 items-center">
            <a href="/dashboard" className="text-gray-700 dark:text-gray-200 hover:text-blue-500">Dashboard</a>
            <a href="/card-loans" className="text-gray-700 dark:text-gray-200 hover:text-blue-500">Empréstimos via Cartões</a>
            <a href="/about" className="text-gray-700 dark:text-gray-200 hover:text-blue-500">Sobre</a>

            {session && (
              <div className="flex items-center gap-4 relative">
                <span className="text-gray-700 dark:text-gray-200">{session?.user?.name}</span>

                <NotificationBell
                  unreadCount={unreadCount}
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                />

                {isNotifOpen && (
                  <div ref={dropdownRef}>
                    <NotificationList
                      notifications={notifications}
                      markAsRead={markAsRead}
                    />
                  </div>
                )}

                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition cursor-pointer"
                >
                  Sair
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-700 dark:text-gray-200">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2 bg-white dark:bg-gray-900">
          <a href="/dashboard" className="block text-gray-700 dark:text-gray-200 hover:text-blue-500">Dashboard</a>
          <a href="/card-loans" className="block text-gray-700 dark:text-gray-200 hover:text-blue-500">Empréstimos via Cartões</a>
          <a href="/about" className="block text-gray-700 dark:text-gray-200 hover:text-blue-500">Sobre</a>

          {session && (
            <div className="flex flex-col mt-8 gap-2">
              <span className="text-gray-700 dark:text-gray-200">{session?.user?.name}</span>

              {/* Sino notificações mobile */}
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
              >
                Notificações ({unreadCount})
              </button>

              {isNotifOpen && (
                <NotificationList
                  notifications={notifications}
                  markAsRead={markAsRead}
                />
              )}

              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="text-red-600 hover:text-red-700"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
