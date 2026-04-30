"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DownloadCloud, 
  UploadCloud, 
  HardDrive, 
  RefreshCw,
  Package,
  AlertTriangle,
  CheckCircle2,
  XCircle
} from "lucide-react";
import type { Transaction } from "@/components/finance/transaction-form";

interface DataManagementCardProps {
  transactions: Transaction[];
}

export function DataManagementCard({ transactions }: DataManagementCardProps) {
  const [backupLoading, setBackupLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-3xl font-black tracking-tight mb-6 flex items-center gap-3">
          Backup & <span className="text-primary">Ekspor.</span>
        </h2>
        <div className="border border-border/40 dark:border-border/10 bg-white dark:bg-card shadow-sm rounded-[2.5rem] p-8 md:p-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
              <HardDrive className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-black">Data Portabilitas</h3>
              <p className="text-sm text-muted-foreground font-medium">Cadangkan data Anda secara lokal kapan saja.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-[2rem] border border-border/30 dark:border-border/10 bg-muted/10 dark:bg-muted/5 p-6 flex flex-col justify-between">
              <div>
                <h4 className="text-base font-black mb-2 flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" /> Ekspor Backup
                </h4>
                <p className="text-xs text-muted-foreground font-medium mb-6">
                  Unduh semua data transaksi, kategori, dan dompet dalam satu file JSON.
                </p>
              </div>
              <Button
                className="wise-button-pill w-full h-12 gap-2 bg-foreground text-background hover:scale-[1.02] active:scale-[0.98] font-black"
                disabled={backupLoading}
                onClick={async () => {
                  setBackupLoading(true);
                  try {
                    const res = await fetch("/api/backup");
                    const data = await res.json();
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `ngaturin_backup_${new Date().toISOString().split("T")[0]}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  } finally { setBackupLoading(false); }
                }}
              >
                {backupLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <DownloadCloud className="w-4 h-4" />}
                {backupLoading ? "Menyiapkan..." : "Unduh JSON"}
              </Button>
            </div>

            <div className="rounded-[2rem] border border-border/30 dark:border-border/10 bg-muted/10 dark:bg-muted/5 p-6 flex flex-col justify-between">
              <div>
                <h4 className="font-black mb-2 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-primary" /> Impor Data
                </h4>
                <p className="text-xs text-muted-foreground font-medium mb-6">
                  Pulihkan seluruh transaksi dari file cadangan yang Anda miliki.
                </p>
                {importResult && (
                  <div className="p-3 bg-secondary/10 dark:bg-secondary/20 text-secondary-foreground rounded-xl text-[10px] font-black mb-4 border border-secondary/20">
                    {importResult}
                  </div>
                )}
              </div>
              <label className="w-full cursor-pointer">
                <div className={`wise-button-pill w-full h-12 bg-secondary text-secondary-foreground hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 text-sm font-black transition-all ${
                  importLoading ? "opacity-50 pointer-events-none" : ""
                }`}>
                  {importLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                  {importLoading ? "Mengimpor..." : "Pilih File"}
                </div>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  disabled={importLoading}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setImportLoading(true);
                    setImportResult(null);
                    try {
                      const text = await file.text();
                      const json = JSON.parse(text);
                      const res = await fetch("/api/backup", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ transactions: json.transactions || [] }),
                      });
                      const result = await res.json();
                      if (!res.ok) throw new Error(result.error);
                      setImportResult(`Berhasil mengimpor ${result.imported} transaksi!`);
                    } catch (err: any) {
                      setImportResult(`Gagal: ${err.message}`);
                    } finally {
                      setImportLoading(false);
                      e.target.value = "";
                    }
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

