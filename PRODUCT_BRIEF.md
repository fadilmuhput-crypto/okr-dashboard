# Product Brief — OwntheWay (OTW)

> **Nama:** OwntheWay — disingkat **Ownway** atau **OTW**. Hook lokal: "OTW ke goals kamu."
> Domain available per 5 Jul 2026: **owntheway.co ✅ · ownway.co ✅ · owntheway.app ✅ · otw.co ✅ (kemungkinan premium pricing — verifikasi di registrar)**. Cek .id manual di PANDI.
>
> **Kategori:** AI Goal Execution & OKR Management Platform
> **Tagline:** Align Vision. Execute Better.
> **Visi:** Membantu individu & organisasi mengubah goals ambisius jadi eksekusi konsisten lewat AI-powered planning, alignment, dan progress tracking berkelanjutan.
> **Journey:** Vision → Strategy → OKRs → Weekly Execution → Progress Tracking → Reflection → Continuous Improvement
> **North Star Metric:** Weekly Review Completion Rate — % user aktif yang menyelesaikan weekly review.

**Terakhir diperbarui:** 5 Juli 2026

---

## 1. Ringkasan Produk

**One-liner:** Dashboard OKR gratis dengan *confidence check-in* mingguan — ukur bukan cuma progress, tapi seberapa yakin kamu mencapainya.

**Masalah yang diselesaikan:**
- OKR biasanya di-track lewat spreadsheet: angka progress terlihat sehat sampai tiba-tiba kuartal gagal
- Angka progress tidak menangkap sinyal risiko paling awal — **keyakinan orang yang mengerjakannya**
- Ritual check-in mingguan berat: menyusun laporan status manual memakan waktu, sehingga sering dilewati

**Solusi:**
- Setiap Key Result punya **skor confidence 0–1** yang diupdate tiap minggu → KR berisiko kelihatan jauh sebelum deadline
- **Director View** — satu layar untuk semua Objective, langsung terlihat mana yang aman dan mana yang perlu intervensi
- **Laporan check-in sekali klik** — markdown siap paste ke Slack/Notion/email

**Positioning:** "Kenapa bukan spreadsheet? Karena spreadsheet mencatat angka — dan melewatkan sinyal risiko paling awal: keyakinan orang yang mengerjakannya."

---

## 2. Target Audience

| Segmen | Deskripsi | Kebutuhan utama |
|--------|-----------|-----------------|
| **Personal** | Profesional/kreator/founder solo yang self-manage goals kuartalan | Struktur + kejujuran pada diri sendiri, tanpa ritual berat |
| **Team/Company** | Team lead & startup kecil (5–30 orang) yang baru adopsi OKR | Visibilitas status tanpa meeting tambahan, alignment |

**Pasar awal:** Indonesia (landing page & onboarding Bahasa Indonesia). Ekspansi global menyusul setelah validasi — versi English landing tersedia di git history (commit `0077433`).

**Jalur pertumbuhan:** personal → team. User personal yang puas mengundang timnya; fitur share/invite adalah jembatan monetisasi.

---

## 3. Fitur yang Sudah Dikembangkan

### Core (Working View)
- **Objective management** — multiple objectives per scope, scope Personal & Team terpisah
- **Key Results** (maks 5 per objective) — 2 tipe: target angka (baseline → current → target, unit bebas) dan deadline (% complete + due date)
- **Confidence slider 0–1** per KR (step 0.05) dengan status otomatis: 🟢 On Track (≥0.7) · 🟡 Watch (≥0.5) · 🔴 At Risk (<0.5)
- **Key Initiatives** per KR — driver (owner), contributors, 5 status (To Do / In Progress / On Hold / Cancelled / Done), tanggal mulai-selesai, deteksi **delayed** otomatis dari due date
- **Inline editing** di seluruh dashboard — tanpa form terpisah
- **Week selector** 1–13 (siklus kuartalan)

### Director View
- Stat cards: rata-rata confidence, jumlah KR on track / watch / at risk, initiatives delayed
- Portfolio health bar (semua KR lintas scope dalam satu visual)
- Semua Objective at a glance, klik untuk lompat ke Working View

### Check-in Generator
- Laporan markdown lengkap sekali klik: overall status per scope, progress semua KR + initiatives, daftar at-risk, daftar delayed, KR on track, template "Plan Next Week" & exec summary
- Editable sebelum copy → paste ke Slack/Notion/Sheets

### Aktivasi & Onboarding (baru)
- **Wizard 3 langkah** untuk first-time user: (1) tulis Objective + contoh chip, (2) tambah 1–3 KR terukur, (3) check-in confidence pertama dengan edukasi ("mulai di 0.5 itu sehat") — aha moment < 3 menit
- Empty state dengan 3 jalur: panduan wizard, isi manual, atau load sample data

### Distribusi
- **Landing page** Bahasa Indonesia (`/`) — hero dengan demo confidence hidup, kenapa-bukan-spreadsheet, cara kerja, FAQ ber-SEO; app di `/app`
- Mobile responsive (breakpoint 640px)
- SEO meta + OG tags

---

## 4. Arsitektur & Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 19 + Vite, inline styles, lucide-react icons |
| Data | **localStorage only** — privacy-first, tanpa akun, tanpa server |
| Hosting | Vercel (static, SPA rewrites via vercel.json) |
| Repo | github.com/fadilmuhput-crypto/okr-dashboard |

**Implikasi strategis localStorage:** friksi masuk nol (kekuatan akuisisi) tapi data terikat 1 browser (kelemahan retensi — hilang kalau ganti device/clear cache). Backend (Supabase) direncanakan di fase Retention.

---

## 5. Model Bisnis (Direncanakan — belum dibangun)

Product-Led Growth, monetisasi setelah ritual mingguan terbukti:

| Plan | Harga | Isi |
|------|-------|-----|
| **Free** | Rp 0 | 1 workspace, 3 objective aktif, history 8 minggu |
| **Pro** (personal) | ~Rp 39–49rb/bln | Unlimited objectives, history penuh, export, AI insight |
| **Team** | ~Rp 29rb/user/bln | Workspace bersama, Director View multi-user, role & permission |

Payment: Midtrans (fokus Indonesia) atau Lemon Squeezy/Paddle (kalau global).

---

## 6. Prioritas Fitur (Backlog Menuju Visi OwntheWay)

Semua prioritas diuji terhadap North Star Metric: **Weekly Review Completion Rate**.

### P0 — Fondasi Ritual (sprint 1–2)
| # | Fitur | Dampak NSM | Effort | Catatan |
|---|-------|-----------|--------|---------|
| 1 | Analytics events (Vercel Analytics + event signup/checkin) | Pengukuran | S | Tanpa ini NSM tidak terukur — kerjakan pertama |
| 2 | Supabase auth + DB + migrasi data localStorage | Enabler | L | Prasyarat reminder, history, multi-device. Import data lama wajib |
| 3 | Weekly Check-in v2: confidence slider + 3 pertanyaan (accomplished/challenges/next priorities) + riwayat per minggu | **Langsung** | M | Ini yang diukur NSM. Gabungan diferensiator lama + brief baru |

### P1 — Loop Retensi & Aktivasi (sprint 3–4)
| # | Fitur | Dampak NSM | Effort | Catatan |
|---|-------|-----------|--------|---------|
| 4 | Email reminder check-in mingguan | **Langsung** | M | Resend/Supabase; trigger ritual |
| 5 | Goal Coach v0 — rule-based (behind schedule, KR stale 14 hari, confidence turun berturut, proyeksi tak tercapai) | Tinggi | S–M | Tanpa LLM — deterministik & gratis. Alasan untuk kembali |
| 6 | AI OKR Generator di onboarding wizard | Aktivasi | M | Goal mentah → draft OKR terukur; kualitas OKR awal = retensi |
| 7 | Grafik tren confidence per KR/Objective | Tinggi | S–M | Payoff data mingguan — makin lama pakai makin berharga |

### P2 — Pertumbuhan (setelah sinyal NSM, bulan 2–3)
| # | Fitur | Catatan |
|---|-------|---------|
| 8 | Weekly Planner view (prioritas minggu ini lintas KR) | Dari brief; initiatives + week sudah ada, tinggal view |
| 9 | Shareable read-only dashboard link | Referral loop |
| 10 | Vision Builder (AI-guided: vision → annual theme → strategic priorities) | Pintu masuk journey penuh |
| 11 | Branding OTW penuh (landing, app, domain custom) | Setelah domain dibeli |

### P3 — Monetisasi & Tim (setelah retention 3-minggu ≥ 20%)
| # | Fitur | Catatan |
|---|-------|---------|
| 12 | Team workspace + goal alignment hierarchy (Company → Dept → Team → Individual) | Fitur pembeda tier Team |
| 13 | Billing (Midtrans / Lemon Squeezy) + paywall Free/Pro/Team | Sesuai tier brief |
| 14 | AI Coach layer LLM (pembungkus bahasa + rekomendasi kontekstual) | Upgrade dari rule-based v0 |
| 15 | Integrasi (Slack, Google Calendar, Notion) | Future opportunities brief |

**Gate keputusan:** jangan bangun P3 sebelum 3-week retention ≥ 20%. Kalau ritual mingguan tidak terbentuk, perbaiki P0–P1 dulu.

**Metric per fase:** visitor → signup rate → % check-in pertama (target 40%) → **Weekly Review Completion Rate** → % check-in 3 minggu berturut (target 20%) → % share/invite → free-to-paid conversion (benchmark PLG 2–5%).

---

## 7. Keputusan Terbuka

1. **Domain** — beli owntheway.co + ownway.co (murah, amankan dua-duanya); verifikasi harga otw.co (kemungkinan premium); cek owntheway.id/ownway.id/otw.id manual di registrar
2. **Bahasa UI app** — landing & wizard sudah Indonesia, dashboard masih English; putuskan: terjemahkan penuh, atau pertahankan istilah OKR English (praktik umum startup Indonesia)
3. **Model AI** — untuk AI OKR Generator & Coach LLM: mulai dari model murah/gratis (pengalaman opencode zen di mulaibaca) atau langsung Claude Haiku; tentukan budget AI credits per user free tier
4. **Kanal akuisisi pertama** — SEO template OKR Indonesia vs komunitas (Threads playbook seperti mulaibaca) vs Product Hunt

---

## 8. Diferensiator vs Kompetitor

| | Spreadsheet | Tools OKR enterprise (Perdoo, Lattice, Quantive) | **Produk ini** |
|--|-------------|--------------------------------------------------|----------------|
| Harga masuk | Gratis | $8–15/user/bln, sales call | Gratis, tanpa daftar |
| Confidence tracking | ❌ | Sebagian (fitur tersembunyi) | ✅ Fitur inti, di depan |
| Setup | Manual | Onboarding berminggu | < 3 menit |
| Laporan check-in | Manual | ✅ | ✅ Sekali klik, markdown |
| Bahasa Indonesia | — | ❌ | ✅ |

**Wedge:** kompetitor enterprise menjual ke HR/eksekutif; produk ini menyebar bottom-up dari individu yang butuh kejujuran pada goals-nya sendiri.
