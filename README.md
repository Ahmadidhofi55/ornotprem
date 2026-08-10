# 🚀 ORNOT PREM - Platform Jual Beli Akun Premium Otomatis

**Ornot Prem** adalah platform e-commerce berbasis web modern yang dirancang untuk melayani pembelian dan penjualan akun digital premium (seperti Netflix, Spotify, Canva Pro, YouTube Premium, dll) secara otomatis, aman, cepat, dan terpercaya 24/7.

Website ini dikembangkan menggunakan teknologi *stack* modern dan terhubung langsung dengan pusat layanan API Premku serta basis data Supabase.

---

## 🛠️ Tech Stack (Teknologi yang Digunakan)

* **Framework:** [Next.js](https://nextjs.org/) (App Router, Server-Side Rendering)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Database & Auth:** [Supabase](https://supabase.com/)
* **API Integrations:** Premku API (Product Fetching & Order Automation)
* **Language:** TypeScript & JavaScript

---

## ✨ Fitur Utama

* **Katalog Produk Dinamis:** Pengelompokan kategori otomatis (*Stream & Media, Design & Edit, Apps & Tools*) serta fitur pencarian instan.
* **Sistem Margin Harga Dinamis:** Pengaturan margin keuntungan *reseller* yang terhubung langsung dan dikontrol melalui tabel *settings* di database Supabase.
* **Pricelist Table:** Halaman daftar harga lengkap berbentuk tabel interaktif yang sangat ramah bagi para *reseller*.
* **Sistem Pembayaran & Invoice Otomatis:** Integrasi QRIS dan pengecekan mutasi/status pembayaran secara berkala (*auto-sync polling*).
* **Cek Status Pesanan:** Fitur pelacakan riwayat transaksi dan pengambilan kredensial akun menggunakan nomor *invoice*.
* **Manajemen Pengguna & Admin Panel:** Sistem otentikasi berbasis *role* (Admin & Member) dengan fitur top-up saldo dan dasbor pesanan.
* **Optimasi SEO Maksimal:** Dilengkapi dengan *Dynamic Metadata*, *Sitemap*, *Robots.txt*, dan *Schema Markup (JSON-LD)* agar mudah terindeks oleh Google.

---

## 📂 Struktur Direktori Proyek

```text
├── app/
│   ├── [slug]/             # Halaman detail produk dinamis
│   ├── admin/              # Panel khusus administrator
│   ├── api/                # Backend API Routes (Checkout, Check Payment, dll)
│   ├── cek-pesanan/        # Halaman pelacakan status pesanan
│   ├── checkout/           # Halaman proses transaksi & pembayaran
│   ├── dashboard/          # Area member (Order baru, Riwayat, Saldo)
│   ├── invoice/[id]/       # Halaman tagihan QRIS & status otomatis
│   ├── login / register/   # Autentikasi pengguna
│   ├── price-list/         # Halaman daftar harga lengkap
│   ├── about/              # Halaman Tentang Kami
│   ├── kontak/             # Pusat bantuan & layanan pelanggan
│   ├── syarat-ketentuan/   # Syarat & Ketentuan Layanan (TOS)
│   ├── kebijakan-privasi/  # Kebijakan Privasi
│   ├── layout.tsx          # Root Layout & SEO Global
│   ├── page.tsx            # Halaman Utama (Beranda)
│   ├── sitemap.ts          # Peta situs otomatis untuk Google
│   └── robots.ts           # Pengaturan perayap mesin pencari
├── components/             # Komponen modular (Navbar, Footer, dll)
└── public/                 # Aset gambar & ikon