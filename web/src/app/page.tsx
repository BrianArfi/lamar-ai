const FEATURES = [
  {
    icon: "🎯",
    title: "Tahu mana lowongan yang worth it",
    desc: "Tinggal tempel deskripsi kerja, LamarAI langsung kasih nilai dan penjelasan — layak dilamar atau mending cari yang lain.",
  },
  {
    icon: "📄",
    title: "CV yang pas buat tiap lowongan",
    desc: "Bukan sekadar ganti nama perusahaan. AI benar-benar menyesuaikan isi CV-mu dengan kebutuhan lowongannya. Langsung bisa diunduh jadi PDF.",
  },
  {
    icon: "🔍",
    title: "Cek 45+ perusahaan tanpa capek",
    desc: "LamarAI memindai Greenhouse, Lever, Ashby, dan banyak lagi setiap hari. Kamu tinggal duduk dan tunggu lowongan baru masuk.",
  },
  {
    icon: "📊",
    title: "Cari tahu kenapa sering ditolak",
    desc: "Semua lamaranmu tercatat rapi. Kalau ada pola — misalnya selalu gagal di perusahaan tertentu — sistem langsung kasih tahu dan bantu perbaiki.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Masukkan CV kamu",
    desc: "Tinggal paste teks CV atau upload filenya. LamarAI langsung baca dan pahami profilmu.",
  },
  {
    num: "02",
    title: "Tempel lowongan yang kamu mau",
    desc: "Copy deskripsi kerja dari LinkedIn, Jobstreet, atau mana saja. LamarAI langsung nilai cocok atau enggak, dan sesuaikan CV-mu.",
  },
  {
    num: "03",
    title: "Lamar dengan tenang",
    desc: "CV sudah siap, lamaran tercatat, scanner jalan sendiri di belakang layar. Kamu tinggal fokus wawancara.",
  },
];

const STATS = [
  { num: "740+", label: "Lowongan Dievaluasi" },
  { num: "100+", label: "CV Dihasilkan" },
  { num: "45+", label: "Portal Dipindai" },
  { num: "< 60 dtk", label: "Per Evaluasi" },
];

const PLANS = [
  {
    name: "Gratis",
    price: "Rp 0",
    period: "selamanya",
    desc: "Untuk coba dulu",
    features: [
      "5 evaluasi lowongan / bulan",
      "2 CV tailored / bulan",
      "Scanner 5 portal",
      "Tracker dasar",
    ],
    cta: "Mulai Gratis",
    highlight: false,
  },
  {
    name: "Pro",
    price: "Rp [HARGA]",
    period: "/ bulan",
    desc: "Untuk pencarian kerja serius",
    features: [
      "Evaluasi lowongan tidak terbatas",
      "CV tailored tidak terbatas",
      "Scanner 45+ portal",
      "Analitik & pola penolakan",
      "Ekspor PDF prioritas",
    ],
    cta: "Mulai Pro",
    highlight: true,
  },
];

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#070709", color: "#e2e2f0" }}
    >
      {/* BG particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 2,
              height: Math.random() * 80 + 40,
              background: "linear-gradient(180deg, rgba(139,92,246,0.6) 0%, transparent 100%)",
              left: `${8 + i * 8}%`,
              top: `${Math.random() * 70}%`,
              borderRadius: 2,
              opacity: 0.4 + (i % 3) * 0.15,
              animation: `fall ${3 + (i % 4)}s ease-in-out infinite`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
      </div>

      {/* NAVBAR */}
      <nav
        className="relative flex items-center justify-between px-8 py-5 max-w-6xl mx-auto w-full"
        style={{ zIndex: 10 }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black"
            style={{ background: "linear-gradient(135deg, #7C3AED, #4F8EF7)", color: "#fff" }}
          >
            L
          </div>
          <div>
            <span className="font-black text-base text-white tracking-tight">LamarAI</span>
            <span
              className="block text-xs font-semibold tracking-widest uppercase"
              style={{ color: "#6b6b8a", lineHeight: 1, marginTop: 1 }}
            >
              AI Job Search
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="/auth/login"
            className="text-sm font-medium"
            style={{ color: "#8888aa" }}
          >
            Masuk
          </a>
          <a
            href="#daftar"
            className="text-sm font-bold px-4 py-2 rounded-lg"
            style={{ background: "#7C3AED", color: "#fff" }}
          >
            Mulai Gratis →
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section
        className="relative flex flex-col items-center text-center px-6 pt-20 pb-40"
        style={{ zIndex: 1 }}
      >
        {/* Glow behind headline */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: 700,
            height: 400,
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            background: "radial-gradient(ellipse, rgba(124,58,237,0.15) 0%, transparent 70%)",
          }}
        />

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 mb-10 px-4 py-2 rounded-full text-xs font-semibold tracking-widest uppercase"
          style={{
            background: "rgba(124,58,237,0.15)",
            border: "1px solid rgba(124,58,237,0.35)",
            color: "#a78bfa",
          }}
        >
          <span>✦</span>
          Asisten Cari Kerja Pakai AI
        </div>

        {/* Headline */}
        <h1
          className="font-black text-white mb-4"
          style={{
            fontSize: "clamp(40px, 6vw, 72px)",
            letterSpacing: "-2.5px",
            lineHeight: 1.05,
            maxWidth: 800,
          }}
        >
          Capek Ngirim Lamaran
          <br />
          <span
            style={{
              background: "linear-gradient(90deg, #a78bfa 0%, #7C3AED 50%, #4F8EF7 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            tapi Nggak Dipanggil?
          </span>
        </h1>

        <p
          className="text-base sm:text-lg leading-relaxed mb-10"
          style={{ color: "#7a7a9a", maxWidth: 520 }}
        >
          LamarAI bantu kamu nilai setiap lowongan, bikin CV yang pas otomatis,
          dan pantau 45+ perusahaan — biar kamu bisa fokus ke yang benar-benar worth it.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <a
            href="#daftar"
            className="px-7 py-3.5 rounded-xl text-base font-bold"
            style={{ background: "#7C3AED", color: "#fff" }}
          >
            Coba Gratis →
          </a>
          <a
            href="#cara-kerja"
            className="px-7 py-3.5 rounded-xl text-base font-semibold"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#ccc",
            }}
          >
            Gimana Cara Kerjanya?
          </a>
        </div>
        <p className="text-xs" style={{ color: "#4a4a6a" }}>
          🔥 Sudah{" "}
          <span style={{ color: "#a78bfa", fontWeight: 700 }}>740+ lowongan</span>{" "}
          dinilai pakai LamarAI
        </p>
      </section>

      {/* STATS */}
      <section className="relative max-w-4xl mx-auto w-full px-6 -mt-16 mb-24" style={{ zIndex: 2 }}>
        <div
          className="grid grid-cols-2 sm:grid-cols-4 rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {STATS.map((s, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center py-7 text-center"
              style={{
                borderRight:
                  i < STATS.length - 1 ? "1px solid rgba(255,255,255,0.07)" : undefined,
              }}
            >
              <span
                className="text-2xl font-black mb-1"
                style={{
                  background: "linear-gradient(135deg, #fff 0%, #a78bfa 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {s.num}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#3a3a5a" }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="cara-kerja" className="max-w-4xl mx-auto w-full px-6 mb-28 relative" style={{ zIndex: 2 }}>
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#7C3AED" }}>
            Cara Kerja
          </p>
          <h2
            className="text-3xl sm:text-4xl font-black text-white"
            style={{ letterSpacing: "-1.5px" }}
          >
            Tiga langkah, langsung bisa dipakai
          </h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {STEPS.map((s, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div
                className="text-xs font-black mb-4 inline-block px-2.5 py-1 rounded-lg"
                style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa" }}
              >
                {s.num}
              </div>
              <p className="font-bold text-white mb-2">{s.title}</p>
              <p className="text-sm leading-relaxed" style={{ color: "#5a5a7a" }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-4xl mx-auto w-full px-6 mb-28 relative" style={{ zIndex: 2 }}>
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#7C3AED" }}>
            Fitur
          </p>
          <h2
            className="text-3xl sm:text-4xl font-black text-white"
            style={{ letterSpacing: "-1.5px" }}
          >
            Semua ada di sini,{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #a78bfa, #4F8EF7)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              nggak perlu pindah-pindah aplikasi
            </span>
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="flex gap-4 p-6 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: "rgba(124,58,237,0.15)" }}
              >
                {f.icon}
              </div>
              <div>
                <p className="font-bold text-white text-sm mb-1.5">{f.title}</p>
                <p className="text-sm leading-relaxed" style={{ color: "#5a5a7a" }}>
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="daftar" className="max-w-4xl mx-auto w-full px-6 mb-28 relative" style={{ zIndex: 2 }}>
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#7C3AED" }}>
            Harga
          </p>
          <h2
            className="text-3xl sm:text-4xl font-black text-white"
            style={{ letterSpacing: "-1.5px" }}
          >
            Gratis dulu, bayar kalau udah cocok
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {PLANS.map((plan, i) => (
            <div
              key={i}
              className="p-7 rounded-2xl flex flex-col"
              style={{
                background: plan.highlight
                  ? "linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(79,142,247,0.1) 100%)"
                  : "rgba(255,255,255,0.02)",
                border: plan.highlight
                  ? "1px solid rgba(124,58,237,0.4)"
                  : "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {plan.highlight && (
                <div
                  className="text-xs font-bold uppercase tracking-widest mb-4 inline-block px-2.5 py-1 rounded-full self-start"
                  style={{ background: "rgba(124,58,237,0.3)", color: "#a78bfa" }}
                >
                  Paling Populer
                </div>
              )}
              <p className="font-black text-white text-lg mb-1">{plan.name}</p>
              <p className="text-xs mb-5" style={{ color: "#5a5a7a" }}>{plan.desc}</p>
              <div className="mb-6">
                <span
                  className="text-4xl font-black"
                  style={{ color: plan.highlight ? "#a78bfa" : "#fff", letterSpacing: "-1px" }}
                >
                  {plan.price}
                </span>
                <span className="text-sm ml-1" style={{ color: "#5a5a7a" }}>{plan.period}</span>
              </div>
              <ul className="flex flex-col gap-2.5 mb-7 flex-1">
                {plan.features.map((feat, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm" style={{ color: "#8888aa" }}>
                    <span style={{ color: "#7C3AED", flexShrink: 0, marginTop: 1 }}>✓</span>
                    {feat}
                  </li>
                ))}
              </ul>
              <a
                href="#"
                className="text-center py-3 rounded-xl font-bold text-sm"
                style={
                  plan.highlight
                    ? { background: "#7C3AED", color: "#fff" }
                    : {
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#ccc",
                      }
                }
              >
                {plan.cta} →
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="max-w-4xl mx-auto w-full px-6 mb-24 relative" style={{ zIndex: 2 }}>
        <div
          className="rounded-3xl p-10 sm:p-16 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(79,142,247,0.1) 100%)",
            border: "1px solid rgba(124,58,237,0.3)",
          }}
        >
          <h2
            className="text-3xl sm:text-4xl font-black text-white mb-4"
            style={{ letterSpacing: "-1.5px" }}
          >
            Udah capek nebak-nebak?
            <br />
            <span
              style={{
                background: "linear-gradient(90deg, #a78bfa, #4F8EF7)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Biar AI yang urus.
            </span>
          </h2>
          <p className="text-sm mb-8" style={{ color: "#7a7a9a" }}>
            Gratis untuk mulai. Nggak perlu kartu kredit.
          </p>
          <a
            href="#"
            className="inline-block px-10 py-4 rounded-xl font-black text-base"
            style={{ background: "#7C3AED", color: "#fff" }}
          >
            Mulai Gratis Sekarang →
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className="relative mt-auto py-8 text-center text-xs"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          color: "#2a2a4a",
          zIndex: 2,
        }}
      >
        <span className="font-bold" style={{ color: "#4a4a6a" }}>LamarAI</span>
        {" "}· brianarfi@gmail.com
      </footer>

      <style>{`
        @keyframes fall {
          0%, 100% { transform: translateY(0px); opacity: 0.4; }
          50% { transform: translateY(20px); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
