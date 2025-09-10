/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion'; 
import StepProgres from '@/components/StepProgres';
import NextBack from '@/components/NextBack';
import { useDataContext } from '../context/DataContext';
import { useRouter } from "next/navigation";
import DescribeTable from '@/components/DescribeTable';
import { Modal } from 'antd';

interface DataRow {
  [key: string]: string | number | null | undefined;
}

const CheckData = () => {
  const [search, setSearch] = useState('');
  const [transposed, setTransposed] = useState(false);
  const [tableData, setTableData] = useState<DataRow[]>([]);
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const [uploadedFiles, setUploadedFiles] = useState<{ id: string; original_name: string }[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string>("");

  // === modal antd state ===
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');
  const [onOkAction, setOnOkAction] = useState<(() => void) | null>(null);

  const { setData } = useDataContext();
  const router = useRouter();

  // === State tambahan untuk edit nama kolom ===
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [tempColumnEdit, setTempColumnEdit] = useState('');

  const filteredData = tableData.filter(row =>
    Object.values(row).some(value =>
      String(value).toLowerCase().includes(search.toLowerCase())
    )
  );

  // === User login & ambil daftar file CSV ===
  useEffect(() => {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('name');

    if (!token || !name) {
      router.push('/auth/login');
      return;
    }

    setUser({ name });
    setLoading(true);

    fetch('/api/checkData/getUploadedFiles', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(res => {
        setUploadedFiles(res.files || []);
        if (res.files?.length) setSelectedFileId(res.files[0].id);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [router]);

  // === Fetch data CSV saat file dipilih ===
  useEffect(() => {
    if (!selectedFileId) return;

    const token = localStorage.getItem('token');
    setLoading(true);

    fetch(`/api/checkData/getUploadedDataById?id=${selectedFileId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(res => {
        setTableData(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedFileId]);

  // === Cek baris kosong & duplikat ===
  useEffect(() => {
    if (!tableData.length) return;

    const emptyRows = tableData.filter(row =>
      Object.values(row).every(val => val === null || val === undefined || val === '')
    );

    const duplicateRows: DataRow[] = [];
    const seen = new Set<string>();
    tableData.forEach(row => {
      const key = JSON.stringify(row);
      if (seen.has(key)) duplicateRows.push(row);
      else seen.add(key);
    });

    if (emptyRows.length > 0) {
      setModalTitle('Peringatan Baris Kosong');
      setModalContent(`Terdapat ${emptyRows.length} baris kosong dalam tabel.`);
      setOnOkAction(null);
      setModalOpen(true);
    } else if (duplicateRows.length > 0) {
      setModalTitle('Peringatan Duplikat Data');
      setModalContent(`Terdapat ${duplicateRows.length} baris duplikat dalam tabel.`);
      setOnOkAction(null);
      setModalOpen(true);
    }
  }, [tableData]);

  // === Transpose table ===
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

  // === Tambah kolom baru ===
  const [inputColumnModalOpen, setInputColumnModalOpen] = useState(false);
  const [tempColumnName, setTempColumnName] = useState('');

  const handleAddColumnClick = () => {
    setTempColumnName('');
    setInputColumnModalOpen(true);
  };

  const handleAddColumnConfirm = () => {
    const columnName = tempColumnName.trim();
    if (!columnName) {
      setModalTitle('Error');
      setModalContent('Nama kolom tidak boleh kosong!');
      setOnOkAction(null);
      setModalOpen(true);
      return;
    }

    if (tableData[0] && Object.keys(tableData[0]).includes(columnName)) {
      setModalTitle('Error');
      setModalContent(`Kolom "${columnName}" sudah ada!`);
      setOnOkAction(null);
      setModalOpen(true);
      return;
    }

    const updated = tableData.map(row => ({ ...row, [columnName]: '' }));
    setTableData(updated);

    setModalTitle('Kolom Ditambahkan');
    setModalContent(`Kolom "${columnName}" berhasil ditambahkan.`);
    setOnOkAction(null);
    setModalOpen(true);

    setInputColumnModalOpen(false);
  };

  // === Hapus kolom terakhir ===
  const confirmDeleteLastColumn = () => {
    if (!tableData.length) return;

    const keys = Object.keys(tableData[0]);
    const lastKey = keys[keys.length - 1];

    setModalTitle('Konfirmasi Hapus Kolom');
    setModalContent(`Yakin ingin menghapus kolom terakhir "${lastKey}"?`);
    setOnOkAction(() => () => {
      const updated = tableData.map(({ [lastKey]: _, ...rest }) => rest);
      setTableData(updated);
      setModalOpen(false);
    });
    setModalOpen(true);
  };

  // === Simpan data tabel ===
  const handleSaveTableData = async () => {
    if (!selectedFileId) return;

    const token = localStorage.getItem('token');
    setLoading(true);

    try {
      const res = await fetch(`/api/checkData/getUploadedDataById?id=${selectedFileId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ data: tableData })
      });

      const result = await res.json();
      if (res.ok) {
        setModalTitle('Berhasil');
        setModalContent('Data berhasil disimpan!');
        setOnOkAction(null);
        setModalOpen(true);
      } else {
        setModalTitle('Gagal');
        setModalContent(`Gagal menyimpan data: ${result.error || 'Unknown error'}`);
        setOnOkAction(null);
        setModalOpen(true);
      }
    } catch (err) {
      console.error(err);
      setModalTitle('Error');
      setModalContent('Terjadi kesalahan saat menyimpan data');
      setOnOkAction(null);
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // === Simpan nama kolom setelah diedit ===
  const handleColumnNameSave = (oldName: string) => {
    const newName = tempColumnEdit.trim();
    if (!newName) return;

    if (tableData[0] && Object.keys(tableData[0]).includes(newName)) {
      setModalTitle('Error');
      setModalContent(`Kolom "${newName}" sudah ada!`);
      setOnOkAction(null);
      setModalOpen(true);
      return;
    }

    const updatedData = tableData.map(row => {
      const { [oldName]: oldValue, ...rest } = row;
      return { ...rest, [newName]: oldValue };
    });

    setTableData(updatedData);
    setEditingColumn(null);
  };

  // === Realtime edit column name saat mengetik ===
  const handleColumnNameTyping = (oldName: string, newName: string) => {
    if (!oldName) return;
    const updatedData = tableData.map(row => {
      const { [oldName]: oldValue, ...rest } = row;
      return { ...rest, [newName]: oldValue };
    });
    setTableData(updatedData);
    setTempColumnEdit(newName);
  };

  if (!user) return null;
  if (loading) return <p className="text-center mt-10">Loading data CSV...</p>;

  return (
    <>
      {/* === Header === */}
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

      {/* === Konten utama === */}
      <div className="flex flex-wrap justify-between items-start gap-10 max-w-6xl mx-auto mt-10">
        <div className="flex-1 min-w-[300px] ml-10">
          <h1 className="text-2xl mb-2 font-bold font-sans">Cek Data</h1>
          <h4 className="text-base mt-2 font-normal text-justify font-sans w-[400px]">
            Dalam tabel, kolom angka akan ditampilkan dalam warna biru, tanggal dalam warna hijau, dan teks dalam warna hitam. Sel yang berwarna merah menandakan adanya masalah pada data Anda yang perlu diperbaiki. Tanda – menunjukkan bahwa sel tersebut tidak memiliki data.
          </h4>
        </div>

        <div className="flex-1 min-w-[500px] flex flex-col gap-3">
          <div className="flex justify-end">
            <input
              type="text"
              placeholder="Cari..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-[170px] h-[30px] rounded-md bg-[#F3F7EC] px-3 py-2"
            />
          </div>

          <div className="mb-3">
            <label className="mr-2 font-semibold">Pilih File CSV:</label>
            <select
              value={selectedFileId}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedFileId(id);
                localStorage.setItem("selectedFileId", id);
              }}
              className="border rounded px-2 py-1"
            >
              {uploadedFiles.map(file => (
                <option key={file.id} value={file.id}>{file.original_name}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <div className="p-4 bg-gray-100 rounded-md shadow min-w-max">
              <DescribeTable
                data={transposed ? handleTransposed(filteredData) : filteredData}
                onCellChange={(rowIndex, key, value) => {
                  const updated = [...tableData];
                  updated[rowIndex][key] = value;
                  setTableData(updated);
                }}
                editingColumn={editingColumn}
                onStartEditingColumn={(col) => { setEditingColumn(col); setTempColumnEdit(col); }}
                onColumnNameChange={(val) => setTempColumnEdit(val)}
                onColumnNameSave={handleColumnNameSave}
                onColumnNameTyping={handleColumnNameTyping}
                tempColumnEdit={tempColumnEdit}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-3">
            <button
              onClick={() => setTransposed(prev => !prev)}
              className="px-4 border rounded-full hover:bg-black/10"
            >
              Tukar Kolom dan Baris
            </button>
            <button
              onClick={handleAddColumnClick}
              disabled={transposed}
              className={`px-4 border rounded-full hover:bg-black/10 ${transposed ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Tambah Kolom
            </button>
            <button
              onClick={confirmDeleteLastColumn}
              disabled={transposed}
              className={`px-2 border rounded-full hover:bg-black/10 ${transposed ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Hapus Kolom
            </button>
            <button
              onClick={handleSaveTableData}
              className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      <NextBack nextLink="/Visualize" backLink="/UpData" />

      {/* === Modal Antd === */}
      <Modal
        title={modalTitle}
        open={modalOpen}
        onOk={() => {
          if (onOkAction) onOkAction();
          setModalOpen(false);
        }}
        onCancel={() => setModalOpen(false)}
        okText="OK"
        cancelText="Tutup"
      >
        {modalContent}
      </Modal>

      <Modal
        title="Tambah Kolom Baru"
        open={inputColumnModalOpen}
        onOk={handleAddColumnConfirm}
        onCancel={() => setInputColumnModalOpen(false)}
        okText="Tambah"
        cancelText="Batal"
      >
        <input
          type="text"
          placeholder="Masukkan nama kolom"
          value={tempColumnName}
          onChange={(e) => setTempColumnName(e.target.value)}
          className="w-full border px-2 py-1 rounded"
        />
      </Modal>
    </>
  );
};

export default CheckData;
