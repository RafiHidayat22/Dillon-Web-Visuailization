/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/src/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

// GET semua visualisasi milik user
export const GET = async (req: NextRequest) => {
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

    const datasetId = req.nextUrl.searchParams.get("dataset_id");

    let query = "SELECT id, dataset_id, chart_type, chart_config, created_at FROM visualizations WHERE user_id = ?";
    const params: any[] = [userId];
    if (datasetId) {
      query += " AND dataset_id = ?";
      params.push(datasetId);
    }

    const [rows]: any = await db.query(query, params);

    // -------------------- PERBAIKAN --------------------
    // Pastikan setiap chart_config memiliki data minimal []
    const rowsWithData = rows.map((row: any) => {
      let config: any = {};
      try {
        config = typeof row.chart_config === "string" ? JSON.parse(row.chart_config) : row.chart_config;
      } catch {
        config = {};
      }
      if (!config.data || !Array.isArray(config.data)) config.data = [];
      return { ...row, chart_config: JSON.stringify(config) };
    });

    return NextResponse.json({ visualizations: rowsWithData });
  } catch (err: any) {
    console.error("API Error:", err);
    return NextResponse.json({ error: err.message || "Terjadi kesalahan" }, { status: 500 });
  }
};
