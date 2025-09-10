import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Fungsi untuk membersihkan Markdown atau karakter khusus
function cleanSummary(text: string) {
  return text
    .replace(/[*#]/g, '')        // hapus * dan #
    .replace(/^- /gm, '')        // hapus tanda minus di awal baris
    .replace(/\n{2,}/g, '\n')   // rapikan baris kosong
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    const { chartData, chartType, userPrompt, xAxisLabel, yAxisLabel } = await req.json();

    const systemPrompt = `
      Kamu adalah asisten data analyst. 
      Analisis hasil visualisasi berikut.
      Data: ${JSON.stringify(chartData).slice(0, 1500)}...
      Tipe chart: ${chartType}

      Aturan penting:
      - Selalu gunakan nama variabel sesuai label yang diberikan.
      - Jangan gunakan istilah "sumbu pertama" atau "sumbu kedua".
      - Sumbu X = ${xAxisLabel}
      - Sumbu Y = ${yAxisLabel}
      - Berikan ringkasan tren utama.
      - Jawab pertanyaan user berdasarkan data ini.
      - Output jawaban tanpa format Markdown atau simbol khusus, cukup teks naratif.
    `;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt || "Ringkas hasil visualisasi di atas." },
      ],
    });

    // Ambil jawaban dari GPT dan bersihkan karakter Markdown
    const rawSummary = response.choices[0].message?.content || '';
    const summary = cleanSummary(rawSummary);

    return NextResponse.json({ summary });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
