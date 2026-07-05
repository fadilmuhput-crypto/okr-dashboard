# Product Brief — OKR Dashboard

> Nama kerja. Nama final belum diputuskan — shortlist: **Arah** (arah.co ✅), **Laju** (laju.co ✅), **Tonggak** (tonggak.co ✅).

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

## 6. Roadmap & Status

| Phase | Fokus | Status |
|-------|-------|--------|
| 0 | Fondasi: mobile, landing, SEO | ✅ Selesai |
| 1 | Acquisition: SEO template pages, konten, Product Hunt | ⬜ Belum |
| 2 | Activation: onboarding wizard, aha < 3 menit | 🟡 Wizard selesai; analytics belum |
| 3 | Retention: backend Supabase, email reminder mingguan, grafik tren confidence | ⬜ Belum |
| 4 | Referral: shareable dashboard link, invite tim | ⬜ Belum |
| 5 | Revenue: paywall Pro & Team | ⬜ Belum |

**Gate keputusan:** jangan bangun fitur revenue sebelum 3-week retention ≥ 20%. Kalau ritual mingguan tidak terbentuk, perbaiki retention dulu.

**Metric per fase:** visitor → signup rate → % check-in pertama (target 40%) → % check-in 3 minggu berturut (target 20%) → % share/invite → free-to-paid conversion (benchmark PLG 2–5%).

---

## 7. Keputusan Terbuka

1. **Nama & domain** — shortlist Arah/Laju/Tonggak (semua .co available per 4 Jul 2026); VisionTrack ditolak (konflik dengan visiontrack.com, perusahaan telematics global); Searah ditolak (sudah dipakai)
2. **Bahasa UI app** — landing & wizard sudah Indonesia, dashboard masih English; putuskan: terjemahkan penuh, atau pertahankan istilah OKR English (praktik umum startup Indonesia)
3. **Analytics** — sengaja ditunda; aktifkan Vercel Analytics sebelum mulai distribusi publik agar data akuisisi tidak hilang
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
