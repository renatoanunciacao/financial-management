'use client'

import { signOut, useSession } from 'next-auth/react'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function Header() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="bg-white dark:bg-gray-900 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo / Título */}
          <div className="flex-shrink-0 text-xl font-bold text-blue-600 dark:text-blue-400">
            Controle Financeiro
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-6 items-center">
            <a href="/dashboard" className="text-gray-700 dark:text-gray-200 hover:text-blue-500">Dashboard</a>
            <a href="/emprestimos" className="text-gray-700 dark:text-gray-200 hover:text-blue-500">Empréstimos via Cartões</a>
            <a href="/about" className="text-gray-700 dark:text-gray-200 hover:text-blue-500">Sobre</a>
            {session && (
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition cursor-pointer"
              >
                Sair
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 dark:text-gray-200">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2 bg-white dark:bg-gray-900">
          <a href="/dashboard" className="block text-gray-700 dark:text-gray-200 hover:text-blue-500">Dashboard</a>
          <a href="/emprestimos" className="block text-gray-700 dark:text-gray-200 hover:text-blue-500">Empréstimos via Cartões</a>
          <a href="/about" className="block text-gray-700 dark:text-gray-200 hover:text-blue-500">Sobre</a>
          {session && (
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full text-left text-red-600 hover:text-red-700"
            >
              Sair
            </button>
          )}
        </div>
      )}
    </header>
  )
}
