'use client'

import Link from 'next/link'
import Image from 'next/image'

const NavBar = () => {
  return (
    <nav className="flex justify-between items-center bg-gray-100 px-8 py-4 text-black sticky top-0 z-[99] h-[70px] border-b border-black/10">
      <Image src="/Logo.png" alt="Logo" width={100} height={50} className="object-contain" />

      <ul className="flex gap-6 list-none items-center">
        <li>
          <a href="#fitur" className="text-black no-underline font-medium hover:underline">
            Fitur
          </a>
        </li>
        <li>
          <Link href="/auth-signUp" className="text-black no-underline font-medium hover:underline">
            Masuk
          </Link>
        </li>
        <li>
          <a href="#faq">
            <Image src="/Faq.png" alt="faq" width={20} height={20} className="object-contain" />
          </a>
        </li>
      </ul>
    </nav>
  )
}

export default NavBar
