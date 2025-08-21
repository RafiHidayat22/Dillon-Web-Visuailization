// src/app/api/getUploadedData/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/src/lib/db";
import fs from "fs";
import Papa from "papaparse";

const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

export const GET = async (req: NextRequest) => {
  try {
    // Ambil token dari header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // Ambil dataset terakhir yang diupload oleh user
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [rows]: any = await db.query(
      "SELECT * FROM datasets WHERE user_id = ? ORDER BY upload_date DESC LIMIT 1",
      [userId]
    );

    if (!rows.length) {
      return NextResponse.json({ error: "Tidak ada data CSV" }, { status: 404 });
    }

    const dataset = rows[0];

    // Baca file CSV
    if (!fs.existsSync(dataset.file_path)) {
      return NextResponse.json({ error: "File CSV tidak ditemukan" }, { status: 404 });
    }

    const fileContent = fs.readFileSync(dataset.file_path, "utf8");
    const parsed = Papa.parse(fileContent, { header: true, skipEmptyLines: true });

    return NextResponse.json({
      data: parsed.data,
      original_name: dataset.original_name,
      upload_date: dataset.upload_date
    });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Terjadi kesalahan" }, { status: 500 });
  }
};
