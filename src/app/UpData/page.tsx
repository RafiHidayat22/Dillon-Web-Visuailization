'use client'

import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import StepProgres from '@/components/StepProgres'
import NextBack from '@/components/NextBack'
import { useRouter } from 'next/navigation'
import { Modal } from 'antd'

const UpData = () => {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<{ name: string } | null>(null)

  // === state modal ===
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalContent, setModalContent] = useState('')
  const [onOkAction, setOnOkAction] = useState<(() => void) | null>(null)

  // ==== AUTH CHECK ====
  useEffect(() => {
    const token = localStorage.getItem('token')
    const name = localStorage.getItem('name')

    if (!token || !name) {
      router.push('/auth/login')
    } else {
      setUser({ name })
    }
  }, [router])

  const showModal = (title: string, content: string, onOk?: () => void) => {
    setModalTitle(title)
    setModalContent(content)
    setOnOkAction(() => onOk || null)
    setModalOpen(true)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      showModal('Format File Salah', 'Hanya file CSV yang diperbolehkan!')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        showModal('Login Diperlukan', 'Anda harus login untuk mengunggah file.', () => {
          router.push('/auth/login')
        })
        return
      }

      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upData', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await res.json()
      if (res.ok) {
        // simpan datasetId
        if (result.datasetId) {
          localStorage.setItem('selectedFileId', result.datasetId)
        }

        showModal('Upload Berhasil', result.message || 'File CSV berhasil diunggah!', () => {
          router.push('/CheckData')
        })
      } else {
        showModal('Gagal Upload', result.error || 'Terjadi kesalahan saat upload')
      }
    } catch (err) {
      console.error(err)
      showModal('Error', 'Gagal mengunggah file')
    } finally {
      setLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  if (!user) return null

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

      <div className="mx-10 overflow-x-auto">
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

          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="mt-5 block w-full border border-black rounded-full px-4 py-2 cursor-pointer"
            disabled={loading}
          />

          {loading && (
            <motion.p
              className="mt-3 text-green-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              Mengunggah file...
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

      {/* === Modal Popup === */}
      <Modal
        title={modalTitle}
        open={modalOpen}
        onOk={() => {
          if (onOkAction) onOkAction()
          setModalOpen(false)
        }}
        onCancel={() => setModalOpen(false)}
        okText="OK"
        cancelText="Tutup"
      >
        {modalContent}
      </Modal>
    </>
  )
}

export default UpData
