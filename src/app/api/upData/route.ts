/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/upData/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import Papa from "papaparse";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/src/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

export const POST = async (req: NextRequest) => {
  try {
    // === Ambil token ===
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let payload: any;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: "Token invalid" }, { status: 401 });
    }

    const userId = payload.id;
    if (!userId) {
      return NextResponse.json({ error: "User ID tidak ditemukan di token" }, { status: 401 });
    }

    // === Ambil file dari FormData ===
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    if (!file.name.endsWith(".csv")) return NextResponse.json({ error: "Hanya file CSV diperbolehkan" }, { status: 400 });

    // === Buat folder uploads jika belum ada ===
    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

    // === Simpan file di uploads dengan UUID agar unik ===
    const fileUUID = uuidv4(); // UUID untuk nama file di folder
    const newFileName = `${fileUUID}-${file.name}`;
    const filePath = path.join(uploadDir, newFileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    // === Baca CSV ===
    const csvData = buffer.toString("utf8");
    const parsed = Papa.parse(csvData, { header: true, skipEmptyLines: true });

    // === Simpan metadata file ke database dengan UUID sebagai primary key ===
    const datasetId = uuidv4(); // UUID untuk kolom 'id' di database
    await db.execute(
      `INSERT INTO datasets (id, user_id, file_path, original_name, file_size)
       VALUES (?, ?, ?, ?, ?)`,
      [datasetId, userId, filePath, file.name, file.size]
    );

    return NextResponse.json({ message: "Upload berhasil!", data: parsed.data });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Terjadi kesalahan" }, { status: 500 });
  }
};
