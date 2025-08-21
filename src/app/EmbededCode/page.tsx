'use client'
import { useState, useEffect } from 'react'
import NextBack from '@/components/NextBack'
import { motion } from 'framer-motion'
import StepProgres from '@/components/StepProgres'
import { useRouter } from "next/navigation";
const Page = () => {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string } | null>(null)

      useEffect(() => {
      const token = localStorage.getItem('token')
      const name = localStorage.getItem('name')
  
      if (!token || !name) {
        router.push('/auth/login') // redirect kalau tidak login
      } else {
        setUser({ name })
      }
    }, [router])

    if (!user) return null
  return (
    <>
      {/* Header */}
      <motion.div
        className="flex flex-col items-center text-center mt-5 font-sans"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-2xl font-bold mb-5">
          Langkah 4 dari 4: Dapatkan Code dan Hasil Visualisasi
        </h1>
      </motion.div>

      {/* Step Progress */}
      <div className="mx-10 overflow-x-auto">
        <StepProgres currentStep={4} />
      </div>

      {/* Main Content */}
      <div className="mx-10 mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Hasil Visualisasi */}
        <motion.div
          className="col-span-1 md:col-span-2 bg-white shadow-md rounded-2xl p-5 border border-gray-200"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-lg font-semibold mb-3">Hasil Visualisasi</h2>
          <div className="flex items-center justify-center bg-gray-100 rounded-lg h-60">
            <p className="text-gray-500">Preview visualisasi akan ditampilkan di sini...</p>
          </div>

          <div className="flex justify-end mt-4">
            <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow hover:bg-blue-700 transition">
              Download Hasil Visualisasi
            </button>
          </div>
        </motion.div>
      </div>

      {/* Next & Back */}
      <div className="mx-10 mt-10">
        <NextBack nextLink="" backLink="/Visualize" />
      </div>
    </>
  )
}

export default Page
