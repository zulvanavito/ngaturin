import Image from "next/image";

export function BlogHero() {
  return (
    <section className="relative w-full bg-[#0e0f0c] text-white pt-24 pb-16 md:pt-32 md:pb-24 px-6 overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#9fe870]/10 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="max-w-4xl">
          <h1 className="text-[64px] md:text-[96px] font-black leading-[0.85] tracking-tight mb-8 font-display">
            WAWASAN <br/>
            <span className="text-[#9fe870]">BERAT</span> UNTUK <br/>
            DOMPET <span className="text-[#9fe870]">RINGAN.</span>
          </h1>
          <p className="text-xl md:text-2xl font-semibold text-gray-400 max-w-2xl leading-relaxed mb-10">
            Gagasan soal produktivitas, Metode PARA, dan strategi finansial kelas kakap untuk kamu yang serius mengelola hidup.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="px-6 py-2 bg-[#9fe870]/10 border border-[#9fe870]/20 text-[#9fe870] rounded-full text-sm font-bold uppercase tracking-widest">
              Gagasan Segar
            </div>
            <div className="px-6 py-2 bg-white/5 border border-white/10 text-white/60 rounded-full text-sm font-bold uppercase tracking-widest">
              Metode PARA
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
