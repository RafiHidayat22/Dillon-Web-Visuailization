'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/src/hooks/AuthContext'

const NavBar = () => {
  const { user, logout } = useAuth()

  return (
    <nav className="flex justify-between items-center bg-gray-100 px-8 py-4 text-black sticky top-0 z-[99] h-[70px] border-b border-black/10">
      <Image src="/Logo.png" alt="Logo" width={100} height={50} />
      <ul className="flex gap-6 list-none items-center">
        <li><a href="#fitur">Fitur</a></li>

        {user ? (
          <>
            <li>Hai, {user.name}</li>
            <li><button className='cursor-pointer' onClick={logout}>Logout</button></li>
          </>
        ) : (
          <li><Link href="/auth/login">Masuk</Link></li>
        )}

        <li><a href="#faq"><Image src="/Faq.png" alt="faq" width={20} height={20} /></a></li>
      </ul>
    </nav>
  )
}

export default NavBar
