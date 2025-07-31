'use client'

import Link from 'next/link'
import Image from 'next/image'
import Card from '@/components/Card'


const HomePage = () => {
  return (
    <>

      <div className="bg-gray-100 flex justify-between items-center px-10 py-10 flex-wrap">
        {/* Kiri */}
        <section className="text-black max-w-xl font-sans mb-10">
          <h1 className="font-semibold text-5xl leading-tight mt-10">
            Angka <span className="bg-[#7D7BF8] rounded-xl px-2">bicara,</span>{' '}
            <span className="bg-[#1814F3] rounded-xl px-2 text-white">wawasan</span> hadir seketika
          </h1>
          <h4 className="font-normal text-2xl mt-5 leading-tight">
            Jelajahi visualisasi interaktif yang membantu anda memahami tren, pola, dan insight penting dari data yang kompleks
          </h4>
          <Link
            href="/UpData"
            className="inline-block mt-10 px-8 py-3 text-lg font-bold bg-[#1475F3] text-black rounded-xl hover:bg-[#00cccc] transition duration-300 no-underline"
          >
            Mulai
          </Link>
        </section>

        {/* Kanan */}
        <section className="relative w-[500px] h-[400px] hidden md:block">
          <Image
            src="/Piechart.png"
            alt="3d-img1"
            width={450}
            height={450}
            className="absolute top-0 right-[250px] z-20 w-[450px] h-[450px]"
          />
          <Image
            src="/line.png"
            alt="3d-img2"
            width={400}
            height={400}
            className="absolute top-[60px] right-[20px] z-10 w-[400px] h-[400px]"
          />
        </section>
      </div>
      <Card/>
    </>
  )
}

export default HomePage
