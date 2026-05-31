import { Parser } from "json2csv";
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Transaction } from "@/types/finance";

export const exportToCSV = (data: Transaction[], filename: string) => {
  try {
    const parser = new Parser();
    const csv = parser.parse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error("Export CSV Error:", err);
  }
};

export const exportToExcel = async (data: Transaction[], filename: string) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Transactions");

  // Define columns
  worksheet.columns = [
    { header: "Tanggal", key: "date", width: 15 },
    { header: "Deskripsi", key: "description", width: 30 },
    { header: "Kategori", key: "category", width: 15 },
    { header: "Tipe", key: "type", width: 10 },
    { header: "Jumlah", key: "amount", width: 15 },
    { header: "Dompet", key: "wallet", width: 15 },
  ];

  // Add rows
  data.forEach(item => {
    worksheet.addRow({
      date: new Date(item.date).toLocaleDateString("id-ID"),
      description: item.description,
      category: item.category,
      type: item.type === "income" ? "Pemasukan" : "Pengeluaran",
      amount: item.amount,
      wallet: item.wallets?.name || "Tunai",
    });
  });

  // Style header
  worksheet.getRow(1).font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.xlsx`;
  a.click();
  window.URL.revokeObjectURL(url);
};

export const exportToPDF = (data: Transaction[], filename: string) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text("Laporan Transaksi Ngaturin", 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Dicetak pada: ${new Date().toLocaleString("id-ID")}`, 14, 30);

  const tableData = data.map(item => [
    new Date(item.date).toLocaleDateString("id-ID"),
    item.description,
    item.category,
    item.type === "income" ? "Pemasukan" : "Pengeluaran",
    `Rp ${item.amount.toLocaleString("id-ID")}`,
    item.wallets?.name || "Tunai"
  ]);

  autoTable(doc, {
    startY: 35,
    head: [["Tanggal", "Deskripsi", "Kategori", "Tipe", "Jumlah", "Dompet"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [159, 232, 112], textColor: [22, 51, 0] }, // Wise Green
  });

  doc.save(`${filename}.pdf`);
};
