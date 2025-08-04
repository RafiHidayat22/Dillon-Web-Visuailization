'use client'

import Image from 'next/image'
import { Button } from 'antd'
import { useRouter } from 'next/navigation'

interface NextBackProps {
  nextLink: string
  backLink: string
  onNext?: () => void
}

const NextBack = ({ nextLink, backLink, onNext }: NextBackProps) => {
  const router = useRouter()

  const handleNext = () => {
    if (onNext) {
      onNext()
    } else {
      router.push(nextLink)
    }
  }

  return (
    <nav
      className="flex justify-between items-center px-8 w-full h-[70px]"
      aria-label="Navigation page"
    >
      <Button
        type="default"
        shape="round"
        className="flex items-center gap-2 border-2 border-black hover:border-blue-600 transition font-sans"
        onClick={() => router.push(backLink)}
      >
        <Image src="/arrowBack.png" alt="Kembali" width={20} height={15} />
        Kembali
      </Button>

      <Button
        type="default"
        shape="round"
        className="flex items-center gap-2 border-2 border-black hover:border-blue-600 transition font-sans"
        onClick={handleNext}
      >
        Lanjut
        <Image src="/arrow.png" alt="Lanjut" width={20} height={15} />
      </Button>
    </nav>
  )
}

export default NextBack
