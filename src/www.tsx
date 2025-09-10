/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import NextBack from '@/components/NextBack'
import { motion } from 'framer-motion'
import StepProgres from '@/components/StepProgres'
import { useRouter } from "next/navigation"
import * as htmlToImage from 'html-to-image'

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
  const chartData = useMemo(() => {
    if (!chartConfig || !chartConfig.data || chartConfig.data.length === 0) return []
    
    const data = chartConfig.data
    const labelKey = chartConfig.labelKey
    const valueKey = chartConfig.valueKey
    const groupKey = chartConfig.groupKey
    const useGrouping = chartConfig.useGrouping

    // If it's a grouped visualization
    if (useGrouping && groupKey && labelKey && valueKey && data.some((item: { [x: string]: undefined }) => item[groupKey] !== undefined)) {
      console.log('Processing grouped data') // Debug log
      
      // Group data by labelKey and create series for each groupKey value
      const groupedData = data.reduce((acc: any, item: any) => {
        const labelValue = item[labelKey] // e.g., "Jakarta"
        const groupValue = item[groupKey] // e.g., "Produk A"
        const value = Number(item[valueKey]) || 0 // e.g., 120
        
        if (!acc[labelValue]) {
          acc[labelValue] = { name: labelValue }
        }
        
        // Add value for each group as a separate series
        acc[labelValue][groupValue] = value
        
        return acc
      }, {})
      
      const result = Object.values(groupedData)
      console.log('Grouped result:', result) // Debug log
      return result
    }
    
    // Standard single-series data processing
    return data.map((item: any, index: number) => ({
      name: item[labelKey] ?? `Row ${index + 1}`,
      value: Number(item[valueKey]) || 0
    }))
  }, [chartConfig])

  // Get all series keys for multi-series charts (same as Visualize)
  const seriesKeys = useMemo(() => {
    if (!chartData || chartData.length === 0) return []
    
    // For grouped data, get all unique group values as series
    if (chartConfig?.useGrouping && chartConfig?.groupKey) {
      const uniqueGroups = new Set()
      chartConfig.data?.forEach((item: any) => {
        if (item[chartConfig.groupKey]) {
          uniqueGroups.add(item[chartConfig.groupKey])
        }
      })
      const groups = Array.from(uniqueGroups) as string[]
      console.log('Series keys from groups:', groups) // Debug log
      return groups
    }
    
    // For regular multi-series, get numeric keys excluding 'name'
    const firstItem = chartData[0]
    const keys = Object.keys(firstItem).filter(key => 
      key !== 'name' && 
      key !== chartConfig?.labelKey &&
      typeof firstItem[key] === 'number'
    )
    
    console.log('Series keys from data:', keys) // Debug log
    return keys
  }, [chartData, chartConfig])

  const groupingSupportedCharts = ['bar', 'line', 'area', 'composed']

  if (!user) return null

  const handleDownloadPNG = () => {
    if (!chartRef.current) return
    htmlToImage.toPng(chartRef.current, { cacheBust: true })
      .then((dataUrl) => {
        const link = document.createElement('a')
        link.href = dataUrl
        link.download = `${chartConfig?.title || 'visualization'}.png`
        link.click()
      })
      .catch((err) => console.error('Gagal download chart:', err))
  }

  const renderChart = () => {
    if (!selectedVis?.chart_type || chartData.length === 0) {
      return <p className="text-gray-500">Preview visualisasi akan ditampilkan di sini...</p>
    }

    const useGrouping = chartConfig?.useGrouping
    const chartColors = chartConfig?.chartColors || defaultColors

    if (useGrouping && groupingSupportedCharts.includes(selectedVis.chart_type)) {
      // Render grouped charts (same as Visualize page)
      switch (selectedVis.chart_type) {
        case 'bar':
          return (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
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
              <XAxis dataKey="name" />
              <YAxis />
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
              <XAxis dataKey="name" />
              <YAxis />
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
              <XAxis dataKey="name" />
              <YAxis />
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
        default:
          return <div />
      }
    } else {
      // Render regular charts (same as Visualize page)
      switch (selectedVis.chart_type) {
        case 'bar':
          return (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill={chartColors[0]} radius={[10, 10, 0, 0]}>
                <LabelList dataKey="value" position="top" />
              </Bar>
            </BarChart>
          )
        case 'line':
          return (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke={chartColors[0]} strokeWidth={3} dot={{ r: 5 }}>
                <LabelList dataKey="value" position="top" />
              </Line>
            </LineChart>
          )
        case 'pie':
          return (
            <PieChart>
              <Pie 
                data={chartData} 
                dataKey="value" 
                nameKey="name" 
                cx="50%"
                cy="50%"
                outerRadius={120} 
                label={(entry) => `${entry.name}: ${entry.value}`}
              >
                {chartData.map((entry: any, index: number) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={chartColors[index % chartColors.length]} 
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
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
              <XAxis dataKey="name" />
              <YAxis />
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
              <XAxis dataKey="name" type="category" />
              <YAxis dataKey="value" />
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
              <XAxis dataKey="name" />
              <YAxis />
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
        
        <div className="flex justify-end mt-4">
          <Button type="primary" onClick={handleDownloadPNG}>
            Download Hasil Visualisasi
          </Button>
        </div>
      </div>

      <div className="mx-4 sm:mx-10 mt-10">
        <NextBack nextLink="" backLink="/Visualize" />
      </div>
    </>
  )
}

export default Page