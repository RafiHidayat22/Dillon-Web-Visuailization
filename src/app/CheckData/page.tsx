'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; 
import StepProgres from '@/components/StepProgres';
import NextBack from '@/components/NextBack';
import { useDataContext } from '../context/DataContext';
import { useRouter } from "next/navigation";
import DescribeTable from '@/components/DescribeTable';



const sampleData = [
  { nama: 'Andi', umur: 21, tanggalLahir: '2003-02-21' },
  { nama: 'Budi', umur: 17, tanggalLahir: '2005-06-11' },
  { nama: 'Andi', umur: 20, tanggalLahir: '2003-02-21' },
  { nama: 'Andi', umur: 25, tanggalLahir: '2003-02-21' },
  { nama: 'Andi', umur: 30, tanggalLahir: '2003-02-21' },
  { nama: 'Andi', umur: 41, tanggalLahir: '2003-02-21' },
  { nama: 'Andi', umur: 19, tanggalLahir: '2003-02-21' },
  { nama: 'Andi', umur: 23, tanggalLahir: '2003-02-21' },
];


interface DataRow {
  [key: string]: string | number | null | undefined;
}


const CheckData = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState('');
  const [search, setSearch] = useState('');
  const [transposed, setTransposed] = useState(false);
  const [tableData, setTableData] = useState<DataRow[]>(sampleData);

const { setData } = useDataContext();
const router = useRouter();

const handleNext = () => {
  setData(tableData); // Simpan data ke context
  router.push("/Visualize"); // Navigasi ke halaman Visualize
};

useEffect(() => {
  setData(sampleData);
})
  const filteredData = tableData.filter(row =>
    Object.values(row).some(value =>
      String(value).toLowerCase().includes(search.toLowerCase())
    )
  );

  
  const handleTransposed = (data: DataRow[]): DataRow[] => {
    if (!data.length) return [];
    const keys = Object.keys(data[0]);
    const transposedArray: DataRow[] = [];
    keys.forEach((key) => {
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
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0  flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded-lg shadow-lg text-center w-[400px]"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
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
            </motion.div>
          </motion.div>
        )}

        {isConfirmOpen && (
          <motion.div
            className="fixed inset-0  flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded-lg shadow-lg text-center w-[400px]"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg font-semibold">
                Yakin ingin menghapus kolom terakhir <span className="text-red-500">{columnToDelete}</span>?
              </h3>
              <div className="flex gap-3 mt-4">
                <button onClick={handleDeleteColumnConfirmed} className="flex-1 py-2 bg-blue-600 text-white rounded-md">Ya</button>
                <button onClick={() => setIsConfirmOpen(false)} className="flex-1 py-2 bg-gray-400 text-white rounded-md">Tidak</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="flex flex-col items-center text-center mt-5 font-sans"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-2xl font-bold mb-5">Langkah 2 dari 4: Cek Data</h1>
      </motion.div>

      <div className="mx-10">
        <StepProgres currentStep={2} />
      </div>

      <div className="flex flex-wrap overflow-x-auto justify-between items-start gap-10 max-w-6xl mx-auto mt-10">
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

          <div className="min-w-max">
            <DescribeTable
              data={transposed ? handleTransposed(filteredData) : filteredData}
              onCellChange={(rowIndex, key, value) => {
                const updated = [...tableData];
                updated[rowIndex][key] = value;
                setTableData(updated);
              }}
            />
          </div>

          <div className="flex justify-end gap-4 mt-3">
            <button onClick={() => setTransposed(prev => !prev)} className="px-4 py-2 border rounded-full hover:bg-black/10">Tukar Kolom dan Baris</button>
            <button onClick={() => setIsModalOpen(true)} disabled={transposed} className={`px-4 py-2 border rounded-full hover:bg-black/10 ${transposed ? 'opacity-50 cursor-not-allowed' : ''}`} >Tambah Kolom</button>
            <button onClick={confirmDeleteLastColumn} disabled={transposed} className={`px-4 py-2 border rounded-full hover:bg-black/10 ${transposed ? 'opacity-50 cursor-not-allowed' : ''}`} >Hapus Kolom</button>
          </div>
        </div>
      </div>

      <NextBack nextLink="#" backLink="/UpData" onNext={handleNext} />
    </>
  );
};

export default CheckData;
