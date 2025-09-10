import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { db } from "@/src/lib/db";
import { v4 as uuidv4 } from "uuid"; // npm install uuid

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Generate UUID untuk user
    const userId = uuidv4();

    // Insert ke database
    await db.query(
      "INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)",
      [userId, name, email, hashed]
    );

    return NextResponse.json({ message: "Register berhasil", userId });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
