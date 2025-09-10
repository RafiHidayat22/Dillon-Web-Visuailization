/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Button, Typography, Modal, message, Table } from 'antd'
import StepProgres from '@/components/StepProgres'
import NextBack from '@/components/NextBack'

const { Title, Paragraph } = Typography

interface Visualization {
  id: string
  chart_type: string
  chart_config: string
  created_at: string
}

interface HistoryItem {
  id: string
  fileName: string
  uploadedAt: string
  visualizations?: Visualization[]
}

const HistoryPage = () => {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string } | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteFileId, setDeleteFileId] = useState<string | null>(null)

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      const res = await fetch('/api/history', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok && Array.isArray(data.history)) setHistory(data.history)
    } catch (err) {
      console.error('Gagal fetch history:', err)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    const name = localStorage.getItem('name')
    if (!token || !name) router.push('/auth/login')
    else setUser({ name })
    fetchHistory()
  }, [router])

  const showDeleteModal = (id: string) => {
    setDeleteFileId(id)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteFileId) return
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/history?fileId=${deleteFileId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      const result = await res.json()
      if (res.ok) message.success(result.message || 'File berhasil dihapus')
      else message.error(result.error || 'Gagal menghapus file')
    } catch (err) {
      console.error(err)
      message.error('Terjadi kesalahan saat menghapus file')
    } finally {
      setDeleteModalOpen(false)
      setDeleteFileId(null)
      fetchHistory()
    }
  }

  const handleEdit = (id: string) => {
    localStorage.setItem('selectedFileId', id)
    router.push('/Visualize')
  }

  if (!user) return null

  // === Kolom Table ===
  const columns = [
    {
      title: 'Nama File',
      dataIndex: 'fileName',
      key: 'fileName'
    },
    {
      title: 'Tanggal Upload',
      dataIndex: 'uploadedAt',
      key: 'uploadedAt',
      render: (text: string) => new Date(text).toLocaleString()
    },
    {
      title: 'Visualisasi',
      dataIndex: 'visualizations',
      key: 'visualizations',
      render: (visualizations: Visualization[] | undefined) => (
        <div className="space-y-1">
          {visualizations?.map((vis) => (
            <div key={vis.id}>
              <strong>{vis.chart_type}</strong>: Chart tersedia
            </div>
          ))}
        </div>
      )
    },
    {
      title: 'Aksi',
      key: 'actions',
      render: (_: any, record: HistoryItem) => (
        <div className="flex flex-wrap gap-2">
          <Button type="primary" onClick={() => handleEdit(record.id)}>Edit</Button>
          <Button danger onClick={() => showDeleteModal(record.id)}>Delete</Button>
        </div>
      )
    }
  ]

  return (
    <div className="px-4 sm:px-6 lg:px-10 mt-5 overflow-x-auto">
      <motion.div
        className="flex flex-col items-center text-center mb-5 font-sans"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Title level={2}>History File & Visualisasi</Title>
        <Paragraph>Lihat, edit, atau hapus file CSV yang telah diunggah beserta visualisasinya</Paragraph>
      </motion.div>

      <StepProgres currentStep={4} />

      <div className="overflow-x-auto">
        <Table
          dataSource={history}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          scroll={{ x: 'max-content' }} // Membuat tabel bisa di-scroll horizontal di layar kecil
        />
      </div>

      <div className="mt-10">
        <NextBack nextLink="" backLink="/UpData" />
      </div>

      <Modal
        title="Hapus File"
        open={deleteModalOpen}
        onOk={handleDeleteConfirm}
        onCancel={() => setDeleteModalOpen(false)}
        okText="Hapus"
        cancelText="Batal"
        okType="danger"
      >
        Apakah Anda yakin ingin menghapus file ini?
      </Modal>
    </div>
  )
}

export default HistoryPage
