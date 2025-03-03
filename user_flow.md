<!-- user_flow.md -->
# User Flow Portal Berita

## 1. Pengunjung Umum
- **Beranda:** 
  - Pengunjung membuka halaman utama dan melihat berita unggulan.
  - Dari sini, mereka dapat klik ke artikel, pilih kategori, atau melakukan pencarian.
- **Artikel:** 
  - Setelah klik, pengguna diarahkan ke halaman detail artikel.
  - Di sini terdapat opsi untuk membaca lebih lanjut, melihat komentar, dan berbagi ke media sosial.
- **Kategori & Pencarian:** 
  - Pengguna dapat memilih kategori tertentu atau menggunakan fitur pencarian untuk menemukan berita sesuai minat.

## 2. Pengguna Terdaftar
- **Login/Register:**
  - Pengguna terdaftar melakukan login untuk mengakses fitur personalisasi dan kolom komentar.
- **Interaksi:**
  - Setelah login, pengguna dapat berkomentar, menyukai artikel, dan berbagi.
  
## 3. Admin / Redaksi
- **Dashboard Admin:**
  - Admin mengakses dashboard untuk mengelola artikel, melihat statistik, dan mengatur jadwal publikasi.
  - Melakukan edit, hapus, atau tambah artikel.
  
## Diagram User Flow (Menggunakan Mermaid)

```mermaid
flowchart TD
    A[Beranda] --> B[Klik Artikel]
    A --> C[Pilih Kategori]
    A --> D[Pencarian]
    D --> E[Hasil Pencarian]
    B --> F[Halaman Artikel]
    F --> G[Komentar & Share]
    A --> H[Login/Register]
    H --> I[Dashboard Pengguna]
    I --> J[Komentar / Personalisasi]
    I --> K[Dashboard Admin]
