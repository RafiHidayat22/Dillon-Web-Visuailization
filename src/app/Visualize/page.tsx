'use client'

import React, { useState, useEffect, useMemo } from 'react'
import StepProgres from '@/components/StepProgres'
import NextBack from '@/components/NextBack'
import { motion } from 'framer-motion'; 
import { useRouter } from 'next/navigation'

import {
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  ResponsiveContainer,
  XAxis, YAxis, Tooltip, Legend,
  AreaChart, Area,
  ScatterChart, Scatter,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ComposedChart, CartesianGrid, Treemap
} from 'recharts'
import { Input } from 'antd'
import { Select, Typography, Button, Space } from 'antd'
import { SketchPicker } from 'react-color'  // 🎨 tambahan untuk color picker

const { Option } = Select
const { Title, Paragraph } = Typography

const defaultColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getStatistics = (data: any[], key: string) => {
  const numbers = data.map((item) => Number(item[key])).filter((val) => !isNaN(val));
  if (numbers.length === 0) return null;
  const mean = numbers.reduce((sum, val) => sum + val, 0) / numbers.length;
  const min = Math.min(...numbers);
  const max = Math.max(...numbers);
  const variance = numbers.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / numbers.length;
  const stdDev = Math.sqrt(variance);
  const median = numbers.sort((a, b) => a - b)[Math.floor(numbers.length / 2)];
  return { mean: mean.toFixed(2), min, max, stdDev: stdDev.toFixed(2), median, count: numbers.length };
};

const dummyData = [
  { name: 'A', value: 10, category: 'X' },
  { name: 'B', value: 20, category: 'Y' },
  { name: 'C', value: 30, category: 'Z' },
]

const Visualize = () => {
  // Kalau mau pakai dummy data, uncomment ini:
  const data = dummyData

  // Kalau sudah ada data dari context, pakai ini:
  // const { data: contextData } = useDataContext()
  // const data = contextData
  const router = useRouter()
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [user, setUser] = useState<{ name: string } | null>(null)

  const columnNames = useMemo(() => {
    return data.length > 0 ? Object.keys(data[0]) : [];
  }, [data]);

  const [chartType, setChartType] = useState<
    'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'radar' | 'composed' | 'treemap'
  >('bar')

  const [labelKey, setLabelKey] = useState<string>(columnNames[0] || '')
  const [valueKey, setValueKey] = useState<string>(columnNames[1] || '')

  const [chartColors, setChartColors] = useState(defaultColors)
    useEffect(() => {
    const token = localStorage.getItem('token')
    const name = localStorage.getItem('name')

    if (!token || !name) {
      router.push('/auth/login') // redirect kalau tidak login
    } else {
      setUser({ name })
    }
  }, [router])
  useEffect(() => {
    if (columnNames.length > 0) {
      setLabelKey(columnNames[0])
      setValueKey(columnNames.length > 1 ? columnNames[1] : columnNames[0])
    }
  }, [columnNames])

  interface Statistics {
    mean: string;
    min: number;
    max: number;
    stdDev: string;
    median: number;
    count: number;
  }
  const [statistics, setStatistics] = useState<Statistics | null>(null);

  // Pakai assertion supaya TS ngerti kita akses key dinamis
  const transformedData = data.map((item, index) => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    name: (item as Record<string, any>)[labelKey] ?? `Row ${index + 1}`,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: Number((item as Record<string, any>)[valueKey]) || 0,
  }))

  useEffect(() => {
    if (valueKey && data.length > 0) {
      const stats = getStatistics(data, valueKey);
      setStatistics(stats);
    }
  }, [valueKey, data]);

  if (!user) return null
  

  return (
    <>
      <motion.div
        className="flex flex-col items-center text-center mt-5 font-sans"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-2xl font-bold mb-5">Langkah 3 dari 4: Visualisasi Data</h1>
      </motion.div>
      <div className="mx-10">
        <StepProgres currentStep={3} />
      </div>

      {/* Input Judul & Deskripsi */}
      <div className="mx-10 mb-6">
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <label className="font-semibold">Judul Visualisasi:</label>
            <Input placeholder="Masukkan judul..." value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="font-semibold">Deskripsi Visualisasi:</label>
            <Input.TextArea
              placeholder="Masukkan deskripsi..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              autoSize={{ minRows: 3, maxRows: 5 }}
            />
          </div>
        </Space>
      </div>

      {/* Pilihan Visualisasi */}
      <div className="mx-10 mb-6">
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <label className="font-semibold mr-2">Pilih Jenis Chart:</label>
            <Select value={chartType} onChange={(val) => setChartType(val)} style={{ width: 220 }}>
              <Option value="bar">Bar Chart</Option>
              <Option value="line">Line Chart</Option>
              <Option value="pie">Pie Chart</Option>
              <Option value="area">Area Chart</Option>
              <Option value="scatter">Scatter Chart</Option>
              <Option value="radar">Radar Chart</Option>
              <Option value="composed">Composed Chart</Option>
              <Option value="treemap">Treemap</Option>
            </Select>
          </div>

          {/* Picker warna */}
          <div>
            <label className="font-semibold mr-2">Pilih Warna Chart:</label>
            <SketchPicker
              color={chartColors[0]}
              onChange={(color) => setChartColors([color.hex, ...chartColors.slice(1)])}
            />
          </div>

          <div>
            <label className="font-semibold mr-2">Kolom Label:</label>
            <Select value={labelKey} onChange={val => setLabelKey(val)} style={{ width: 200 }}>
              {columnNames.map(col => (
                <Option key={col} value={col}>{col}</Option>
              ))}
            </Select>
          </div>
          <div>
            <label className="font-semibold mr-2">Kolom Nilai:</label>
            <Select value={valueKey} onChange={val => setValueKey(val)} style={{ width: 200 }}>
              {columnNames.map(col => (
                <Option key={col} value={col}>{col}</Option>
              ))}
            </Select>
          </div>
        </Space>
      </div>

      {/* Chart */}
      <div className="px-4 sm:px-6 lg:px-10 overflow-x-auto">
        <div style={{ width: '100%', height: 400, minWidth: '600px' }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={transformedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill={chartColors[0]} radius={[10, 10, 0, 0]} />
              </BarChart>
            ) : chartType === 'line' ? (
              <LineChart data={transformedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke={chartColors[0]} strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            ) : chartType === 'pie' ? (
              <PieChart>
                <Pie data={transformedData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
                  {transformedData.map((_, i) => (
                    <Cell key={i} fill={chartColors[i % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            ) : chartType === 'area' ? (
              <AreaChart data={transformedData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors[0]} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={chartColors[0]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke={chartColors[0]} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            ) : chartType === 'scatter' ? (
              <ScatterChart>
                <CartesianGrid />
                <XAxis dataKey="name" type="category" />
                <YAxis dataKey="value" />
                <Tooltip />
                <Scatter data={transformedData} fill={chartColors[0]} />
              </ScatterChart>
            ) : chartType === 'radar' ? (
              <RadarChart data={transformedData} cx="50%" cy="50%" outerRadius="80%">
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis />
                <Radar dataKey="value" stroke={chartColors[0]} fill={chartColors[0]} fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            ) : chartType === 'composed' ? (
              <ComposedChart data={transformedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" barSize={20} fill={chartColors[0]} />
                <Line type="monotone" dataKey="value" stroke={chartColors[1] || '#ff7300'} />
              </ComposedChart>
            ) : chartType === 'treemap' ? (
              <Treemap data={transformedData} dataKey="value" stroke="#fff" fill={chartColors[0]} />
            ) : <div />}
          </ResponsiveContainer>
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

      <div className="flex justify-center mt-5 mb-5">
        <Button type="primary">Query Data</Button>
      </div>
      <NextBack nextLink="/EmbededCode" backLink="/CheckData" />
    </>
  )
}

export default Visualize
