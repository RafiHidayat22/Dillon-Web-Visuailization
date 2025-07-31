'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import StepProgres from '@/components/StepProgres'
import NextBack from '@/components/NextBack'

const UpData = () => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<string>('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.name.endsWith('.csv')) {
        setSelectedFile(file.name)
        console.log('File dipilih:', file.name)
      } else {
        setSelectedFile('')
        alert('Hanya file CSV yang diperbolehkan!')
      }
    }
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  return (
    <>
      {/* Container judul */}
      <div className="flex flex-col items-center text-center mt-5 font-sans">
        <h1 className="text-2xl font-bold mb-5 ">Langkah 1 dari 4: Unggah Data</h1>
      </div>

      {/* Step Progress */}
      <div className="mx-10">
        <StepProgres currentStep={1} />
      </div>


      {/* Konten utama */}
      <div className="flex flex-wrap justify-between items-center gap-5 max-w-[1200px] mx-auto my-10 px-4">
        
        {/* Kiri */}
        <div className="flex-1 min-w-[250px]">
          <h1 className="text-2xl font-bold font-sans mb-2">Unggah Data</h1>
          <h4 className="text-base font-normal font-sans mt-2 leading-snug">
            Silakan unggah file CSV dari komputer Anda. Pastikan file sudah termasuk baris atau kolom judul untuk memudahkan pemrosesan data.
          </h4>

          <h4 className="text-base font-normal font-sans mt-4 flex items-center gap-2">
            <Image src="/tips.png" alt="Tips Icon" width={15} height={15} />
            <strong>Tips:</strong> Pastikan file Anda berekstensi .csv dan tidak memiliki baris kosong di awal.
          </h4>

          <button
            onClick={triggerFileSelect}
            className="mt-5 w-[120px] px-4 py-2 border border-black rounded-full bg-white flex justify-between items-center font-regular hover:bg-black/10 transition"
          >
            Pilih File
            <Image src="/fileIcon.png" alt="File Icon" width={15} height={15} />
          </button>

          <input
            type="file"
            accept=".csv"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          {selectedFile && (
            <p className="mt-5 font-sans">
              <strong>File terpilih:</strong> {selectedFile}
            </p>
          )}
        </div>

        {/* Tengah */}
        <div className="flex-1 min-w-[250px] flex justify-center items-center">
          <Image src="/csvIcon.png" alt="Icon CSV" width={150} height={150} />
        </div>

        {/* Kanan */}
        <div className="flex-1 min-w-[250px] flex justify-center items-center">
          <Image src="/csvImage.png" alt="Ilustrasi CSV" width={300} height={200} />
        </div>
      </div>

      <NextBack nextLink="/CheckData" backLink="/" />
    </>
  )
}

export default UpData
