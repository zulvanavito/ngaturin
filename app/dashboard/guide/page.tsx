import { GuideClientView } from "./guide-client-view";
import { LifeBuoy } from "lucide-react";

export const metadata = {
  title: "Panduan Pengguna | Ngaturin",
  description: "Pelajari cara mengoptimalkan keuangan Anda dengan Ngaturin.",
};

export default function GuidePage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="mb-10 px-4 pt-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium mb-4 bg-[#9fe870] text-[#163300]">
          <LifeBuoy className="w-4 h-4" /> Bantuan & Panduan
        </div>
        <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-4">
          Buku Panduan Otomasi Keuangan.
        </h1>
        <p className="text-muted-foreground text-lg font-medium max-w-2xl">
          Eksplorasi langkah-demi-langkah dan prinsip dasar dari setiap alat yang disediakan oleh Ngaturin untuk kehidupan finansial Anda.
        </p>
      </div>

      <div className="px-4">
        <GuideClientView />
      </div>
    </div>
  );
}
