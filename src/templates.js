// Ready-made OKR templates — users can add an objective from a template
// to their active project, then tweak to fit their own goals.

export const OKR_TEMPLATES = [
  {
    id: 'tmpl_health',
    category: 'Personal',
    name: 'Kesehatan & Kebugaran',
    desc: 'Bangun rutinitas sehat yang konsisten dan terukur.',
    objectives: [
      {
        objective: 'Bikin tubuh lebih bugar dan kuat secara konsisten',
        whyNow: 'Kesehatan adalah fondasi energi kerja dan fokus jangka panjang.',
        krs: [
          { label: 'Olahraga 4x per minggu', type: 'percent', baseline: 0, target: 100, current: 0, unit: '% minggu', confidence: 0.6, initiatives: [{ title: 'Jadwalkan lari pagi Sen/Rab/Jum', status: 'todo' }] },
          { label: 'Tidur 7+ jam per malam', type: 'percent', baseline: 0, target: 100, current: 0, unit: '% malam', confidence: 0.5, initiatives: [{ title: 'Matikan HP 30 menit sebelum tidur', status: 'todo' }] },
        ],
      },
    ],
  },
  {
    id: 'tmpl_career',
    category: 'Personal',
    name: 'Karier & Skill',
    desc: 'Naikkan nilai profesionalmu lewat skill dan portofolio.',
    objectives: [
      {
        objective: 'Jadi 2x lebih bernilai di pasar kerja',
        whyNow: 'Skill yang naik = peluang dan leverage karier yang lebih besar.',
        krs: [
          { label: 'Selesaikan 2 sertifikasi baru', type: 'percent', baseline: 0, target: 2, current: 0, unit: 'sertif', confidence: 0.5, initiatives: [{ title: 'Pilih dan daftar sertifikasi pertama', status: 'todo' }] },
          { label: 'Terbitkan 4 tulisan/portofolio publik', type: 'percent', baseline: 0, target: 4, current: 0, unit: 'tulisan', confidence: 0.6, initiatives: [{ title: 'Buat daftar topik yang akan ditulis', status: 'todo' }] },
        ],
      },
    ],
  },
  {
    id: 'tmpl_sidebusiness',
    category: 'Personal',
    name: 'Side Business',
    desc: 'Dari ide ke pendapatan pertama yang berulang.',
    objectives: [
      {
        objective: 'Bangun bisnis sampingan yang menghasilkan pendapatan berulang',
        whyNow: 'Diversifikasi pendapatan mengurangi ketergantungan pada satu sumber.',
        krs: [
          { label: 'Dapatkan 10 pelanggan pertama', type: 'percent', baseline: 0, target: 10, current: 0, unit: 'customer', confidence: 0.4, initiatives: [{ title: 'Validasi masalah dengan 10 wawancara', status: 'todo' }] },
          { label: 'Raih Rp 5 juta MRR', type: 'percent', baseline: 0, target: 5, current: 0, unit: 'jt/bulan', confidence: 0.3, initiatives: [{ title: 'Set up sistem pembayaran', status: 'todo' }] },
        ],
      },
    ],
  },
  {
    id: 'tmpl_product',
    category: 'Team',
    name: 'Product Launch',
    desc: 'Luncurkan produk baru dengan target adopsi yang jelas.',
    objectives: [
      {
        objective: 'Luncurkan produk baru yang dipakai pelanggan dengan setia',
        whyNow: 'Produk baru adalah motor pertumbuhan — adopsi awal menentukan momentum.',
        krs: [
          { label: 'Naikkan aktivasi dari 30% ke 50%', type: 'percent', baseline: 30, target: 50, current: 30, unit: '%', confidence: 0.5, initiatives: [{ title: 'Redesign alur onboarding', status: 'in_progress' }] },
          { label: 'Capai 500 user aktif mingguan', type: 'percent', baseline: 0, target: 500, current: 0, unit: 'user', confidence: 0.4, initiatives: [{ title: 'Launch campaign akuisisi pertama', status: 'todo' }] },
          { label: 'Pertahankan NPS ≥ 40', type: 'percent', baseline: 0, target: 40, current: 0, unit: 'pts', confidence: 0.6, initiatives: [{ title: 'Pasang survey in-app', status: 'todo' }] },
        ],
      },
    ],
  },
  {
    id: 'tmpl_learning',
    category: 'Personal',
    name: 'Belajar Hal Baru',
    desc: 'Kuasai keterampilan baru dengan target praktik yang nyata.',
    objectives: [
      {
        objective: 'Kuasai keterampilan baru yang membuka peluang',
        whyNow: 'Belajar terstruktur mencegah menunda dan menambah kepercayaan diri.',
        krs: [
          { label: 'Selesaikan kurikulum 8 modul', type: 'percent', baseline: 0, target: 8, current: 0, unit: 'modul', confidence: 0.6, initiatives: [{ title: 'Blokir waktu belajar 1 jam/hari', status: 'todo' }] },
          { label: 'Praktikkan skill di 3 proyek nyata', type: 'percent', baseline: 0, target: 3, current: 0, unit: 'proyek', confidence: 0.5, initiatives: [{ title: 'Cari proyek sampingan / kontribusi open source', status: 'todo' }] },
        ],
      },
    ],
  },
  {
    id: 'tmpl_finance',
    category: 'Personal',
    name: 'Keuangan Sehat',
    desc: 'Atur keuangan dengan target tabungan dan investasi.',
    objectives: [
      {
        objective: 'Bangun fondasi keuangan yang aman',
        whyNow: 'Keuangan yang rapi memberi ketenangan dan ruang untuk ambil risiko.',
        krs: [
          { label: 'Buat dana darurat 3 bulan pengeluaran', type: 'percent', baseline: 0, target: 100, current: 0, unit: '%', confidence: 0.5, initiatives: [{ title: 'Hitung biaya hidup bulanan', status: 'todo' }] },
          { label: 'Otomatiskan tabungan 20% gaji', type: 'percent', baseline: 0, target: 100, current: 0, unit: '% bulan', confidence: 0.7, initiatives: [{ title: 'Set auto-transfer ke rekening tabungan', status: 'todo' }] },
        ],
      },
    ],
  },
];
