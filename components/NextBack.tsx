import Link from 'next/link'
import Image from 'next/image'


interface NextBackProps {
  nextLink: string
  backLink: string
}

const NextBack = ({ nextLink, backLink }: NextBackProps) => {
  return (
    <nav
      className="flex justify-between items-center px-8 w-full h-[70px] font-sans text-black"
      aria-label="Navigasi halaman selanjutnya dan sebelumnya"
    >
      <Link
        href={backLink}
        className="flex items-center justify-between w-[100px] px-3 py-2 bg-white border border-black rounded-[20px] font-regular hover:bg-black/10 transition"
      >
        <Image src='/arrowBack.png' alt="Kembali" width={20} height={15} />
        <span>Kembali</span>
      </Link>

      <Link
        href={nextLink}
        className="flex items-center justify-between w-[100px] px-3 py-2 bg-white border border-black rounded-[20px] font-regular hover:bg-black/10 transition"
      >
        <span>Lanjut</span>
        <Image src='/arrow.png' alt="Lanjut" width={20} height={15} />
      </Link>
    </nav>
  )
}

export default NextBack
