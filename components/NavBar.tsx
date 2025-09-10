'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/src/hooks/AuthContext'
import { useState } from 'react'
import { MenuOutlined, CloseOutlined } from '@ant-design/icons'

const NavBar = () => {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(prev => !prev)

  return (
    <nav className="flex justify-between items-center bg-gray-100 px-4 sm:px-8 py-4 text-black sticky top-0 z-[99] h-[70px] border-b border-black/10">
      <Image src="/Logo.png" alt="Logo" width={100} height={50} />

      {/* Hamburger icon for small screens */}
      <div className="sm:hidden">
        <button onClick={toggleMenu} aria-label="Menu">
          {isOpen ? <CloseOutlined style={{ fontSize: '24px' }} /> : <MenuOutlined style={{ fontSize: '24px' }} />}
        </button>
      </div>

      {/* Desktop menu */}
      <ul className="hidden sm:flex gap-6 list-none items-center">
        {user ? (
          <>
            <li className='text-md hover:text-blue-500'><Link href='/UpData'>Upload Data</Link></li>
            <li className='text-md hover:text-blue-500'><Link href='/CheckData'>Check Data</Link></li>
            <li className='text-md hover:text-blue-500'><Link href='/Visualize'>Visualisasi</Link></li>
            <li className='text-md hover:text-blue-500'><Link href='/EmbededCode'>Preview</Link></li>
            <li className='text-md hover:text-blue-500'><Link href='/historyFile'>History</Link></li>
            <li className='text-md'>Hai, {user.name}</li>
            <li>
              <button className='cursor-pointer text-white font-bold rounded-2xl px-3 py-0.5 bg-red-500 hover:bg-red-200' onClick={logout}>
                Logout
              </button>
            </li>
          </>
        ) : (
          <li><Link href="/auth/login">Masuk</Link></li>
        )}
      </ul>

      {/* Mobile menu */}
      {isOpen && (
        <ul className="flex flex-col gap-4 list-none absolute top-[70px] left-0 w-full bg-gray-100 p-4 sm:hidden border-t border-black/10 z-50">
          {user ? (
            <>
              <li className='text-md hover:text-blue-500'><Link href='/UpData' onClick={toggleMenu}>Upload Data</Link></li>
              <li className='text-md hover:text-blue-500'><Link href='/CheckData' onClick={toggleMenu}>Check Data</Link></li>
              <li className='text-md hover:text-blue-500'><Link href='/Visualize' onClick={toggleMenu}>Visualisasi</Link></li>
              <li className='text-md hover:text-blue-500'><Link href='/EmbededCode' onClick={toggleMenu}>Preview</Link></li>
              <li className='text-md hover:text-blue-500'><Link href='/historyFile' onClick={toggleMenu}>History</Link></li>
              <li className='text-md'>Hai, {user.name}</li>
              <li>
                <button className='cursor-pointer text-white font-bold rounded-2xl px-3 py-0.5 bg-red-500 hover:bg-red-200' onClick={() => { logout(); toggleMenu(); }}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li><Link href="/auth/login" onClick={toggleMenu}>Masuk</Link></li>
          )}
        </ul>
      )}
    </nav>
  )
}

export default NavBar
