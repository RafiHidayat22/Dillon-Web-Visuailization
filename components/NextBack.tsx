'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from 'antd'

interface NextBackProps {
  nextLink: string
  backLink: string
}

const NextBack = ({ nextLink, backLink }: NextBackProps) => {
  return (
    <nav
      className="flex justify-between items-center px-8 w-full h-[70px]"
      aria-label="Navigation page"
    >
      <Link href={backLink}>
        <Button
          type="default"
          shape="round"
          className="flex items-center gap-2 border-2 border-black hover:border-blue-600 transition font-sans"
        >
          <Image src="/arrowBack.png" alt="Kembali" width={20} height={15} />
          Kembali
        </Button>
      </Link>

      <Link href={nextLink}>
        <Button
          type="default"
          shape="round"
          className="flex items-center gap-2 border-2 border-black hover:border-blue-600 transition font-sans"
        >
          Lanjut
          <Image src="/arrow.png" alt="Lanjut" width={20} height={15} />
        </Button>
      </Link>
    </nav>
  )
}

export default NextBack
