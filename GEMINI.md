# Konteks dan Preferensi Proyek

## Desain & UI: "The Ethereal Analyst"
- **Pewarnaan Terpusat (Global CSS):** Aplikasi dilarang keras menggunakan warna *hardcoded* atau statis dalam kelas (`bg-[#abcdef]`, `text-blue-500`, dsb). Semua warna harus bersumber dari variabel CSS global di `globals.css` yang dipanggil melalui sistem semantik Tailwind (`bg-primary`, `text-muted-foreground`, `bg-chart-1`).
- **Palet Utama:** Neon (`var(--primary)` / `#D1FC00`), Core Brand (`var(--secondary)` / `#516200`), Teks/Tertiary (`var(--foreground)` / `#2C2F30`), Background/Neutral (`var(--background)` / `#F5F6F7`), Elevasi/Card (`var(--card)` / `#FFFFFF`).
- **Aturan Batas & Elevasi:** Dilarang menggunakan border solid 1px standar (`border-border`). Pemisahan utamanya via *tonal layering* atau ambient shadow: `0 20px 50px rgba(44,47,48,0.05)`. Radius melengkung ekstrem (24px atau `xl`/`lg`).
- **Efek Glassmorphism:** Class utilitas `.glass` dengan `bg-white/70`, `backdrop-blur-2xl`, dan tanpa border. Gradient digunakan sangat ringan pada primary calls-to-action (cta).
- **Tipografi Utama:** Aplikasi menggunakan font [Manrope](https://fonts.google.com/specimen/Manrope) dengan skala spesifik (display-lg, headline-md, body-md, label-sm).
