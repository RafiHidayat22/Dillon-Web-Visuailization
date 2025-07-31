'use client'

import React, { useState } from 'react';
import StepProgres from '@/components/StepProgres';
import NextBack from '@/components/NextBack';

const sampleData = [
  { nama: 'Andi', umur: 21, tanggalLahir: '2003-02-21' },
  { nama: '', umur: '', tanggalLahir: '' },
  { nama: 'Budi', umur: 19, tanggalLahir: '2005-06-11' },
  { nama: 'Andi', umur: 21, tanggalLahir: '2003-02-21' },
  { nama: 'Andi', umur: 21, tanggalLahir: '2003-02-21' },
  { nama: 'Andi', umur: 21, tanggalLahir: '2003-02-21' },
  { nama: 'Andi', umur: 21, tanggalLahir: '2003-02-21' },
  { nama: 'Andi', umur: 21, tanggalLahir: '2003-02-21' },
  { nama: 'Andi', umur: 21, tanggalLahir: '2003-02-21' },
];

const getCellType = (value: string | number | null | undefined): string => {
  if (value === '' || value === null || value === undefined || value === '–') return 'missing';
  if (!isNaN(Number(value))) return 'number';
  if (/\d{4}-\d{2}-\d{2}/.test(String(value))) return 'date';
  return 'text';
};

interface DataRow {
  [key: string]: string | number | null | undefined;
}

interface DescribeTableProps {
  data: DataRow[];
}

const DescribeTable = ({ data }: DescribeTableProps) => {
  if (!data.length) return null;

  const headers = Object.keys(data[0]);

  return (
    <table className="w-full border-collapse mt-2 font-sans shadow-md">
      <thead>
        <tr className="bg-blue-900 text-white text-left">
          <th className="px-4 py-3 border">No</th>
          {headers.map((head, index) => (
            <th key={index} className="px-4 py-3 border">{head}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row: DataRow, rowIdx: number) => (
          <tr key={rowIdx} className="even:bg-gray-100 hover:bg-gray-200">
            <td className="px-4 py-2 border">{rowIdx + 1}</td>
            {headers.map((key, colIdx) => {
              const val = row[key] === '' ? '–' : row[key];
              const type = getCellType(val);
              const colorClass = {
                number: 'text-blue-600 font-semibold',
                date: 'text-green-600 font-semibold',
                text: 'text-black',
                missing: 'text-red-600 font-bold italic',
              }[type];

              return (
                <td key={colIdx} className={`px-4 py-2 border ${colorClass}`}>{val}</td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const CheckData = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState('');
  const [search, setSearch] = useState('');
  const [transposed, setTransposed] = useState(false);
  const [tableData, setTableData] = useState<DataRow[]>(sampleData);

  const filteredData = tableData.filter(row =>
    Object.values(row).some(value =>
      String(value).toLowerCase().includes(search.toLowerCase())
    )
  );

  const handleTransposed = (data: DataRow[]): DataRow[] => {
    if (!data.length) return [];
    const keys = Object.keys(data[0]);
    const transposedArray: DataRow[] = [];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    keys.forEach((key, i) => {
      const newRow: DataRow = { Kolom: key };
      data.forEach((row, j) => {
        newRow[`Baris ${j + 1}`] = row[key];
      });
      transposedArray.push(newRow);
    });
    return transposedArray;
  };

  const handleAddColumn = () => {
    if (!newColumnName.trim()) return;
    const updated = tableData.map(row => ({ ...row, [newColumnName]: '' }));
    setTableData(updated);
    setNewColumnName('');
    setIsModalOpen(false);
  };

  const confirmDeleteLastColumn = () => {
    const keys = Object.keys(tableData[0]);
    const lastKey = keys[keys.length - 1];
    if (!lastKey) return;
    setColumnToDelete(lastKey);
    setIsConfirmOpen(true);
  };

  const handleDeleteColumnConfirmed = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const updated = tableData.map(({ [columnToDelete]: _, ...rest }) => rest);
    setTableData(updated);
    setIsConfirmOpen(false);
    setColumnToDelete('');
  };

  return (
    <>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center w-[400px]">
            <h3 className="text-lg font-semibold">Tambah Kolom Baru</h3>
            <input
              type="text"
              placeholder="Masukkan nama kolom"
              className="w-full p-2 mt-4 border border-gray-300 rounded-md"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
            />
            <div className="flex gap-3 mt-4">
              <button onClick={handleAddColumn} className="flex-1 py-2 bg-blue-600 text-white rounded-md">Tambah</button>
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-gray-400 text-white rounded-md">Batal</button>
            </div>
          </div>
        </div>
      )}

      {isConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center w-[400px]">
            <h3 className="text-lg font-semibold">Yakin ingin menghapus kolom terakhir <span className="text-red-500">{columnToDelete}</span>?</h3>
            <div className="flex gap-3 mt-4">
              <button onClick={handleDeleteColumnConfirmed} className="flex-1 py-2 bg-blue-600 text-white rounded-md">Ya</button>
              <button onClick={() => setIsConfirmOpen(false)} className="flex-1 py-2 bg-gray-400 text-white rounded-md">Tidak</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center text-center mt-5 font-sans">
        <h1 className="text-2xl font-bold">Langkah 2 dari 4: Cek Data</h1>
      </div>

      <div className="mx-10">
        <StepProgres currentStep={2} />
      </div>

      <div className="flex flex-wrap justify-between items-start gap-10 max-w-6xl mx-auto mt-10">
        <div className="flex-1 min-w-[300px] ml-10">
          <h1 className="text-2xl mb-2 font-bold font-sans">Cek Data</h1>
          <h4 className="text-base mt-2 font-normal text-justify font-sans w-[400px]">
            Dalam tabel, kolom angka akan ditampilkan dalam warna biru, tanggal dalam warna hijau, dan teks dalam warna hitam. Sel yang berwarna merah menandakan adanya masalah pada data Anda yang perlu diperbaiki. Tanda – menunjukkan bahwa sel tersebut tidak memiliki data.
          </h4>
        </div>

        <div className="flex-1 min-w-[500px] p-4 overflow-x-auto bg-gray-100 rounded-md shadow">
          <div className="flex justify-end mb-2">
            <input
              type="text"
              placeholder="Cari..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-[170px] h-[30px] rounded-md bg-[#F3F7EC] px-3 py-2"
            />
          </div>

          <DescribeTable data={transposed ? handleTransposed(filteredData) : filteredData} />

          <div className="flex justify-end gap-4 mt-3">
            <button onClick={() => setTransposed(prev => !prev)} className="px-4 py-2 border rounded-full hover:bg-black/10">Tukar Kolom dan Baris</button>
            <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 border rounded-full hover:bg-black/10" >Tambah Kolom</button>
            <button onClick={confirmDeleteLastColumn} className="px-4 py-2 border rounded-full hover:bg-black/10">Hapus Kolom</button>
          </div>
        </div>
      </div>

      <NextBack nextLink="/visualize" backLink="/UpData" />
    </>
  );
};

export default CheckData;
