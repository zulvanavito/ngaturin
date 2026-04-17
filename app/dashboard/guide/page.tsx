/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useRef} from "react";
import { 
  LifeBuoy, 
  Layers, 
  Wallet, 
  PlusCircle, 
  Bell, 
  HandCoins, 
  TrendingUp, 
  Sparkles,
  ChevronRight,
  Info,
  Lightbulb
} from "lucide-react";


const GUIDE_SECTIONS = [
  { 
    id: "para-hub", 
    title: "Sistem PARA Hub", 
    icon: Layers,
    content: (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-extrabold mb-3">Sistem Produktivitas PARA</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Ngaturin tidak hanya tentang uang, tetapi juga manajemen hidup Anda secara menyeluruh. Kami menggunakan kerangka kerja <strong>PARA</strong> <i>(Projects, Areas, Resources, Archives)</i> untuk membantu Anda mengorganisasi segalanya.
          </p>
        </div>

        <div className="grid gap-4 mt-6">
          <div className="p-5 bg-muted/10 border border-border/40 rounded-2xl">
            <h3 className="font-bold text-lg mb-2 text-orange-500 flex items-center gap-2"><div className="w-6 h-6 rounded bg-orange-500/10 flex items-center justify-center">P</div> Projects (Proyek)</h3>
            <p className="text-muted-foreground text-sm">Target spesifik yang sedang Anda kerjakan dan memiliki batas waktu penyelesaian yang jelas. Contoh: "Renovasi Dapur Bebas Hutang" atau "Kumpulkan Dana Darurat 10jt".</p>
          </div>
          <div className="p-5 bg-muted/10 border border-border/40 rounded-2xl">
            <h3 className="font-bold text-lg mb-2 text-blue-500 flex items-center gap-2"><div className="w-6 h-6 rounded bg-blue-500/10 flex items-center justify-center">A</div> Areas (Area Tanggung Jawab)</h3>
            <p className="text-muted-foreground text-sm">Bidang kehidupan berkelanjutan yang perlu terus Anda jaga standarnya. Contoh: "Keuangan Keluarga", "Kesehatan", atau "Karir".</p>
          </div>
          <div className="p-5 bg-muted/10 border border-border/40 rounded-2xl">
            <h3 className="font-bold text-lg mb-2 text-green-500 flex items-center gap-2"><div className="w-6 h-6 rounded bg-green-500/10 flex items-center justify-center">R</div> Resources (Sumber Daya)</h3>
            <p className="text-muted-foreground text-sm">Topik atau minat yang sedang Anda pelajari yang bisa berguna di masa depan. Contoh: Referensi investasi saham, atau resep makanan hemat.</p>
          </div>
          <div className="p-5 bg-muted/10 border border-border/40 rounded-2xl">
            <h3 className="font-bold text-lg mb-2 text-gray-500 flex items-center gap-2"><div className="w-6 h-6 rounded bg-gray-500/10 flex items-center justify-center">A</div> Archives (Arsip)</h3>
            <p className="text-muted-foreground text-sm">Item dari 3 kategori di atas yang sudah tidak aktif atau selesai, namun disimpan sebagai rekam jejak.</p>
          </div>
        </div>

        <div className="p-5 border border-primary/20 bg-primary/5 rounded-2xl">
          <h4 className="font-bold text-sm text-primary flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4" /> Tips Ahli
          </h4>
          <ul className="space-y-1.5 list-none">
            <li className="flex items-start gap-2 text-sm text-muted-foreground"><span className="text-primary mt-0.5">•</span> Jangan ragu untuk memindahkan sebuah Proyek ke Arsip jika sudah selesai.</li>
            <li className="flex items-start gap-2 text-sm text-muted-foreground"><span className="text-primary mt-0.5">•</span> Area tidak pernah "selesai", jadi gunakan Area untuk melacak performa keuangan rutin Anda.</li>
          </ul>
        </div>
      </div>
    )
  },
  { 
    id: "dompet", 
    title: "Manajemen Dompet", 
    icon: Wallet,
    content: (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-extrabold mb-3">Multi-Dompet (Kantong Keuangan)</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Ngaturin memungkinkan Anda memisahkan uang Anda ke berbagai "Dompet" virtual atau fisik yang Anda miliki. Inti dari manajemen ini adalah kejelasan dan transparansi kepemilikan dana Anda.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4 items-start p-4 bg-background border border-border/40 shadow-sm rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
               <span className="font-bold text-primary">1</span>
            </div>
            <div>
              <h4 className="font-bold text-foreground">Pembuatan Dompet Baru</h4>
              <p className="text-sm text-muted-foreground mt-1">Gunakan tombol "Tambah Dompet" di menu Dompet. Anda dapat mengkategorikannya menjadi Bank, Tunai, atau E-Wallet.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start p-4 bg-background border border-border/40 shadow-sm rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
               <span className="font-bold text-primary">2</span>
            </div>
            <div>
              <h4 className="font-bold text-foreground">Dompet Utama vs Lainnya</h4>
              <p className="text-sm text-muted-foreground mt-1">Dompet yang Anda tentukan sebagai "Utama" akan menjadi opsi *default* setiap kali Anda mencatat pemasukan atau pengeluaran baru.</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  { 
    id: "transaksi", 
    title: "Pencatatan Transaksi", 
    icon: PlusCircle,
    content: (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-extrabold mb-3">Pencatatan Tanpa Ribet</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Menyajikan pencatatan keuangan sekilas. Setiap kali uang Anda berpindah, pastikan ada rekam jejak yang Anda tulis di Ngaturin.
          </p>
        </div>

        <ul className="grid gap-3">
          <li className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border/20 text-sm font-medium">
             <ChevronRight className="w-4 h-4 text-primary shrink-0" />
             Pastikan memilih Kategori yang akurat. Jika tidak ada yang cocok, Anda bisa menambah kategori khusus di Menu Kategori.
          </li>
          <li className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border/20 text-sm font-medium">
             <ChevronRight className="w-4 h-4 text-primary shrink-0" />
             Jika Anda hanya memindahkan uang dari Dompet A ke Dompet B (Misal: Tarik tunai dari ATM BCA ke Dompet Tunai), gunakan opsi "Transfer" bukan Pengeluaran.
          </li>
          <li className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border/20 text-sm font-medium">
             <ChevronRight className="w-4 h-4 text-primary shrink-0" />
             Anda dapat mengedit atau menghapus transaksi kapan saja mengklik tombol "Kelola" di daftar transaksi dashboard.
          </li>
        </ul>

        <div className="p-4 bg-blue-500/10 text-blue-800 dark:text-blue-200 rounded-2xl border border-blue-500/20 text-sm mt-4 flex gap-3">
          <Info className="w-5 h-5 shrink-0 mt-0.5" />
          <p>Seluruh saldo Anda akan selalu direkalkulasi secara instan setiap kali ada perubahan data transaksi.</p>
        </div>
      </div>
    )
  },
  { 
    id: "tagihan", 
    title: "Tagihan Berulang", 
    icon: Bell,
    content: (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-extrabold mb-3">Otomatisasi Tagihan Rutin</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Modul ini dibuat agar Anda tidak melewatkan komitmen keuangan bulanan seperti cicilan, langganan Spotify/Netflix, atau sewa rumah.
          </p>
        </div>

        <div className="flex flex-col gap-5 mt-6">
           <div className="p-6 rounded-[2rem] bg-card shadow-sm border border-border/40">
             <h4 className="font-bold text-lg mb-2">Sistem Tanggal Jatuh Tempo (Tanggal Angka)</h4>
             <p className="text-muted-foreground text-sm leading-relaxed">
                Anda hanya perlu memasukkan angka tanggal (misalnya "15"). Sistem kami secara cerdas memproyeksikan tanggal ini akan berulang setiap bulan di tanggal 15.
             </p>
           </div>
           
           <div className="p-6 rounded-[2rem] bg-card shadow-sm border border-border/40">
             <h4 className="font-bold text-lg mb-2">Aksi Lunas Otomatis (Auto-Pay Concept)</h4>
             <p className="text-muted-foreground text-sm leading-relaxed">
                Saat ini tagihan berfungsi sebagai <i>pengingat visual</i> di Analytics dan Dashboard. Saat tagihan sudah Anda tunaikan ke pihak ketiga, Anda tetap perlu mencatatnya sendiri secara manual sebagai 'Pengeluaran' di modul Transaksi.
             </p>
           </div>
        </div>
      </div>
    )
  },
  { 
    id: "utang", 
    title: "Utang & Piutang", 
    icon: HandCoins,
    content: (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-extrabold mb-3">Menertibkan Pinjam Meminjam</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Menjaga agar semua utang yang Anda miliki, dan uang yang orang lain pinjam (piutang), terpantau hingga lunas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="p-6 rounded-3xl bg-red-500/5 border border-red-500/20">
              <h4 className="font-bold text-red-600 dark:text-red-400 mb-2">Utang (Anda Meminjam)</h4>
              <p className="text-sm text-red-700/70 dark:text-red-300/70">Wajib segera dibayar kembali. Uang ini menambah kas saat ini tetapi akan menjadi liabilitas di Analytics.</p>
           </div>
           <div className="p-6 rounded-3xl bg-green-500/5 border border-green-500/20">
              <h4 className="font-bold text-green-600 dark:text-green-400 mb-2">Piutang (Teman Meminjam)</h4>
              <p className="text-sm text-green-700/70 dark:text-green-300/70">Uang yang seharusnya milik Anda tetapi ada pada entitas lain. Tidak ada di dompet Anda saat ini, namun bernilai sebagai aset.</p>
           </div>
        </div>

        <div className="p-5 border border-primary/20 bg-primary/5 rounded-2xl mt-6">
          <h4 className="font-bold text-sm text-primary flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4" /> Mekanisme Pelunasan
          </h4>
          <ul className="space-y-1.5 list-none">
            <li className="flex items-start gap-2 text-sm text-muted-foreground"><span className="text-primary mt-0.5">•</span> Klik logo centang di halaman Utang/Piutang untuk menandakan item telah selesai dibayar.</li>
            <li className="flex items-start gap-2 text-sm text-muted-foreground"><span className="text-primary mt-0.5">•</span> Untuk pencatatan arus kas riil yang sinkron, jangan lupa merekam tindakan 'Pembayaran Utang' tersebut di menu Transaksi agar uang memotong saldo dompet Anda dengan akurat.</li>
          </ul>
        </div>
      </div>
    )
  },
  { 
    id: "investasi", 
    title: "Portofolio Investasi", 
    icon: TrendingUp,
    content: (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-extrabold mb-3">Perjalanan Aset Anda</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Tempat khusus untuk merekam kekayaan yang bertumbuh seperti Reksadana, Saham, hingga Kripto atau Emas. Modul ini terpisah agar tidak membingungkan kas harian Anda.
          </p>
        </div>

        <div className="flex flex-col gap-4">
           <div className="p-5 border-l-[4px] border-primary bg-primary/5 rounded-r-2xl">
              <h4 className="font-bold text-foreground">Modal Ditanam (Invested Amount)</h4>
              <p className="text-sm text-muted-foreground mt-1">Uang aktual total yang Anda telah belikan untuk aset tersebut. Misalnya, Anda mengalokasikan Rp 5.000.000 ke BBCA.</p>
           </div>
           <div className="p-5 border-l-[4px] border-blue-500 bg-blue-500/5 rounded-r-2xl">
              <h4 className="font-bold text-foreground">Nilai Pasar Saat Ini (Current Value)</h4>
              <p className="text-sm text-muted-foreground mt-1">Nilai sekuritas saat Anda membuka aplikasinya sekarang. Jika porto BBCA naik menjadi Rp 5.500.000, segera masukkan nilai ini agar Ngaturin mendeteksi profit 10% di Analytics Anda.</p>
           </div>
        </div>
      </div>
    )
  },
  { 
    id: "analytics", 
    title: "Smart Analytics", 
    icon: Sparkles,
    content: (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-extrabold mb-3">Intelijen Keuangan Anda</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
             Dapatkan wawasan berharga soal kondisi kekayaan bersih (Net Worth), serta *cashflow statement* yang dibuat menggunakan Artificial Intelligence lokal dan grafik metrik intuitif.
          </p>
        </div>

        <ul className="space-y-3 mt-4">
           <li className="flex gap-4 items-start p-4 bg-card rounded-2xl border border-border/20 shadow-sm transition-all hover:border-primary/40">
             <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0"><Sparkles className="w-5 h-5"/></div>
             <div>
                <p className="font-bold text-sm mb-1">AI Kesimpulan Naratif</p>
                <p className="text-xs text-muted-foreground">Mesin rekomendasi kami akan merangkum anomali belanja Anda dan mengingatkan tindakan *budgeting* secara tekstual.</p>
             </div>
           </li>
           <li className="flex gap-4 items-start p-4 bg-card rounded-2xl border border-border/20 shadow-sm transition-all hover:border-primary/40">
             <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0"><Layers className="w-5 h-5"/></div>
             <div>
                <p className="font-bold text-sm mb-1">Tab Eksklusif Aset & Kewajiban</p>
                <p className="text-xs text-muted-foreground">Pada panel Smart Analytics, Anda dapat melihat total Aset (Kas + Investasi) yang dikurangi dengan total Kewajiban (Total Utang) secara real-time.</p>
             </div>
           </li>
        </ul>
      </div>
    )
  }
];

export default function GuidePage() {
  const [activeTab, setActiveTab] = useState(GUIDE_SECTIONS[0].id);

  // Auto-scroll logic for mobile when selecting a tab
  const contentRef = useRef<HTMLDivElement>(null);

  const handleTabSelect = (id: string) => {
    setActiveTab(id);
    if (window.innerWidth < 1024 && contentRef.current) {
      window.scrollTo({
        top: contentRef.current.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  };

  const activeContent = GUIDE_SECTIONS.find(s => s.id === activeTab);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium mb-4 bg-brand-mint text-brand-dark">
          <LifeBuoy className="w-4 h-4" /> Bantuan & Panduan
        </div>
        <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-4">
          Buku Panduan Otomasi Keuangan.
        </h1>
        <p className="text-muted-foreground text-lg font-medium max-w-2xl">
          Eksplorasi langkah-demi-langkah dan prinsip dasar dari setiap alat yang disediakan oleh Ngaturin untuk kehidupan finansial Anda.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative">
        
        {/* Left Nav (Vertical Tabs) */}
        <aside className="lg:w-72 shrink-0">
          <div className="sticky top-24">
             {/* Mobile Horizontal Scroll */}
             <div className="flex lg:hidden overflow-x-auto gap-2 pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
               {GUIDE_SECTIONS.map((section) => {
                 const isSelected = activeTab === section.id;
                 return (
                   <button
                     key={section.id}
                     onClick={() => handleTabSelect(section.id)}
                     className={`flex items-center gap-2 px-4 py-3 rounded-[1.25rem] font-bold text-sm whitespace-nowrap transition-all duration-300 ${
                       isSelected 
                         ? "bg-brand-mint text-brand-dark shadow-ring scale-100" 
                         : "bg-muted/30 text-muted-foreground hover:bg-muted/70 hover:text-foreground scale-95"
                     }`}
                   >
                     <section.icon className={`w-4 h-4 ${isSelected ? "text-brand-dark" : "text-muted-foreground"}`} />
                     {section.title}
                   </button>
                 );
               })}
             </div>

             {/* Desktop Vertical List */}
             <div className="hidden lg:flex flex-col gap-1">
                {GUIDE_SECTIONS.map((section) => {
                 const isSelected = activeTab === section.id;
                 return (
                   <button
                     key={section.id}
                     onClick={() => handleTabSelect(section.id)}
                     className={`w-full flex items-center justify-between px-5 py-4 rounded-[1.25rem] font-bold text-sm transition-all duration-300 group ${
                       isSelected 
                         ? "bg-brand-mint text-brand-dark shadow-ring" 
                         : "bg-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                     }`}
                   >
                     <div className="flex items-center gap-3">
                       <section.icon className={`w-5 h-5 transition-transform duration-300 ${isSelected ? "text-brand-dark scale-110" : "text-muted-foreground group-hover:scale-110"}`} />
                       {section.title}
                     </div>
                     {isSelected && <ChevronRight className="w-4 h-4" />}
                   </button>
                 );
               })}
             </div>
          </div>
        </aside>

        {/* Right Content Area */}
        <main ref={contentRef} className="flex-1 min-w-0">
           <div className="p-6 md:p-10 rounded-[2.5rem] bg-card border border-border/40 shadow-sm min-h-[500px]">
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" key={activeTab}>
                {activeContent?.content}
              </div>
           </div>
        </main>
      </div>

    </div>
  );
}
