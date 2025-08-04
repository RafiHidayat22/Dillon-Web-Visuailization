'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
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
      <motion.div
        className="flex flex-col items-center text-center mt-5 font-sans"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-2xl font-bold mb-5">Langkah 1 dari 4: Unggah Data</h1>
      </motion.div>

      <div className="mx-10 overflow-x-auto w-full">
        <StepProgres currentStep={1} />
      </div>

      <motion.div
        className="flex flex-wrap justify-between items-center gap-5 max-w-[1200px] mx-auto my-10 px-4"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Left */}
        <div className="flex-1 min-w-[250px]">
          <h1 className="text-2xl font-bold mb-2">Unggah Data</h1>
          <h4 className="text-base mt-2 leading-snug">
            Silakan unggah file CSV dari komputer Anda. Pastikan file sudah termasuk baris atau kolom judul.
          </h4>

          <h4 className="text-base mt-4 flex items-center gap-2">
            <Image src="/tips.png" alt="Tips Icon" width={15} height={15} />
            <strong>Tips:</strong> Pastikan file berekstensi .csv
          </h4>

          <motion.button
            onClick={triggerFileSelect}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-5 w-[120px] px-4 py-2 border border-black rounded-full bg-white flex justify-between items-center hover:bg-black/10 transition"
          >
            Pilih File
            <Image src="/fileIcon.png" alt="File Icon" width={15} height={15} />
          </motion.button>

          <input
            type="file"
            accept=".csv"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          {selectedFile && (
            <motion.p
              className="mt-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <strong>File terpilih:</strong> {selectedFile}
            </motion.p>
          )}
        </div>

        {/* Center */}
        <motion.div
          className="flex-1 min-w-[250px] flex justify-center items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <Image src="/csvIcon.png" alt="Icon CSV" width={150} height={150} />
        </motion.div>

        {/* Right */}
        <motion.div
          className="flex-1 min-w-[250px] flex justify-center items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <Image src="/csvImage.png" alt="Ilustrasi CSV" width={300} height={200} />
        </motion.div>
      </motion.div>

      <NextBack nextLink="/CheckData" backLink="/" />
    </>
  )
}

export default UpData
