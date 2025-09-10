/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/src/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

export const POST = async (req: NextRequest) => {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) 
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    let payload: any;
    try { 
      payload = jwt.verify(token, JWT_SECRET); 
    } catch { 
      return NextResponse.json({ error: "Token invalid" }, { status: 401 }); 
    }

    const userId = payload.id;
    if (!userId) return NextResponse.json({ error: "User ID tidak ditemukan" }, { status: 401 });

    const body = await req.json();
    const { dataset_id, user_id, chart_type, chart_config } = body;

    if (!dataset_id || !user_id || !chart_type || !chart_config) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    if (user_id !== userId) {
      return NextResponse.json({ error: "User tidak valid" }, { status: 403 });
    }

    // -------------------- PERBAIKAN --------------------
    // Pastikan chart_config memiliki properti data minimal []
    let configObj: any = {};
    try {
      configObj = typeof chart_config === "string" ? JSON.parse(chart_config) : chart_config;
    } catch (err) {
      return NextResponse.json({ error: "chart_config tidak valid JSON" }, { status: 400 });
    }

    if (!configObj.data || !Array.isArray(configObj.data)) {
      configObj.data = [];
    }

    const chartConfigStr = JSON.stringify(configObj);

    // Simpan ke DB
    const id = crypto.randomUUID();
    await db.query(
      `INSERT INTO visualizations (id, dataset_id, user_id, chart_type, chart_config) 
       VALUES (?, ?, ?, ?, ?)`,
      [id, dataset_id, user_id, chart_type, chartConfigStr]
    );

    return NextResponse.json({ message: "Visualisasi berhasil disimpan", id });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Gagal menyimpan visualisasi" }, { status: 500 });
  }
};
