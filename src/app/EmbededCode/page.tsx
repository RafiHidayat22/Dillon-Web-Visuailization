
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import NextBack from '@/components/NextBack'
import { motion } from 'framer-motion'
import StepProgres from '@/components/StepProgres'
import { useRouter } from "next/navigation"
import * as htmlToImage from 'html-to-image'
import { Modal, Radio } from 'antd'

import {
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter,
  ResponsiveContainer,
  XAxis, YAxis, Tooltip, Legend,
  CartesianGrid,
  ComposedChart,
  LabelList,
  Treemap
} from 'recharts'
import { Button, Typography, Select } from 'antd'

const { Title, Paragraph } = Typography
const { Option } = Select
const defaultColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c']

const Page = () => {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string } | null>(null)
  const [visualizations, setVisualizations] = useState<any[]>([])
  const [selectedVis, setSelectedVis] = useState<any>(null)
  const chartRef = useRef<HTMLDivElement>(null)

const [summary, setSummary] = useState<string>("")
const [loadingSummary, setLoadingSummary] = useState(false)
const [userPrompt, setUserPrompt] = useState("")
const [chatHistory, setChatHistory] = useState<{ role: "user" | "ai"; content: string }[]>([])
const [summaryCache, setSummaryCache] = useState<{ [key: string]: string }>({})

const [isDownloadModalVisible, setIsDownloadModalVisible] = useState(false)
const [backgroundType, setBackgroundType] = useState('transparent')
const [customColor, setCustomColor] = useState('#ffffff')
const [downloading, setDownloading] = useState(false)
const [pieLabelFormat, setPieLabelFormat] = useState<'percent' | 'degree' | 'value'>('percent')
const [usePieAggregate, setUsePieAggregate] = useState(true)


  useEffect(() => {
    const token = localStorage.getItem('token')
    const name = localStorage.getItem('name')
    const datasetId = localStorage.getItem('selectedFileId')

    if (!token || !name) {
      router.push('/auth/login')
      return
    } else {
      setUser({ name })
    }

    if (!datasetId) return

    const fetchVisualization = async () => {
      try {
        const res = await fetch(`/api/embeded?dataset_id=${datasetId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (res.ok && data.visualizations?.length > 0) {
          setVisualizations(data.visualizations)
          setSelectedVis(data.visualizations[data.visualizations.length - 1])
        }
      } catch (err) {
        console.error("Gagal fetch visualisasi:", err)
      }
    }

    fetchVisualization()
  }, [router])

  

  

  const sanitizeColorsRecursive = (obj: any): any => {
    if (obj == null) return obj
    if (typeof obj === 'string') {
      if (obj.startsWith('oklch(')) return defaultColors[0]
      return obj
    }
    if (Array.isArray(obj)) return obj.map(sanitizeColorsRecursive)

    const sanitized: any = {}
    for (const key in obj) {
      sanitized[key] = sanitizeColorsRecursive(obj[key])
    }
    return sanitized
  }

  const chartConfig = useMemo(() => {
    if (!selectedVis) return null
    try {
      const parsed = JSON.parse(selectedVis.chart_config)
      const safeConfig = sanitizeColorsRecursive(parsed)

      if (!safeConfig.data || !Array.isArray(safeConfig.data) || safeConfig.data.length === 0) {
        const labelKey = safeConfig.labelKey ?? 'Label'
        const valueKey = safeConfig.valueKey ?? 'Value'
        safeConfig.data = [{ [labelKey]: 'Sample', [valueKey]: 0 }]
      }

      return safeConfig
    } catch (error) {
      console.error('Error parsing chart config:', error)
      return null
    }
  }, [selectedVis])

  // Enhanced data processing for grouping support (same as Visualize)
useEffect(() => {
  if (!chartConfig) return

  if (chartConfig.pieLabelFormat) setPieLabelFormat(chartConfig.pieLabelFormat)
  if (chartConfig.usePieAggregate !== undefined) setUsePieAggregate(chartConfig.usePieAggregate)
}, [chartConfig])

const chartData = useMemo(() => {
  if (!chartConfig || !chartConfig.data || chartConfig.data.length === 0) return []
  
  const data = chartConfig.data
  const labelKey = chartConfig.labelKey
  const valueKey = chartConfig.valueKey
  const groupKey = chartConfig.groupKey
  const useGrouping = chartConfig.useGrouping

  // ✅ khusus pie chart → agregasi berdasarkan label
  if (selectedVis?.chart_type === "pie" && labelKey && valueKey) {
    const aggregated = data.reduce((acc: any, item: any) => {
      const label = item[labelKey] ?? "Unknown"
      const value = Number(item[valueKey]) || 0
      if (!acc[label]) {
        acc[label] = { name: label, value: 0 }
      }
      acc[label].value += value
      return acc
    }, {})
    return Object.values(aggregated)
  }

  // ✅ untuk chart grouping (bar/line/area/composed)
  if (useGrouping && groupKey && labelKey && valueKey && data.some((item: any) => item[groupKey] !== undefined)) {
    const groupedData = data.reduce((acc: any, item: any) => {
      const labelValue = item[labelKey]
      const groupValue = item[groupKey]
      const value = Number(item[valueKey]) || 0
      
      if (!acc[labelValue]) {
        acc[labelValue] = { name: labelValue }
      }
      acc[labelValue][groupValue] = value
      return acc
    }, {})
    
    return Object.values(groupedData)
  }

  // ✅ default (chart lain biasa)
  return data.map((item: any, index: number) => ({
    name: item[labelKey] ?? `Row ${index + 1}`,
    value: Number(item[valueKey]) || 0
  }))
}, [chartConfig, selectedVis])


  const seriesKeys = useMemo(() => {
    if (!chartData || chartData.length === 0) return []
    
    if (chartConfig?.useGrouping && chartConfig?.groupKey) {
      const uniqueGroups = new Set()
      chartConfig.data?.forEach((item: any) => {
        if (item[chartConfig.groupKey]) {
          uniqueGroups.add(item[chartConfig.groupKey])
        }
      })
      return Array.from(uniqueGroups) as string[]
    }
    
    const firstItem = chartData[0]
    const keys = Object.keys(firstItem).filter(key => 
      key !== 'name' && 
      key !== chartConfig?.labelKey &&
      typeof firstItem[key] === 'number'
    )
    
    return keys
  }, [chartData, chartConfig])

  // 🟢 Call API summary dengan simpan cache
const fetchSummary = async (customPrompt?: string) => {
  if (!chartData || chartData.length === 0) return
  setLoadingSummary(true)

  const xLabel = chartConfig?.xAxisLabel || chartConfig?.labelKey || "X"
  const yLabel = chartConfig?.yAxisLabel || chartConfig?.valueKey || "Y"

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chartData,
        chartType: selectedVis?.chart_type,
        userPrompt: customPrompt || null,
        xAxisLabel: xLabel,
        yAxisLabel: yLabel,
      }),
    })
    const data = await res.json()
    if (res.ok) {
      setSummary(data.summary)

      // ✅ simpan ke cache kalau auto summary (bukan pertanyaan manual)
      if (!customPrompt && selectedVis?.id) {
        setSummaryCache((prev) => ({
          ...prev,
          [selectedVis.id]: data.summary,
        }))
      }

      // ✅ histori chat
      setChatHistory((prev) => [
        ...prev,
        { role: "user", content: customPrompt || "Ringkas data ini" },
        { role: "ai", content: data.summary },
      ])
    } else {
      setSummary("Gagal mendapatkan ringkasan.")
    }
  } catch (err) {
    console.error(err)
    setSummary("Terjadi error saat meminta ringkasan.")
  } finally {
    setLoadingSummary(false)
  }
}

useEffect(() => {
  if (!chartData.length || !selectedVis?.id) return

  if (summaryCache[selectedVis.id]) {
    // ✅ pakai cache
    setSummary(summaryCache[selectedVis.id])
  } else {
    // ✅ fetch baru
    fetchSummary()
  }
}, [chartData, selectedVis])



  const groupingSupportedCharts = ['bar', 'line', 'area', 'composed']

  if (!user) return null

const handleDownloadWithOptions = async () => {
  if (!chartRef.current) return
  
  setDownloading(true)
  
  let backgroundColor = 'transparent'
  
  if (backgroundType === 'white') {
    backgroundColor = '#ffffff'
  } else if (backgroundType === 'custom') {
    backgroundColor = customColor
  }

  try {
    // 🔥 SOLUSI SIMPEL: Tunggu 1 detik biar label muncul dulu
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const dataUrl = await htmlToImage.toPng(chartRef.current, { 
      cacheBust: false, // Matikan cache bust
      backgroundColor: backgroundColor,
      pixelRatio: 2,
      quality: 1,
      style: {
        backgroundColor: backgroundColor
      },
    })
    
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `${chartConfig?.title || 'visualization'}.png`
    link.click()
    
    setIsDownloadModalVisible(false)
  } catch (err) {
    console.error('Gagal download chart:', err)
  } finally {
    setDownloading(false)
  }
}



const createHistogramData = (data: any[], valueKey: string, binCount: number = 10) => {
  const numbers = data.map(item => Number(item[valueKey])).filter(val => !isNaN(val))
  if (numbers.length === 0) return []

  const min = Math.min(...numbers)
  const max = Math.max(...numbers)
  const binWidth = (max - min) / binCount

  return Array.from({ length: binCount }, (_, i) => {
    const binStart = min + i * binWidth
    const binEnd = min + (i + 1) * binWidth
    const count = numbers.filter(val => val >= binStart && (i === binCount - 1 ? val <= binEnd : val < binEnd)).length
    return {
      name: `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`,
      value: count,
    }
  })
}




const renderChart = () => {
  if (!selectedVis?.chart_type || chartData.length === 0) {
    return <p className="text-gray-500">Preview visualisasi akan ditampilkan di sini...</p>
  }

  const useGrouping = chartConfig?.useGrouping
  const chartColors = chartConfig?.chartColors || defaultColors
const xLabel = chartConfig?.xAxisLabel || chartConfig?.labelKey || ''
const yLabel = chartConfig?.yAxisLabel || chartConfig?.valueKey || ''


  if (useGrouping && groupingSupportedCharts.includes(selectedVis.chart_type)) {
    // Render grouped charts
    switch (selectedVis.chart_type) {
      case 'bar':
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              label={{ value: xLabel, position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: 10 }}
            />
            <Tooltip />
            {seriesKeys.map((key, index) => (
              <Bar 
                key={key}
                dataKey={key} 
                fill={chartColors[index % chartColors.length]} 
                radius={[4, 4, 0, 0]}
                name={key}
              >
                <LabelList dataKey={key} position="top" />
              </Bar>
            ))}
          </BarChart>
        )
      case 'line':
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              label={{ value: xLabel, position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: 10 }}
            />
            <Tooltip />
            <Legend />
            {seriesKeys.map((key, index) => (
              <Line 
                key={key}
                type="monotone" 
                dataKey={key} 
                stroke={chartColors[index % chartColors.length]} 
                strokeWidth={3} 
                dot={{ r: 5 }}
                name={key}
              >
                <LabelList dataKey={key} position="top" />
              </Line>
            ))}
          </LineChart>
        )
      case 'area':
        return (
          <AreaChart data={chartData}>
            <defs>
              {seriesKeys.map((key, index) => (
                <linearGradient key={key} id={`color${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColors[index % chartColors.length]} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={chartColors[index % chartColors.length]} stopOpacity={0.1} />
                </linearGradient>
              ))}
            </defs>
            <XAxis 
              dataKey="name" 
              label={{ value: xLabel, position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: 10 }}
            />
            <Tooltip />
            <Legend />
            {seriesKeys.map((key, index) => (
              <Area 
                key={key}
                type="monotone" 
                dataKey={key} 
                stackId="1"
                stroke={chartColors[index % chartColors.length]} 
                fill={`url(#color${key})`} 
                name={key}
              >
                <LabelList dataKey={key} position="top" />
              </Area>
            ))}
          </AreaChart>
        )
      case 'composed':
        return (
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              label={{ value: xLabel, position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: 10 }}
            />
            <Tooltip />
            <Legend />
            {seriesKeys.map((key, index) => (
              <Bar key={`bar-${key}`} dataKey={key} fill={chartColors[index % chartColors.length]} name={key}>
                <LabelList dataKey={key} position="top" />
              </Bar>
            ))}
            {seriesKeys.map((key, index) => (
              <Line 
                key={`line-${key}`} 
                type="monotone" 
                dataKey={key} 
                stroke={chartColors[(index + 2) % chartColors.length]} 
                strokeWidth={2}
                name={key}
              />
            ))}
          </ComposedChart>
        )
         case 'horizontalBar':
        return (
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" label={{ value: yLabel, position: 'insideBottom' }} />
            <YAxis type="category" dataKey="name" label={{ value: xLabel, angle: 0, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            {seriesKeys.map((key, index) => (
              <Bar key={key} dataKey={key} fill={chartColors[index % chartColors.length]}>
                <LabelList dataKey={key} position="right" />
              </Bar>
            ))}
          </BarChart>
        )
      default:
        return <div />
    }
  } else {
    // Regular charts
    switch (selectedVis.chart_type) {
      case 'bar':
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              label={{ value: xLabel, position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: 10 }}
            />
            <Tooltip />
            <Bar dataKey="value" fill={chartColors[0]} radius={[10, 10, 0, 0]}>
              <LabelList dataKey="value" position="top" />
            </Bar>
          </BarChart>
        )
      case 'line':
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              label={{ value: xLabel, position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: 10 }}
            />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke={chartColors[0]} strokeWidth={3} dot={{ r: 5 }}>
              <LabelList dataKey="value" position="top" />
            </Line>
          </LineChart>
        )
      case 'area':
        return (
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColors[0]} stopOpacity={0.8} />
                <stop offset="95%" stopColor={chartColors[0]} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="name" 
              label={{ value: xLabel, position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: 10 }}
            />
            <Tooltip />
            <Area type="monotone" dataKey="value" stroke={chartColors[0]} fillOpacity={1} fill="url(#colorValue)">
              <LabelList dataKey="value" position="top" />
            </Area>
          </AreaChart>
        )
      case 'scatter':
        return (
          <ScatterChart>
            <CartesianGrid />
            <XAxis dataKey="name" type="category" label={{ value: xLabel, position: 'insideBottom', offset: -5 }} />
            <YAxis dataKey="value" label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: 10 }} />
            <Tooltip />
            <Scatter data={chartData} fill={chartColors[0]}>
              <LabelList dataKey="value" position="top" />
            </Scatter>
          </ScatterChart>
        )
      case 'radar':
        return (
          <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="80%">
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
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              label={{ value: xLabel, position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: 10 }}
            />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" barSize={20} fill={chartColors[0]}>
              <LabelList dataKey="value" position="top" />
            </Bar>
            <Line type="monotone" dataKey="value" stroke={chartColors[1] || '#ff7300'} />
          </ComposedChart>
        )
      case 'treemap':
        return (
          <Treemap data={chartData} dataKey="value" stroke="#fff" fill={chartColors[0]} />
        )
case 'pie':
  const pieData = usePieAggregate
    ? chartData.reduce((acc: any, item: any) => {
        const label = item.name ?? 'Unknown'
        const value = Number(item.value) || 0
        const exist = acc.find((x: any) => x.name === label)
        if (exist) {
          exist.value += value
        } else {
          acc.push({ name: label, value })
        }
        return acc
      }, [])
    : chartData

  return (
    <PieChart>
      <Pie 
        data={pieData} 
        dataKey="value" 
        nameKey="name" 
        cx="50%"
        cy="50%"
        outerRadius={120} 
        label={({ name, value, percent }) => {
          if (pieLabelFormat === 'percent') return `${name}: ${value} (${((percent ?? 0) * 100).toFixed(1)}%)`
          if (pieLabelFormat === 'degree') return `${name}: ${value} (${((percent ?? 0) * 360).toFixed(1)}°)`
          return `${name}: ${value}`
        }}
      >
        {pieData.map((entry: any, index: number) => (
          <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  )

        
      case 'horizontalBar':
        return (
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" label={{ value: yLabel, position: 'insideBottom' }} />
            <YAxis type="category" dataKey="name" label={{ value: xLabel, angle: 0, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill={chartColors[0]}>
              <LabelList dataKey="value" position="right" />
            </Bar>
          </BarChart>
        )

case 'histogram': {
const histogramData = chartData

  return (
    <BarChart data={histogramData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" label={{ value: chartConfig?.valueKey || "Value", position: 'insideBottom' }} />
      <YAxis label={{ value: "Frequency", angle: -90, position: 'insideLeft' }} />
      <Tooltip />
      <Legend />
      <Bar dataKey="value" fill={chartColors[0]}>
        <LabelList dataKey="value" position="top" />
      </Bar>
    </BarChart>
  )
}

      default:
        return <p className="text-gray-500">Chart type {selectedVis?.chart_type} belum ada implementasi.</p>
    }
  }
}


  return (
    <>
      <motion.div className="flex flex-col items-center text-center mt-5 font-sans"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-2xl font-bold mb-5">Langkah 4 dari 4: Preview</h1>
      </motion.div>

      <div className="mx-4 sm:mx-10 overflow-x-auto">
        <StepProgres currentStep={4} />
      </div>

      <div className="mx-4 sm:mx-10 mt-4 flex justify-end">
        <Select
          value={selectedVis?.id}
          className="w-full sm:w-64"
          onChange={(val) => {
            const found = visualizations.find((v) => v.id === val)
            setSelectedVis(found || null)
          }}
        >
          {visualizations.map((vis) => {
            let cfg: any = {}
            try { cfg = JSON.parse(vis.chart_config) } catch {}
            return (
              <Option key={vis.id} value={vis.id}>
                {cfg?.title || `Visualisasi ${vis.id.slice(0, 6)}`}
              </Option>
            )
          })}
        </Select>
      </div>

      <div className="mx-4 sm:mx-10 mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          ref={chartRef}
          className="col-span-1 md:col-span-2 bg-white shadow-md rounded-2xl p-5 border border-gray-200"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Title level={4}>{chartConfig?.title || 'Judul Visualisasi'}</Title>
          <Paragraph>{chartConfig?.description || 'Deskripsi visualisasi'}</Paragraph>

          <div style={{ width: '100%', minHeight: 400 }}>
            <ResponsiveContainer width="100%" height={400}>
              {renderChart()}
            </ResponsiveContainer>
          </div>
        </motion.div>
        
        {/* 🟢 Panel AI Ringkasan */}
<div className="bg-white shadow-md rounded-2xl p-5 border border-gray-200">
  <Title level={5}>AI Ringkasan</Title>

  {/* ✅ Histori Chat */}
  <div className="max-h-64 overflow-y-auto border p-3 rounded-lg bg-gray-50 mb-3">
    {chatHistory.length === 0 && (
      <Paragraph className="text-gray-500">Belum ada ringkasan.</Paragraph>
    )}
    {chatHistory.map((chat, idx) => (
      <div
        key={idx}
        className={`mb-2 ${chat.role === "user" ? "text-right" : "text-left"}`}
      >
        <span
          className={`inline-block px-3 py-2 rounded-lg ${
            chat.role === "user"
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          {chat.content}
        </span>
      </div>
    ))}
    {loadingSummary && <Paragraph>Sedang menganalisis...</Paragraph>}
  </div>

  {/* Input pertanyaan */}
  <div className="flex gap-2 mt-4">
    <input
      type="text"
      placeholder="Tanya tentang visualisasi..."
      value={userPrompt}
      onChange={(e) => setUserPrompt(e.target.value)}
      className="flex-1 border rounded-lg px-3 py-2"
    />
    <Button
      type="primary"
      onClick={() => {
        if (userPrompt.trim()) {
          fetchSummary(userPrompt)
          setUserPrompt("") // ✅ reset input setelah klik Tanya
        }
      }}
    >
      Tanya
    </Button>
  </div>
</div>

      </div>

      <div className="mx-4 sm:mx-10 mt-6 flex justify-end">
        <Button 
          type="primary" 
          onClick={() => setIsDownloadModalVisible(true)}
          size="large"
        >
          Download Hasil Visualisasi
        </Button>
      </div>

      <div className="mx-4 sm:mx-10 mt-10">
        <NextBack nextLink="" backLink="/Visualize" />
      </div>

      <Modal
  title="Pilihan Download"
  open={isDownloadModalVisible}
  onOk={handleDownloadWithOptions}
  onCancel={() => setIsDownloadModalVisible(false)}
  confirmLoading={downloading}
  okText="Download PNG"
  cancelText="Batal"
  width={400}
>
  <div className="space-y-4">
    <Title level={5}>Background Color:</Title>
    
    <Radio.Group 
      value={backgroundType} 
      onChange={(e) => setBackgroundType(e.target.value)}
      className="w-full"
    >
      <div className="space-y-3">
        <div className="flex items-center">
          <Radio value="transparent">
            <span className="ml-2">Transparan</span>
          </Radio>
        </div>
        
        <div className="flex items-center">
          <Radio value="white">
            <span className="ml-2">Putih</span>
          </Radio>
        </div>
        
        <div className="flex items-center">
          <Radio value="custom">
            <span className="ml-2">Custom Color</span>
          </Radio>
        </div>
      </div>
    </Radio.Group>

    {backgroundType === 'custom' && (
      <div className="mt-4 p-4 border rounded-lg bg-gray-50">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Pilih Warna:</span>
          <input
            type="color"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            className="w-12 h-8 rounded border cursor-pointer"
          />
          <span className="text-sm text-gray-600">{customColor}</span>
        </div>
      </div>
    )}

    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
      <div className="text-sm text-blue-700">
        <strong>Preview:</strong>
        <div 
          className="mt-2 w-full h-8 border-2 border-dashed border-blue-300 rounded flex items-center justify-center text-xs"
          style={{ 
            backgroundColor: backgroundType === 'transparent' ? 'transparent' : 
                           backgroundType === 'white' ? '#ffffff' : customColor,
            backgroundImage: backgroundType === 'transparent' ? 
              'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' : 'none',
            backgroundSize: backgroundType === 'transparent' ? '8px 8px' : 'auto',
            backgroundPosition: backgroundType === 'transparent' ? '0 0, 0 4px, 4px -4px, -4px 0px' : 'auto'
          }}
        >
          {backgroundType === 'transparent' ? 'Transparan' : 'Background Color'}
        </div>
      </div>
    </div>
  </div>
</Modal>
    </>
  )
}

export default Page
