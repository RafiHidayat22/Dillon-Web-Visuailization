/* eslint-disable @typescript-eslint/no-explicit-any */
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

    const fileId = req.nextUrl.searchParams.get("id");
    if (!fileId) return NextResponse.json({ error: "File ID dibutuhkan" }, { status: 400 });

    // Ambil data CSV dari database (metadata + JSON)
    const [rows]: any = await db.query(
      "SELECT id, original_name, upload_date, file_size, data_json FROM datasets WHERE user_id = ? AND id = ?",
      [userId, fileId]
    );

    if (!rows.length) return NextResponse.json({ error: "File CSV tidak ditemukan" }, { status: 404 });

    const dataset = rows[0];

    // Kembalikan metadata dan data JSON saja
    return NextResponse.json({
      id: dataset.id,
      original_name: dataset.original_name,
      upload_date: dataset.upload_date,
      file_size: dataset.file_size,
      data: JSON.parse(dataset.data_json || "[]")
    });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Terjadi kesalahan" }, { status: 500 });
  }
};


export const POST = async (req: NextRequest) => {
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

    const fileId = req.nextUrl.searchParams.get("id");
    if (!fileId) return NextResponse.json({ error: "File ID dibutuhkan" }, { status: 400 });

    const body = await req.json();
    const { data } = body;

    if (!Array.isArray(data)) return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });

    // Update data_json di database
    await db.query(
      "UPDATE datasets SET data_json = ? WHERE user_id = ? AND id = ?",
      [JSON.stringify(data), userId, fileId]
    );

    return NextResponse.json({ message: "Data berhasil diperbarui" });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Terjadi kesalahan" }, { status: 500 });
  }
};
