# Jahit Online

**Sehelai** adalah aplikasi pemesanan jasa jahit dengan ukuran personal, foto referensi privat, penawaran final yang disetujui pelanggan, serta proses produksi yang dapat dipantau.

## Fitur

- Landing page dan katalog layanan tailoring dengan foto ilustrasi yang disimpan lokal.
- Registrasi/login pelanggan dan akun petugas terpisah.
- Pemesanan layanan, jumlah pakaian, pilihan kain/detail, enam ukuran pakaian, catatan, dan target tanggal selesai.
- Unggahan referensi JPG/PNG/WebP maksimal 3 MB, disimpan privat dan hanya dapat diakses pemilik pesanan serta petugas.
- Estimasi dihitung server berdasarkan layanan, tambahan kain/detail, dan jumlah pakaian.
- Petugas mengirim harga total final, jadwal, serta rincian penawaran. Pelanggan menyetujuinya sebelum produksi.
- Persetujuan memeriksa versi penawaran; harga yang sudah disepakati tidak bisa diubah melalui alur penawaran.
- Status: diterima → penawaran → disepakati → pemotongan → penjahitan → fitting → selesai.
- Pembatalan oleh pelanggan sebelum persetujuan produksi, riwayat aktivitas, dan filter status pesanan.
- Invoice dengan tampilan cetak, pembayaran manual, validasi input, pembatasan request, dan akses pesanan per pemilik.

## Teknologi

Laravel 13, React 19, TypeScript, Inertia.js 3, Tailwind CSS 4, Vite 7, SQLite, PHPUnit, dan Playwright. Memerlukan PHP 8.3+ serta Node.js 22.12+. Versi dependensi dikunci melalui lockfile.

## Instalasi dan menjalankan

```powershell
composer install
Copy-Item .env.example .env
php artisan key:generate
New-Item -ItemType File database/database.sqlite -ErrorAction SilentlyContinue
php artisan migrate --seed
npm ci
npm run build
php artisan staff:create
php artisan serve --host=127.0.0.1 --port=8031
```

Buka `http://127.0.0.1:8031`. Pelanggan dapat mendaftar sendiri. `staff:create` meminta nama, email, dan kata sandi minimal 12 karakter; tidak ada akun atau password bawaan. Seeder membuat tiga layanan contoh tanpa pesanan maupun pembayaran fiktif. Jalankan `npm run dev` di terminal terpisah untuk pengembangan frontend.

Database aplikasi berada di `database/database.sqlite`. Foto referensi berada di disk lokal privat `storage/app/private`. Keduanya diabaikan Git. Jangan membuat symlink folder privat ke direktori publik. Untuk MySQL, buat database baru khusus proyek lalu sesuaikan `DB_*` sebelum migrasi.

## Penggunaan

Pelanggan memilih layanan dan mengisi ukuran dalam sentimeter. Pilihan kain atelier menambah Rp150.000 per pakaian; detail tambahan menambah Rp60.000 per pakaian. Nilai ini merupakan estimasi awal. Petugas meninjau ukuran, referensi, dan kebutuhan, lalu mengirim penawaran total serta jadwal selesai. Pelanggan menyetujui versi penawaran yang dilihatnya.

Petugas memperbarui produksi secara berurutan. Sebelum menandai selesai, petugas harus mencatat bahwa pembayaran benar-benar telah diterima. Konfirmasi ini adalah pencatatan manual, tidak memproses bank atau payment gateway. Gunakan **Lihat invoice → Cetak invoice** untuk mencetak atau menyimpan PDF melalui fasilitas browser.

Ukuran pada formulir ditujukan bagi pakaian dewasa. Penjahit tetap perlu mengonfirmasi ukuran dan detail desain sebelum pemotongan kain. Jadwal awal adalah permintaan pelanggan; jadwal final ditetapkan pada penawaran yang disepakati.

## Pengujian

```powershell
php artisan route:list --except-vendor
php artisan test
npm run build
npm run test:e2e
```

PHPUnit menggunakan SQLite dalam memori. Playwright memakai Microsoft Edge yang terpasang, port 8032, akun sementara berkata sandi acak, dan database `database/.browser-test.sqlite` khusus pengujian. Database aplikasi tidak dipakai tes. Screenshot/trace berada di `test-results/` yang diabaikan Git; tidak disertakan dalam repository.

Tes mencakup estimasi server, validasi ukuran/tanggal/unggahan, akses foto dan invoice, persetujuan penawaran, perubahan versi, tahapan produksi, pembatalan, pembayaran, serta viewport desktop/tablet/ponsel. Pengujian viewport bukan pengujian perangkat fisik.

## Catatan operasional

Gunakan HTTPS, `APP_DEBUG=false`, akun petugas terpercaya, document root `public/`, dan pencadangan database/foto privat untuk penggunaan operasional. Ganti layanan, harga, dan foto ilustrasi dengan informasi bisnis yang sebenarnya. Foto bersumber dari Unsplash; tautan ada di `public/images/SOURCES.md`. Maksimal 300 baris per berkas kode aplikasi. Kredensial, database, hasil build, dependensi lokal, dan screenshot tidak masuk repository.
