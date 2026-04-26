"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DownloadCloud, 
  UploadCloud, 
  HardDrive, 
  RefreshCw 
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
    <div className="space-y-6">
      <div className="border border-border/40 bg-white dark:bg-card shadow-sm rounded-[2rem] p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
            <HardDrive className="w-4 h-4 text-secondary" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Backup &amp; Pemulihan Data</h2>
            <p className="text-xs text-muted-foreground">Kelola semua data aplikasi Anda dalam format JSON.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border/30 bg-muted/20 p-4">
            <h3 className="text-sm font-medium mb-1">📦 Ekspor Backup</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Unduh semua data transaksi, kategori, dan dompet.
            </p>
            <Button
              className="w-full h-11 gap-2 bg-primary hover:brightness-110 text-primary-foreground border-0 rounded-xl shadow-md"
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
              {backupLoading ? "Menyiapkan..." : "Unduh Backup JSON"}
            </Button>
          </div>

          <div className="rounded-xl border border-border/30 bg-muted/20 p-4">
            <h3 className="text-sm font-medium mb-1">🔄 Impor Data</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Pulihkan transaksi dari file backup JSON sebelumnya.
            </p>
            {importResult && (
              <p className="text-xs font-bold text-secondary mb-2">{importResult}</p>
            )}
            <label className="w-full cursor-pointer">
              <div className={`w-full h-11 rounded-xl border border-input bg-secondary hover:brightness-110 text-secondary-foreground shadow-md flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                importLoading ? "opacity-50 pointer-events-none" : ""
              }`}>
                {importLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                {importLoading ? "Mengimpor..." : "Pilih File Backup"}
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
                    setImportResult(`✅ ${result.imported} transaksi diimpor!`);
                  } catch (err: any) {
                    setImportResult(`❌ Gagal: ${err.message}`);
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
    </div>
  );
}
