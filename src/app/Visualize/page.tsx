/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState, useEffect, useMemo } from 'react'
import StepProgres from '@/components/StepProgres'
import NextBack from '@/components/NextBack'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Modal, Input, Select, Typography, Button, Space, Checkbox } from 'antd'
import { SketchPicker } from 'react-color'
import { ResponsiveContainer } from 'recharts'

import {
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  AreaChart, Area,
  ScatterChart, Scatter,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, LabelList
} from 'recharts'

const { Option } = Select
const { Title, Paragraph } = Typography



const defaultColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c']

const getStatistics = (data: any[], key: string) => {
  const numbers = data.map((item) => Number(item[key])).filter((val) => !isNaN(val))
  if (numbers.length === 0) return null
  const mean = numbers.reduce((sum, val) => sum + val, 0) / numbers.length
  const min = Math.min(...numbers)
  const max = Math.max(...numbers)
  const variance = numbers.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / numbers.length
  const stdDev = Math.sqrt(variance)
  const median = numbers.sort((a, b) => a - b)[Math.floor(numbers.length / 2)]
  return { mean: mean.toFixed(2), min, max, stdDev: stdDev.toFixed(2), median, count: numbers.length }
}

// Function to create histogram bins
const createHistogramData = (data: any[], valueKey: string, binCount: number = 10) => {
  const numbers = data.map(item => Number(item[valueKey])).filter(val => !isNaN(val))
  if (numbers.length === 0) return []
  
  const min = Math.min(...numbers)
  const max = Math.max(...numbers)
  const binWidth = (max - min) / binCount
  
  const bins = Array.from({ length: binCount }, (_, i) => {
    const binStart = min + i * binWidth
    const binEnd = min + (i + 1) * binWidth
    const count = numbers.filter(val => val >= binStart && (i === binCount - 1 ? val <= binEnd : val < binEnd)).length
    return {
      name: `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`,
      value: count,
      range: `${binStart.toFixed(1)} to ${binEnd.toFixed(1)}`
    }
  })
  
  return bins
}

const groupingSupportedCharts = ['bar', 'line', 'area', 'composed', 'horizontalBar']

const Visualize = () => {
  const router = useRouter()
  const [data, setData] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [user, setUser] = useState<{ name: string } | null>(null)

  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'radar' | 'composed' | 'histogram' | 'horizontalBar'>('bar')
  const [labelKey, setLabelKey] = useState('')
  const [valueKey, setValueKey] = useState('')
  const [chartColors, setChartColors] = useState(defaultColors)
  const [statistics, setStatistics] = useState<any | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalContent, setModalContent] = useState('')
  const [onOkAction, setOnOkAction] = useState<(() => void) | null>(null)

  const [useGrouping, setUseGrouping] = useState(false)
  const [groupKey, setGroupKey] = useState('')
  const [pieLabelFormat, setPieLabelFormat] = useState<'percent' | 'value'>('percent')
  const [usePieAggregate, setUsePieAggregate] = useState(true) // default aktif


  const aggregatePieData = (data: any[], labelKey: string, valueKey: string) => {
  const result: Record<string, number> = {}
  data.forEach(item => {
    const label = item[labelKey]
    const value = Number(item[valueKey]) || 0
    if (label) {
      result[label] = (result[label] || 0) + value
    }
  })
  return Object.entries(result).map(([name, value]) => ({ name, value }))
}


  // Histogram specific state
  const [histogramBins, setHistogramBins] = useState(10)

  const showModal = (title: string, content: string, onOk?: () => void) => {
    setModalTitle(title)
    setModalContent(content)
    setOnOkAction(() => onOk || null)
    setModalOpen(true)
  }

  useEffect(() => {
    const selectedFileId = localStorage.getItem('selectedFileId')
    const token = localStorage.getItem('token')
    if (!selectedFileId || !token) return

    fetch(`/api/visualization?id=${selectedFileId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(json => {
        let parsedData: any[] = []
        try {
          if (json.data) {
            if (Array.isArray(json.data)) parsedData = json.data
            else if (typeof json.data === 'string') parsedData = JSON.parse(json.data)
          }
        } catch (e) {
          console.error("Gagal parse data_json:", e, json.data)
        }
        setData(parsedData || [])
      })
      .catch(err => console.error("Fetch error:", err))
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    const name = localStorage.getItem('name')
    if (!token || !name) router.push('/auth/login')
    else setUser({ name })
  }, [router])

  const columnNames = useMemo(() => (data.length > 0 ? Object.keys(data[0]) : []), [data])
  useEffect(() => {
    if (columnNames.length > 0) {
      setLabelKey(columnNames[0])
      setValueKey(columnNames.length > 1 ? columnNames[1] : columnNames[0])
    }
  }, [columnNames])

  useEffect(() => {
    if (!groupingSupportedCharts.includes(chartType)) {
      setUseGrouping(false)
      setGroupKey('')
    }
  }, [chartType])

  const transformedData = data.map((item, index) => ({
    name: item[labelKey] ?? `Row ${index + 1}`,
    value: Number(item[valueKey]) || 0,
  }))

  const groupedData = useMemo(() => {
    if (!useGrouping || !labelKey || !valueKey || !groupKey) return transformedData

    const acc: any[] = []
    data.forEach(row => {
      const mainLabel = row[labelKey]
      const groupLabel = row[groupKey]
      const value = Number(row[valueKey]) || 0

      let existing = acc.find(item => item.name === mainLabel)
      if (!existing) {
        existing = { name: mainLabel }
        acc.push(existing)
      }
      existing[groupLabel] = value
    })
    return acc
  }, [data, labelKey, valueKey, groupKey, useGrouping])

  const groupCategories = useMemo(() => {
    if (!useGrouping || !groupKey) return []
    return Array.from(new Set(data.map(item => item[groupKey]))).filter(Boolean)
  }, [data, groupKey, useGrouping])

  const chartData = useGrouping ? groupedData : transformedData

  // Create histogram data when chart type is histogram
  const histogramData = useMemo(() => {
    if (chartType === 'histogram' && data.length > 0 && valueKey) {
      return createHistogramData(data, valueKey, histogramBins)
    }
    return []
  }, [chartType, data, valueKey, histogramBins])

  useEffect(() => {
    if (valueKey && data.length > 0) setStatistics(getStatistics(data, valueKey))
  }, [valueKey, data])

  if (!user) return null

const renderChart = () => {
  const xAxisProps = { 
    dataKey: 'name', 
    label: { value: labelKey, position: 'insideBottom', offset: -5 } 
  }
  const yAxisProps = { 
    label: { value: valueKey, angle: -90, position: 'insideLeft', offset: 10 } 
  }

  if (useGrouping && groupingSupportedCharts.includes(chartType)) {
    switch (chartType) {
      case 'bar':
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip />
            <Legend />
            {groupCategories.map((cat, i) => (
              <Bar key={cat} dataKey={cat} fill={chartColors[i % chartColors.length]}>
                <LabelList dataKey={cat} position="top" />
              </Bar>
            ))}
          </BarChart>
        )
      case 'horizontalBar':
        return (
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" label={{ value: valueKey, position: 'insideBottom', offset: -5 }} />
            <YAxis type="category" dataKey="name" label={{ value: labelKey, angle: -90, position: 'insideLeft', offset: 10 }} />
            <Tooltip />
            <Legend />
            {groupCategories.map((cat, i) => (
              <Bar key={cat} dataKey={cat} fill={chartColors[i % chartColors.length]}>
                <LabelList dataKey={cat} position="right" />
              </Bar>
            ))}
          </BarChart>
        )
      case 'line':
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip />
            <Legend />
            {groupCategories.map((cat, i) => (
              <Line key={cat} type="monotone" dataKey={cat} stroke={chartColors[i % chartColors.length]} strokeWidth={3} dot={{ r: 5 }}>
                <LabelList dataKey={cat} position="top" />
              </Line>
            ))}
          </LineChart>
        )
      case 'area':
        return (
          <AreaChart data={chartData}>
            <defs>
              {groupCategories.map((cat, i) => (
                <linearGradient key={cat} id={`color${cat}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColors[i % chartColors.length]} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={chartColors[i % chartColors.length]} stopOpacity={0.1} />
                </linearGradient>
              ))}
            </defs>
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip />
            <Legend />
            {groupCategories.map((cat, i) => (
              <Area key={cat} type="monotone" dataKey={cat} stackId="1" stroke={chartColors[i % chartColors.length]} fill={`url(#color${cat})`}>
                <LabelList dataKey={cat} position="top" />
              </Area>
            ))}
          </AreaChart>
        )
      case 'composed':
        return (
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip />
            <Legend />
            {groupCategories.map((cat, i) => (
              <Bar key={`bar-${cat}`} dataKey={cat} fill={chartColors[i % chartColors.length]}>
                <LabelList dataKey={cat} position="top" />
              </Bar>
            ))}
            {groupCategories.map((cat, i) => <Line key={`line-${cat}`} type="monotone" dataKey={cat} stroke={chartColors[(i + 2) % chartColors.length]} strokeWidth={2} />)}
          </ComposedChart>
        )
      default:
        return <div />
    }
  } else {
    switch (chartType) {
      case 'bar':
        return (
          <BarChart data={transformedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip />
            <Bar dataKey="value" fill={chartColors[0]} radius={[10, 10, 0, 0]}>
              <LabelList dataKey="value" position="top" />
            </Bar>
          </BarChart>
        )
      case 'horizontalBar':
        return (
          <BarChart data={transformedData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" label={{ value: valueKey, position: 'insideBottom', offset: -5 }} />
            <YAxis type="category" dataKey="name" label={{ value: labelKey, angle: -90, position: 'insideLeft', offset: 10 }} />
            <Tooltip />
            <Bar dataKey="value" fill={chartColors[0]}>
              <LabelList dataKey="value" position="right" />
            </Bar>
          </BarChart>
        )
      case 'histogram':
        return (
          <BarChart data={histogramData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              label={{ value: `${valueKey} (Bins)`, position: 'insideBottom', offset: -5 }}
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }} />
            <Tooltip 
              formatter={(value, name, props) => [
                `Frequency: ${value}`,
                `Range: ${props.payload?.range || ''}`
              ]}
            />
            <Bar dataKey="value" fill={chartColors[0]} stroke={chartColors[1] || '#8884d8'} strokeWidth={1}>
              <LabelList dataKey="value" position="top" />
            </Bar>
          </BarChart>
        )
      case 'line':
        return (
          <LineChart data={transformedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke={chartColors[0]} strokeWidth={3} dot={{ r: 5 }}>
              <LabelList dataKey="value" position="top" />
            </Line>
          </LineChart>
        )
      case 'area':
        return (
          <AreaChart data={transformedData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColors[0]} stopOpacity={0.8} />
                <stop offset="95%" stopColor={chartColors[0]} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip />
            <Area type="monotone" dataKey="value" stroke={chartColors[0]} fill="url(#colorValue)">
              <LabelList dataKey="value" position="top" />
            </Area>
          </AreaChart>
        )
case 'pie':
  const pieData = usePieAggregate
    ? aggregatePieData(data, labelKey, valueKey)
    : transformedData

  return (
    <PieChart>
      <Tooltip />
      <Legend />
      <Pie
        data={pieData}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={120}
        label={({ name, value, percent }) => {
          if (pieLabelFormat === 'percent') {
            return `${name}: ${value} (${((percent ?? 0) * 100).toFixed(1)}%)`
          } else {
            return `${name}: ${value}`
          }
        }}
      >
        {pieData.map((entry, index) => (
          <Cell
            key={`cell-${index}`}
            fill={chartColors[index % chartColors.length]}
          />
        ))}
      </Pie>
    </PieChart>
  )


      case 'scatter':
        const scatterData = transformedData.map((d, i) => ({ x: i + 1, y: d.value, name: d.name }))
        return (
          <ScatterChart>
            <CartesianGrid />
            <XAxis dataKey="x" name="Index" label={{ value: labelKey, position: 'insideBottom', offset: -5 }} />
            <YAxis dataKey="y" name={valueKey} label={{ value: valueKey, angle: -90, position: 'insideLeft', offset: 10 }} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter data={scatterData} fill={chartColors[0]}>
              <LabelList dataKey="y" position="top" />
            </Scatter>
          </ScatterChart>
        )
      case 'radar':
        return (
          <RadarChart data={transformedData} cx="50%" cy="50%" outerRadius="80%">
            <PolarGrid />
            <PolarAngleAxis dataKey="name" />
            <PolarRadiusAxis />
            <Radar dataKey="value" stroke={chartColors[0]} fill={chartColors[0]} fillOpacity={0.6}>
              <LabelList dataKey="value" position="outside" />
            </Radar>
            <Tooltip />
          </RadarChart>
        )
      case 'composed':
        return (
          <ComposedChart data={transformedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" barSize={20} fill={chartColors[0]}>
              <LabelList dataKey="value" position="top" />
            </Bar>
            <Line type="monotone" dataKey="value" stroke={chartColors[1] || '#ff7300'} />
          </ComposedChart>
        )
      default:
        return <div />
    }
  }
}


  return (
    <>
      <motion.div className="flex flex-col items-center text-center mt-5 font-sans" initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h1 className="text-2xl font-bold mb-5">Langkah 3 dari 4: Visualisasi Data</h1>
      </motion.div>

      <div className="mx-10"><StepProgres currentStep={3} /></div>

      {/* Input Judul & Deskripsi */}
      <div className="mx-10 mb-6">
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <label className="font-semibold">Judul Visualisasi:</label>
            <Input placeholder="Masukkan judul..." value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="font-semibold">Deskripsi Visualisasi:</label>
            <Input.TextArea placeholder="Masukkan deskripsi..." value={description} onChange={(e) => setDescription(e.target.value)} autoSize={{ minRows: 3, maxRows: 5 }} />
          </div>
        </Space>
      </div>

      {/* Pilihan Chart & Label */}
      <div className="mx-10 mb-6">
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <label className="font-semibold mr-2">Pilih Jenis Chart:</label>
            <Select value={chartType} onChange={val => setChartType(val)} style={{ width: 220 }}>
              <Option value="bar">Bar Chart</Option>
              <Option value="horizontalBar">Horizontal Bar Chart</Option>
              <Option value="histogram">Histogram</Option>
              <Option value="line">Line Chart</Option>
              <Option value="pie">Pie Chart</Option>
              <Option value="area">Area Chart</Option>
              <Option value="scatter">Scatter Chart</Option>
              <Option value="radar">Radar Chart</Option>
              <Option value="composed">Composed Chart</Option>
            </Select>
          </div>
          {chartType === 'pie' && (
          <div>
            <label className="font-semibold mr-2">Format Label Pie:</label>
            <Select value={pieLabelFormat} onChange={val => setPieLabelFormat(val)} style={{ width: 200 }}>
              <Option value="percent">Persentase (%)</Option>
              <Option value="value">Nilai Asli</Option>
            </Select>
          </div>
        )}

        {chartType === 'pie' && (
  <div>
    <Checkbox checked={usePieAggregate} onChange={e => setUsePieAggregate(e.target.checked)}>
      <span className="font-semibold">Gabungkan Nilai dengan Label Sama</span>
    </Checkbox>
    <div className="text-sm text-gray-600 mt-1">
      Jika aktif, nilai dari label yang sama akan dijumlahkan jadi satu slice
    </div>
  </div>
)}



          {chartType === 'histogram' && (
            <div>
              <label className="font-semibold mr-2">Jumlah Bins Histogram:</label>
              <Select value={histogramBins} onChange={val => setHistogramBins(val)} style={{ width: 120 }}>
                <Option value={5}>5</Option>
                <Option value={10}>10</Option>
                <Option value={15}>15</Option>
                <Option value={20}>20</Option>
                <Option value={25}>25</Option>
              </Select>
              <div className="text-sm text-gray-600 mt-1">Menentukan jumlah interval untuk histogram</div>
            </div>
          )}

          {groupingSupportedCharts.includes(chartType) && (
            <div>
              <Checkbox checked={useGrouping} onChange={e => setUseGrouping(e.target.checked)}>
                <span className="font-semibold">Aktifkan Pengelompokan Data</span>
              </Checkbox>
              <div className="text-sm text-gray-600 mt-1">Mengelompokkan data berdasarkan kategori untuk perbandingan</div>
            </div>
          )}

          <div>
            <label className="font-semibold mr-2">Pilih Warna Chart:</label>
            <SketchPicker color={chartColors[0]} onChange={(color) => setChartColors([color.hex, ...chartColors.slice(1)])} />
          </div>

          <div>
            <label className="font-semibold mr-2">Kolom Label:</label>
            <Select value={labelKey} onChange={val => setLabelKey(val)} style={{ width: 200 }}>
              {columnNames.map(col => <Option key={col} value={col}>{col}</Option>)}
            </Select>
          </div>

          <div>
            <label className="font-semibold mr-2">Kolom Nilai:</label>
            <Select value={valueKey} onChange={val => setValueKey(val)} style={{ width: 200 }}>
              {columnNames.map(col => <Option key={col} value={col}>{col}</Option>)}
            </Select>
          </div>

          {useGrouping && groupingSupportedCharts.includes(chartType) && (
            <div>
              <label className="font-semibold mr-2">Kolom Pembanding (Group By):</label>
              <Select value={groupKey} onChange={val => setGroupKey(val)} style={{ width: 200 }}>
                <Option value="">-- Pilih Kolom --</Option>
                {columnNames.filter(col => col !== labelKey && col !== valueKey).map(col => <Option key={col} value={col}>{col}</Option>)}
              </Select>
              <div className="text-sm text-gray-600 mt-1">Pilih kolom yang akan digunakan untuk mengelompokkan data</div>
            </div>
          )}
        </Space>
      </div>

      <div className="px-4 sm:px-6 lg:px-10 overflow-x-auto">
        <div style={{ width: '100%', height: 400, minWidth: '600px' }}>
          <ResponsiveContainer width="100%" height="100%">{renderChart()}</ResponsiveContainer>
        </div>
      </div>

      {/* Statistik */}
      {statistics && (
        <div className="bg-white rounded-md p-4 shadow-md mx-10 mt-6">
          <Title level={4}>Analisis Statistik Sederhana</Title>
          <Paragraph>Kolom: <strong>{valueKey}</strong></Paragraph>
          <ul className="list-disc list-inside text-sm">
            <li><strong>Jumlah Data:</strong> {statistics.count}</li>
            <li><strong>Rata-rata:</strong> {statistics.mean}</li>
            <li><strong>Median:</strong> {statistics.median}</li>
            <li><strong>Minimum:</strong> {statistics.min}</li>
            <li><strong>Maksimum:</strong> {statistics.max}</li>
            <li><strong>Standar Deviasi:</strong> {statistics.stdDev}</li>
          </ul>
        </div>
      )}

      <div className="flex justify-center mt-5 mb-5 gap-2">
        <Button
          className='bg-green-400'
          type="primary"
          onClick={async () => {
            try {
              const token = localStorage.getItem("token")
              const userId = localStorage.getItem("user_id")
              const datasetId = localStorage.getItem("selectedFileId")
              if (!token || !userId || !datasetId) {
                showModal("Data Tidak Lengkap", "Data tidak lengkap untuk menyimpan visualisasi")
                return
              }

              const chartConfig = { 
                title, 
                description, 
                labelKey, 
                valueKey, 
                groupKey, 
                useGrouping, 
                chartColors, 
                data,
                histogramBins: chartType === 'histogram' ? histogramBins : undefined
              }

              const res = await fetch("/api/visualization/saveVisualization", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                  dataset_id: datasetId,
                  user_id: userId,
                  chart_type: chartType,
                  chart_config: JSON.stringify(chartConfig)
                }),
              })

              if (!res.ok) throw new Error("Gagal simpan visualisasi")
              showModal("Berhasil", "Visualisasi berhasil disimpan!")
            } catch (err) {
              console.error(err)
              showModal("Error", "Terjadi kesalahan saat menyimpan visualisasi")
            }
          }}
        >
          Simpan Visualisasi
        </Button>
      </div>

      <NextBack nextLink="/EmbededCode" backLink="/CheckData" />

      <Modal
        title={modalTitle}
        open={modalOpen}
        onOk={() => { if (onOkAction) onOkAction(); setModalOpen(false) }}
        onCancel={() => setModalOpen(false)}
        okText="OK"
        cancelText="Tutup"
      >
        {modalContent}
      </Modal>
    </>
  )
}

export default Visualize