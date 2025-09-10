/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/src/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

export const GET = async (req: NextRequest) => {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    let payload: any;
    try { payload = jwt.verify(token, JWT_SECRET); } catch { return NextResponse.json({ error: "Token invalid" }, { status: 401 }); }

    const userId = payload.id;
    if (!userId) return NextResponse.json({ error: "User ID tidak ditemukan" }, { status: 401 });

    const selectedFileId = req.nextUrl.searchParams.get("id");
    if (!selectedFileId) return NextResponse.json({ error: "File ID tidak diberikan" }, { status: 400 });

    const [rows]: any = await db.query(
      "SELECT data_json FROM datasets WHERE id = ? AND user_id = ?",
      [selectedFileId, userId]
    );

    if (!rows || rows.length === 0) return NextResponse.json({ error: "File tidak ditemukan" }, { status: 404 });

    const data = rows[0].data_json ? JSON.parse(rows[0].data_json) : [];
    return NextResponse.json({ data });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Terjadi kesalahan" }, { status: 500 });
  }
};