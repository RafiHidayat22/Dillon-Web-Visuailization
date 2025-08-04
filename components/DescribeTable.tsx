'use client';

import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { motion } from 'framer-motion';

interface DataRow {
  [key: string]: string | number | null | undefined;
}

interface DescribeTableProps {
  data: DataRow[];
}

const getCellType = (value: string | number | null | undefined): string => {
  if (value === '' || value === null || value === undefined || value === '–') return 'missing';
  if (!isNaN(Number(value))) return 'number';
  if (/\d{4}-\d{2}-\d{2}/.test(String(value))) return 'date';
  return 'text';
};

// Fungsi ubah index ke huruf 
const columnIndexToLetter = (index: number): string => {
  let letter = '';
  while (index >= 0) {
    letter = String.fromCharCode((index % 26) + 65) + letter;
    index = Math.floor(index / 26) - 1;
  }
  return letter;
};

const DescribeTable = ({ data }: DescribeTableProps) => {
  if (!data || data.length === 0) return null;

  const headers = Object.keys(data[0]);

  // Buat 2 baris header: baris pertama huruf
  const columns: ColumnsType<DataRow> = [
    {
      title: (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div>No</div>
        </div>
      ),
      dataIndex: 'no',
      key: 'no',
      width: 60,
      fixed: 'left',
      render: (_, __, index) => index + 1,
    },
    ...headers.map((key, idx) => ({
      title: (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontWeight: 'bold' }}>{columnIndexToLetter(idx)}</div>
          <div>{key}</div>
        </div>
      ),
      dataIndex: key,
      key,
      render: (value: string | number | null | undefined) => {
        const val = value === '' ? '–' : value;
        const type = getCellType(val);
        const colorMap: Record<string, string> = {
          number: 'blue',
          date: 'green',
          text: 'black',
          missing: 'red',
        };

        return (
          <span
            style={{
              color: colorMap[type],
              fontWeight: type === 'missing' ? 'bold' : 'normal',
              fontStyle: type === 'missing' ? 'italic' : 'normal',
            }}
          >
            {val}
          </span>
        );
      },
    })),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
    <Table
    dataSource={data}
    columns={columns}
    bordered
    className="excel-table"
    rowKey={(_, index) => index?.toString() ?? ''}
    scroll={{ x: 'max-content' }}
    pagination={false}
    />
    </motion.div>
  );
};

export default DescribeTable;
