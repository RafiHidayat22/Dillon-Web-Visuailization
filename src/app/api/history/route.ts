/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/src/lib/db"
import jwt from "jsonwebtoken"
import { v4 as uuidv4 } from "uuid"

const JWT_SECRET = process.env.JWT_SECRET || "secret_key"

// Helper: ambil user dari JWT
const getUserFromToken = (req: NextRequest) => {
  const authHeader = req.headers.get("authorization")
  if (!authHeader) throw new Error("Unauthorized")
  const token = authHeader.split(" ")[1]
  const decoded: any = jwt.verify(token, JWT_SECRET)
  return decoded.id
}

export async function GET(req: NextRequest) {
  try {
    const userId = getUserFromToken(req)

    // ambil semua file user
    const [files]: any = await db.query(
      "SELECT id, original_name, upload_date, data_json FROM datasets WHERE user_id = ? ORDER BY upload_date DESC",
      [userId]
    )

    // ambil visualisasi tiap file
    const history = await Promise.all(
      files.map(async (file: any) => {
        const [visuals]: any = await db.query(
          "SELECT id, chart_type, chart_config, created_at FROM visualizations WHERE dataset_id = ?",
          [file.id]
        )
        return {
          id: file.id,
          fileName: file.original_name,
          uploadedAt: file.upload_date,
          dataJson: file.data_json,
          visualizations: visuals,
        }
      })
    )

    return NextResponse.json({ history }, { status: 200 })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || "Terjadi kesalahan" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = getUserFromToken(req)
    const body = await req.json()
    const { originalName, dataJson } = body

    if (!originalName) return NextResponse.json({ error: "originalName diperlukan" }, { status: 400 })

    const id = uuidv4()
    await db.query(
      "INSERT INTO datasets (id, user_id, original_name, data_json) VALUES (?, ?, ?, ?)",
      [id, userId, originalName, dataJson || null]
    )

    return NextResponse.json({ message: "File berhasil dibuat", fileId: id }, { status: 201 })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || "Terjadi kesalahan" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = getUserFromToken(req)
    const body = await req.json()
    const { fileId, originalName, dataJson } = body

    if (!fileId) return NextResponse.json({ error: "fileId diperlukan" }, { status: 400 })

    // cek kepemilikan file
    const [file]: any = await db.query("SELECT * FROM datasets WHERE id = ? AND user_id = ?", [fileId, userId])
    if (!file || file.length === 0) return NextResponse.json({ error: "File tidak ditemukan" }, { status: 404 })

    await db.query(
      "UPDATE datasets SET original_name = ?, data_json = ? WHERE id = ?",
      [originalName || file[0].original_name, dataJson || file[0].data_json, fileId]
    )

    return NextResponse.json({ message: "File berhasil diperbarui" }, { status: 200 })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || "Terjadi kesalahan" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = getUserFromToken(req)
    const url = new URL(req.url)
    const fileId = url.searchParams.get("fileId")
    if (!fileId) return NextResponse.json({ error: "fileId diperlukan" }, { status: 400 })

    // cek kepemilikan file
    const [file]: any = await db.query("SELECT * FROM datasets WHERE id = ? AND user_id = ?", [fileId, userId])
    if (!file || file.length === 0) return NextResponse.json({ error: "File tidak ditemukan" }, { status: 404 })

    // hapus visualisasi terkait
    await db.query("DELETE FROM visualizations WHERE dataset_id = ?", [fileId])

    // hapus file
    await db.query("DELETE FROM datasets WHERE id = ?", [fileId])

    return NextResponse.json({ message: "File berhasil dihapus" }, { status: 200 })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || "Terjadi kesalahan" }, { status: 500 })
  }
}
