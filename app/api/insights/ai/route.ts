import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { transactions, summary } = await req.json();

    // Placeholder for Gemini API Integration
    // In a real scenario, you would use:
    // const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
    // const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // For now, we provide a rule-based "Smart Summary" baseline
    const totalTransactions = transactions?.length || 0;
    const totalExpense = summary?.totalExpense || 0;
    const topCategory = summary?.topCategory || "Belum ada";

    let aiNarrative = "";
    if (totalTransactions === 0) {
      aiNarrative = "Mulai catat transaksimu untuk mendapatkan analisis cerdas di sini.";
    } else if (totalExpense > 0) {
      aiNarrative = `Berdasarkan catatanmu, pengeluaran terbesar ada di kategori **${topCategory}**. Fokus untuk mengontrol area ini agar *cashflow* tetap terjaga!`;
    } else {
      aiNarrative = "Keuanganmu terlihat stabil. Terus pantau pengeluaran harianmu agar tidak melebihi anggaran.";
    }

    return NextResponse.json({
      narrative: aiNarrative,
      timestamp: new Date().toISOString(),
      isAiGenerated: false, // Flag to indicate if real AI or static rules
    });
  } catch (error) {
    console.error("Insights AI Error:", error);
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 });
  }
}
