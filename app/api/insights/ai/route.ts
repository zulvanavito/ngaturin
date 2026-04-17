import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { transactions, summary, investments, debts, bills } = await req.json();

    const totalExpense = summary?.totalExpense || 0;
    const topCategory = summary?.topCategory || "Belum ada";
    const netCashflow = summary?.netCashflow || 0;

    // Debt reasoning
    const activeDebts = debts?.filter((d: any) => !d.is_settled && d.type === 'hutang') || [];
    const totalDebtAmount = activeDebts.reduce((sum: number, d: any) => sum + d.amount, 0);
    
    // Bills reasoning
    const today = new Date().getDate();
    const upcomingBills = bills?.filter((b: any) => b.is_active && Math.abs(b.due_day - today) <= 3) || [];
    const totalUpcomingBills = upcomingBills.reduce((sum: number, b: any) => sum + b.amount, 0);

    // Investment reasoning
    const totalInvestment = investments?.reduce((sum: number, i: any) => sum + i.current_value, 0) || 0;

    let aiNarrative = "";

    if (transactions?.length === 0) {
      aiNarrative = "Mulai catat transaksimu untuk mendapatkan analisis cerdas di sini.";
    } else {
      const parts = [];
      
      // 1. Expense/Cashflow Insight
      if (totalExpense > 0) {
        parts.push(`Fokus utama bulan ini adalah menjaga pengeluaran di kategori **${topCategory}**. `);
      }

      // 2. Critical Alerts (Bills/Debt)
      if (upcomingBills.length > 0) {
        parts.push(`⚠️ Kamu punya tagihan yang akan datang senilai **Rp${totalUpcomingBills.toLocaleString('id-ID')}**. Pastikan saldo lancar cukup agar tidak menunggak.`);
      }

      if (totalDebtAmount > (totalInvestment * 2)) {
        parts.push(`🚨 Rasio hutangmu terhadap aset investasi terlihat cukup tinggi. Pertimbangkan untuk mereview kembali prioritas pengeluaran.`);
      }

      // 3. Positive Reinforcement
      if (netCashflow > 0 && totalInvestment > 0) {
        parts.push(`✨ Bagus! *Cashflow* positifmu bisa dialokasikan untuk memperkuat portofolio investasi atau melunasi hutang lebih awal.`);
      }

      aiNarrative = parts.join(" ") || "Keuanganmu terlihat stabil. Terus pantau pengeluaran harianmu agar tetap sesuai anggaran.";
    }

    return NextResponse.json({
      narrative: aiNarrative,
      timestamp: new Date().toISOString(),
      isAiGenerated: false,
    });
  } catch (error) {
    console.error("Insights AI Error:", error);
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 });
  }
}
