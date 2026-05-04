import { useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Subscription } from "./profile-subscription-tab";

export function ProfilePurchaseHistoryTab({
  subscriptionHistory,
}: {
  subscriptionHistory: Subscription[];
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(subscriptionHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = subscriptionHistory.slice(startIndex, startIndex + itemsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <div className="mb-8">
          <h2 className="text-4xl lg:text-5xl font-black mb-4 tracking-tight leading-[0.85] flex items-center gap-4">
            <Clock className="w-10 h-10 lg:w-12 lg:h-12 text-primary" /> Riwayat Pembelian.
          </h2>
          <p className="text-lg text-muted-foreground font-medium max-w-2xl leading-relaxed">
            Lihat daftar transaksi paket langganan Anda sebelumnya.
          </p>
        </div>

        {subscriptionHistory.length === 0 ? (
          <div className="p-8 text-center bg-muted/20 border border-border/40 rounded-2xl">
            <p className="text-muted-foreground font-medium">Belum ada riwayat pembelian.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#0e0f0c] border border-border/40 dark:border-primary/10 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/30 text-muted-foreground uppercase text-xs font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Tanggal</th>
                    <th className="px-6 py-4">Paket</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Metode</th>
                    <th className="px-6 py-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {currentItems.map((sub) => (
                    <tr key={sub.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4 font-medium">
                        {format(new Date(sub.created_at || new Date()), "dd MMM yyyy", { locale: id })}
                      </td>
                      <td className="px-6 py-4 capitalize font-bold">
                        {sub.plan_id} {sub.interval === "monthly" ? "Bulanan" : "Tahunan"}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={`font-bold ${
                          sub.status === "settlement" ? "border-primary text-primary bg-primary/10" :
                          sub.status === "pending" ? "border-warning text-warning bg-warning/10" :
                          "border-red-500 text-red-500 bg-red-500/10"
                        }`}>
                          {sub.status === "settlement" ? "Sukses" : sub.status === "pending" ? "Tertunda" : "Gagal/Kadaluarsa"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 uppercase font-bold text-muted-foreground">
                        {sub.payment_type ? sub.payment_type.replace(/_/g, " ") : "-"}
                      </td>
                      <td className="px-6 py-4 text-right font-black">
                        Rp {sub.amount.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 bg-muted/10 border-t border-border/40">
                <p className="text-sm text-muted-foreground font-medium">
                  Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, subscriptionHistory.length)} dari {subscriptionHistory.length} transaksi
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className="p-2 rounded-full hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm font-bold w-12 text-center">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-full hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
