'use client';

import React from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { motion } from 'framer-motion';

interface DataRow {
  [key: string]: string | number | null | undefined;
}

interface DescribeTableProps {
  data: DataRow[];
  onCellChange?: (rowIndex: number, key: string, value: string) => void;
  editingColumn?: string | null;
  onStartEditingColumn?: (colName: string) => void;
  onColumnNameChange?: (val: string) => void;
  onColumnNameSave?: (oldName: string) => void;
  tempColumnEdit?: string;
  onColumnNameTyping?: (oldName: string, newName: string) => void;
}

const getCellType = (value: string | number | null | undefined): string => {
  if (value === '' || value === null || value === undefined || value === '–') return 'missing';
  if (!isNaN(Number(value))) return 'number';
  if (/\d{4}-\d{2}-\d{2}/.test(String(value))) return 'date';
  return 'text';
};

const columnIndexToLetter = (index: number): string => {
  let letter = '';
  while (index >= 0) {
    letter = String.fromCharCode((index % 26) + 65) + letter;
    index = Math.floor(index / 26) - 1;
  }
  return letter;
};

const DescribeTable: React.FC<DescribeTableProps> = ({
  data,
  onCellChange,
  editingColumn,
  onStartEditingColumn,
  onColumnNameChange,
  onColumnNameSave,
  tempColumnEdit,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onColumnNameTyping,
}) => {
  if (!data || data.length === 0) return null;

  const headers = Object.keys(data[0]);

  const columns: ColumnsType<DataRow> = [
    {
      title: <div>No</div>,
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
{editingColumn === key ? (
  <input
    type="text"
    value={tempColumnEdit ?? key}
    onChange={(e) => {
      const val = e.target.value;
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      onColumnNameChange && onColumnNameChange(val); // update tempColumnEdit saja
    }}
    onBlur={() => onColumnNameSave && onColumnNameSave(key)} // update tableData saat blur
    onKeyDown={(e) => e.key === 'Enter' && onColumnNameSave && onColumnNameSave(key)}
    style={{ width: '80%', textAlign: 'center' }}
    autoFocus
  />
) : (
  <div
    style={{ cursor: 'pointer', minWidth: '40px' }}
    onClick={() => onStartEditingColumn && onStartEditingColumn(key)}
  >
    {key}
  </div>
)}

        </div>
      ),
      dataIndex: key,
      key,
      render: (value: string | number | null | undefined, record: DataRow, rowIndex: number) => {
        const val = value === '' ? '–' : value;
        const type = getCellType(val);
        const colorMap: Record<string, string> = {
          number: 'blue',
          date: 'green',
          text: 'black',
          missing: 'red',
        };

        return (
          <input
            type="text"
            value={value ?? ''}
            onChange={(e) => onCellChange?.(rowIndex, key, e.target.value)}
            style={{
              width: '100%',
              border: 'none',
              background: 'transparent',
              color: colorMap[type],
              fontWeight: type === 'missing' ? 'bold' : 'normal',
              fontStyle: type === 'missing' ? 'italic' : 'normal',
            }}
          />
        );
      },
    })),
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
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
