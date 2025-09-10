/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/src/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

export const POST = async (req: NextRequest) => {
  try {
    // === Token validation ===
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
    if (!userId) return NextResponse.json({ error: "User ID tidak ditemukan di token" }, { status: 401 });

    // === Ambil file CSV ===
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    if (!file.name.endsWith(".csv")) return NextResponse.json({ error: "Hanya file CSV diperbolehkan" }, { status: 400 });

    // === Baca CSV dan parse ke JSON (tanpa menyimpan file fisik) ===
    const buffer = Buffer.from(await file.arrayBuffer());
    const csvData = buffer.toString("utf8");
    const parsed = Papa.parse(csvData, { header: true, skipEmptyLines: true });

    // === Simpan metadata ke database ===
    const datasetId = uuidv4();
    await db.execute(
      `INSERT INTO datasets (id, user_id, original_name, file_size, data_json)
       VALUES (?, ?, ?, ?, ?)`,
      [datasetId, userId, file.name, file.size, JSON.stringify(parsed.data)]
    );

    return NextResponse.json({ 
      message: "Upload berhasil!", 
      datasetId,
      data: parsed.data // optional, bisa dikirim balik kalau mau langsung pakai di frontend
    });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Terjadi kesalahan" }, { status: 500 });
  }
};
