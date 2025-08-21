/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/getUploadedFiles/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/src/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

export const GET = async (req: NextRequest) => {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
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

    // Ambil semua file CSV user
    const [rows]: any = await db.query(
      "SELECT id, original_name, upload_date FROM datasets WHERE user_id = ? ORDER BY upload_date DESC",
      [userId]
    );

    return NextResponse.json({ files: rows });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Terjadi kesalahan" }, { status: 500 });
  }
};
