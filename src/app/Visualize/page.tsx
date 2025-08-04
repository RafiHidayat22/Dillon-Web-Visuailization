'use client'
import { useMemo } from "react";
import React, { useState, useEffect } from 'react'
import StepProgres from '@/components/StepProgres'
import NextBack from '@/components/NextBack'
import { motion } from 'framer-motion'; 
import { useDataContext } from '../context/DataContext'
import {
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  ResponsiveContainer,
  XAxis, YAxis, Tooltip, Legend,
  AreaChart, Area,
  ScatterChart, Scatter,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts'
import { Input } from 'antd'


import { Select, Typography, Button, Space } from 'antd'

const { Option } = Select
const { Title, Paragraph } = Typography

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']


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

  return {
    mean: mean.toFixed(2),
    min,
    max,
    stdDev: stdDev.toFixed(2),
    median,
    count: numbers.length,
  };
};


const Visualize = () => {
  const { data } = useDataContext()
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')


  const columnNames = useMemo(() => {
  return data.length > 0 ? Object.keys(data[0]) : [];
  }, [data]);

  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'radar'>('bar')
  const [labelKey, setLabelKey] = useState<string>(columnNames[0] || '')
  const [valueKey, setValueKey] = useState<string>(columnNames[1] || '')

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


  const transformedData = data.map((item, index) => ({
    name: item[labelKey] ?? `Row ${index + 1}`,
    value: Number(item[valueKey]) || 0,
  }))

  useEffect(() => {
    if (valueKey && data.length > 0) {
      const stats = getStatistics(data, valueKey);
      setStatistics(stats);
    }
  }, [valueKey, data]);

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
            <Input
              placeholder="Masukkan judul..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
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
            <Select
              value={chartType}
              onChange={(val) => setChartType(val)}
              style={{ width: 200 }}
            >
              <Option value="bar">Bar Chart</Option>
              <Option value="line">Line Chart</Option>
              <Option value="pie">Pie Chart</Option>
              <Option value="area">Area Chart</Option>
              <Option value="scatter">Scatter Chart</Option>
              <Option value="radar">Radar Chart</Option>
            </Select>
          </div>

          <div>
            <label className="font-semibold mr-2">Pilih Kolom Label (X-axis / Nama):</label>
            <Select
              value={labelKey}
              onChange={val => setLabelKey(val)}
              style={{ width: 200 }}
            >
              {columnNames.map(col => (
                <Option key={col} value={col}>
                  {col}
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <label className="font-semibold mr-2">Pilih Kolom Nilai (Y-axis / Value):</label>
            <Select
              value={valueKey}
              onChange={val => setValueKey(val)}
              style={{ width: 200 }}
            >
              {columnNames.map(col => (
                <Option key={col} value={col}>
                  {col}
                </Option>
              ))}
            </Select>
          </div>
        </Space>
      </div>
      
      


      {/* Visualisasi Chart */}
      {/* Judul & Deskripsi Visualisasi */}
      <div className="mx-10 mb-4">
        {title && <Title level={3}>{title}</Title>}
        {description && <Paragraph>{description}</Paragraph>}
      </div>
      <div className="mx-10 " style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={transformedData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          ) : chartType === 'line' ? (
            <LineChart data={transformedData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#82ca9d" />
            </LineChart>
          ) : chartType === 'pie' ? (
            <PieChart>
              <Pie
                data={transformedData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                fill="#8884d8"
                label
              >
                {transformedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          ) : chartType === 'area' ? (
            <AreaChart data={transformedData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" />
            </AreaChart>
          ) : chartType === 'scatter' ? (
            <ScatterChart>
              <XAxis dataKey="name" type="category" />
              <YAxis dataKey="value" />
              <Scatter data={transformedData} fill="#8884d8" />
              <Tooltip />
            </ScatterChart>
          ) : chartType === 'radar' ? (
            <RadarChart data={transformedData} cx="50%" cy="50%" outerRadius="80%">
              <PolarGrid />
              <PolarAngleAxis dataKey="name" />
              <PolarRadiusAxis />
              <Radar dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          ) : (
            <div />
          )}
        </ResponsiveContainer>
      </div>

      {/* Analisis */}
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

      {/* Tombol Query */}
      <div className="mx-10 mt-6">
        <Button type="primary">Query Data</Button>
      </div>

      <NextBack nextLink="/EmededCode" backLink="/CheckData" />
    </>
  )
}

export default Visualize
