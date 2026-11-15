# PRODUCT REQUIREMENTS DOCUMENT (PRD)
# SiagaKita
**Version:** 1.0 — MVP  
**Status:** Draft  
**Product Category:** Disaster Reporting & Monitoring Platform  
**Target Competition:** Software Development Competition  
**Supported Disasters:** Flood (primary), Earthquake, Landslide, Fire  
**Geographical Scope:** City-level  
**Target Users:** General Public, Administrators

---

# 1. Product Overview

## 1.1 Product Description

SiagaKita adalah platform pelaporan dan pemantauan kejadian bencana berbasis lokasi yang memungkinkan masyarakat melaporkan kondisi bencana secara langsung melalui aplikasi mobile.

Setiap laporan dilengkapi dengan koordinat lokasi, deskripsi kejadian, serta bukti visual berupa foto atau video.

Laporan yang masuk akan langsung ditampilkan pada peta publik dengan status verifikasi yang jelas. Administrator bertugas memeriksa validitas laporan dan mengonfirmasi kejadian.

SiagaKita juga memungkinkan masyarakat berkontribusi dalam mengonfirmasi kondisi akhir suatu kejadian bencana melalui pengiriman bukti bahwa kondisi bencana telah pulih atau kembali normal.

## 1.2 Problem Statement

Informasi mengenai kejadian bencana sering kali tersebar melalui media sosial atau komunikasi informal. Informasi tersebut belum tentu memiliki lokasi yang akurat, bukti visual yang memadai, atau status validasi yang jelas.

Hal ini menyebabkan masyarakat kesulitan memperoleh informasi kondisi bencana di suatu wilayah secara terpusat.

SiagaKita hadir untuk menyediakan sistem pelaporan dan pemantauan bencana yang menggabungkan informasi lokasi, bukti visual, kontribusi masyarakat, dan proses verifikasi administrator.

## 1.3 Product Vision

Menjadi platform informasi kejadian bencana berbasis partisipasi masyarakat yang membantu menyediakan informasi lokasi dan kondisi bencana secara transparan, terstruktur, dan dapat diverifikasi.

---

# 2. Product Goals

Tujuan utama pengembangan SiagaKita:

1. Mempermudah masyarakat melaporkan kejadian bencana berdasarkan lokasi aktual.
2. Menyediakan informasi persebaran bencana melalui peta publik.
3. Memberikan transparansi terhadap status validasi setiap kejadian.
4. Memungkinkan masyarakat berkontribusi dalam memberikan bukti kondisi bencana.
5. Menyediakan sistem verifikasi terpusat oleh administrator.
6. Menghindari duplikasi titik kejadian bencana melalui pengelompokan beberapa laporan menjadi satu insiden.

## 2.1 Success Metrics

Indikator keberhasilan MVP:

- Masyarakat dapat mengirim laporan dengan koordinat dan bukti visual.
- Laporan baru dapat langsung muncul di peta publik.
- Administrator dapat memverifikasi dan menolak laporan.
- Beberapa laporan dari lokasi kejadian yang sama dapat dikelompokkan.
- Masyarakat dapat mengirim bukti penyelesaian insiden.
- Administrator dapat mengonfirmasi penyelesaian insiden.
- Perubahan status dapat terlihat pada public web dan aplikasi mobile.

---

# 3. Target Users & Roles

SiagaKita memiliki dua peran utama.

## 3.1 Citizen (Masyarakat)

Masyarakat merupakan pengguna aplikasi mobile yang dapat:

- Membuat akun dan login.
- Melaporkan kejadian bencana.
- Mengirim lokasi kejadian.
- Mengunggah foto atau video.
- Melihat peta persebaran bencana.
- Memantau status laporan.
- Melihat detail insiden.
- Mengirim laporan tambahan pada insiden yang sudah ada.
- Mengirim bukti bahwa kondisi bencana telah pulih.

## 3.2 Administrator

Administrator merupakan pengguna dashboard web yang bertanggung jawab terhadap pengelolaan dan validasi informasi.

Administrator dapat:

- Melihat ringkasan kejadian bencana.
- Melihat seluruh laporan masyarakat.
- Memeriksa lokasi dan bukti visual.
- Memverifikasi laporan.
- Menolak laporan yang tidak valid.
- Mengelompokkan laporan yang berasal dari insiden yang sama.
- Memeriksa bukti penyelesaian.
- Mengonfirmasi penyelesaian insiden.
- Mengelola data pengguna.

## 3.3 Public Visitor

Pengunjung public web tidak diwajibkan memiliki akun.

Pengunjung dapat:

- Melihat peta persebaran bencana.
- Melihat status kejadian.
- Melihat detail insiden.
- Melihat jumlah laporan masyarakat.
- Melihat bukti yang tersedia sesuai kebijakan akses media.

---

# 4. Product Scope

Pengembangan MVP dibagi menjadi tiga bagian utama.

## 4.1 Mobile Application — Flutter

Aplikasi untuk masyarakat.

| ID | Feature | Description | Priority |
|---|---|---|---|
| MOB-01 | Authentication | Registrasi dan login pengguna | Must Have |
| MOB-02 | Home | Ringkasan informasi dan navigasi utama | Must Have |
| MOB-03 | Disaster Map | Menampilkan persebaran insiden bencana | Must Have |
| MOB-04 | Create Report | Membuat laporan kejadian bencana | Must Have |
| MOB-05 | GPS Location | Mengambil koordinat lokasi pengguna | Must Have |
| MOB-06 | Media Upload | Mengunggah foto dan video | Must Have |
| MOB-07 | Report Detail | Melihat detail laporan dan insiden | Must Have |
| MOB-08 | Report Status | Memantau status laporan | Must Have |
| MOB-09 | Resolution Submission | Mengirim bukti kondisi bencana telah pulih | Must Have |
| MOB-10 | Additional Report | Memberikan laporan tambahan pada insiden yang sama | Must Have |
| MOB-11 | Report History | Melihat riwayat kontribusi pengguna | Should Have |

## 4.2 Web Application — Inertia + React

Web application mencakup dua area: administrator dan public monitoring.

### A. Admin Dashboard

| ID | Feature | Description | Priority |
|---|---|---|---|
| ADM-01 | Admin Authentication | Login administrator | Must Have |
| ADM-02 | Dashboard Overview | Ringkasan jumlah insiden dan laporan | Must Have |
| ADM-03 | Report Management | Melihat dan mengelola laporan masuk | Must Have |
| ADM-04 | Report Verification | Memverifikasi atau menolak laporan | Must Have |
| ADM-05 | Incident Management | Mengelola insiden bencana | Must Have |
| ADM-06 | Report Grouping | Mengelompokkan laporan yang berkaitan | Must Have |
| ADM-07 | Resolution Verification | Memverifikasi bukti penyelesaian | Must Have |
| ADM-08 | User Management | Melihat dan mengelola pengguna | Should Have |

### B. Public Monitoring Web

| ID | Feature | Description | Priority |
|---|---|---|---|
| PUB-01 | Public Map | Menampilkan titik insiden bencana | Must Have |
| PUB-02 | Incident Status | Menampilkan status setiap insiden | Must Have |
| PUB-03 | Incident Detail | Melihat detail kejadian | Must Have |
| PUB-04 | Report Count | Menampilkan jumlah laporan pada insiden | Must Have |
| PUB-05 | Evidence Viewer | Melihat bukti foto/video yang dapat diakses publik | Must Have |
| PUB-06 | Status Filter | Memfilter insiden berdasarkan status | Should Have |

---

# 5. Core Business Process

## 5.1 Disaster Reporting Process

1. Masyarakat membuka aplikasi SiagaKita.
2. Pengguna memilih fitur pelaporan bencana.
3. Aplikasi mengambil koordinat GPS.
4. Pengguna mengisi deskripsi kejadian.
5. Pengguna mengunggah foto atau video sebagai bukti.
6. Pengguna mengirim laporan.
7. Backend menyimpan laporan.
8. Sistem membuat insiden baru atau menandai laporan sebagai kandidat untuk dikelompokkan dengan insiden yang sudah ada.
9. Laporan atau insiden ditampilkan di peta publik dengan status yang sesuai.
10. Administrator memeriksa laporan.
11. Administrator memverifikasi atau menolak laporan.

**Business Rule:**

- Lokasi laporan wajib tersedia.
- Bukti foto atau video wajib disertakan.
- Deskripsi kejadian wajib diisi.
- Laporan baru harus dapat dilihat publik sebelum diverifikasi.
- Laporan yang belum diverifikasi harus memiliki penanda yang berbeda dari laporan terverifikasi.
- Pengiriman laporan tidak otomatis berarti kejadian sudah valid.

## 5.2 Incident Grouping Process

Satu kejadian bencana dapat dilaporkan oleh beberapa orang.

Untuk menghindari duplikasi titik pada peta, SiagaKita menerapkan konsep:

**Multiple Reports, One Incident.**

Contoh:

Tiga warga melaporkan bencana di Jalan Ahmad Yani.

- Warga A melaporkan bencana di depan minimarket.
- Warga B melaporkan genangan di jalan yang sama.
- Warga C melaporkan air mulai memasuki permukiman.

Ketiga laporan tersebut dapat dikelompokkan menjadi satu insiden.

### Business Rules

1. Setiap laporan tetap disimpan sebagai data tersendiri.
2. Laporan tidak boleh dihapus hanya karena dikelompokkan.
3. Setiap laporan mempertahankan identitas pelapor, waktu, koordinat, deskripsi, dan bukti.
4. Sistem dapat memberikan rekomendasi laporan serupa berdasarkan kedekatan lokasi, waktu, dan konteks kejadian.
5. Pengelompokan akhir dilakukan oleh administrator.
6. Satu insiden dapat memiliki banyak laporan.
7. Peta publik menampilkan satu titik untuk satu insiden, disertai jumlah laporan yang tergabung.

**Catatan:** Kedekatan koordinat saja tidak cukup untuk menentukan bahwa dua laporan merupakan kejadian yang sama.

## 5.3 Resolution Submission Process

SiagaKita memungkinkan masyarakat melaporkan bahwa suatu insiden bencana telah selesai.

Berbeda dengan laporan awal, bukti penyelesaian dapat dikirim oleh warga lain, tidak harus pelapor pertama.

### Flow

1. Masyarakat membuka detail insiden.
2. Pengguna memilih fitur pelaporan kondisi selesai.
3. Pengguna mengambil foto atau video terbaru.
4. Pengguna menambahkan deskripsi kondisi terkini.
5. Pengguna mengirim bukti penyelesaian.
6. Sistem menyimpan bukti dan mengubah status insiden menjadi `resolution_submitted`.
7. Administrator memeriksa bukti.
8. Administrator menerima atau menolak pengajuan penyelesaian.
9. Jika diterima, status berubah menjadi `resolved`.
10. Jika ditolak, status kembali menjadi `verified`.

### Business Rules

- Semua pengguna masyarakat yang terautentikasi dapat mengajukan penyelesaian.
- Bukti visual wajib disertakan.
- Bukti penyelesaian harus merupakan bukti kondisi terkini.
- Pengajuan penyelesaian tidak langsung mengubah status menjadi selesai.
- Administrator memiliki keputusan akhir.
- Riwayat bukti awal dan bukti penyelesaian harus tetap tersimpan.
- Insiden yang telah selesai tetap dapat dilihat di peta publik.

---

# 6. Incident Lifecycle & Status Management

Status berikut digunakan pada tingkat insiden.

| Status | Description | Public Visibility |
|---|---|---|
| `unverified` | Insiden baru, menunggu verifikasi | Visible |
| `verified` | Insiden telah dikonfirmasi admin | Visible |
| `resolution_submitted` | Bukti penyelesaian sedang diperiksa | Visible |
| `resolved` | Insiden telah dinyatakan selesai | Visible |
| `rejected` | Insiden dinyatakan tidak valid | Hidden from active incident map; retained in history |

### Status Transition

`unverified` → `verified` → `resolution_submitted` → `resolved`

Penolakan:
- `unverified` → `rejected`
- `resolution_submitted` → `verified`

Catatan: Pengelolaan laporan tambahan dalam satu insiden tidak otomatis mengubah status insiden. Administrator perlu memeriksa kontribusi tambahan tersebut sesuai kebutuhan.

---

# 7. Functional Requirements

## FR-01: User Authentication

Sistem harus menyediakan autentikasi untuk masyarakat dan administrator.

Persyaratan:
- Masyarakat dapat melakukan registrasi.
- Masyarakat dapat login dan logout.
- Administrator memiliki akses dashboard berdasarkan role.
- Endpoint mobile menggunakan autentikasi API token.

## FR-02: Location Management

Sistem harus dapat menyimpan lokasi kejadian.

Persyaratan:
- Aplikasi meminta izin akses GPS.
- Koordinat latitude dan longitude disimpan.
- Pengguna dapat menyesuaikan pin lokasi apabila GPS kurang akurat.
- Lokasi menjadi bagian wajib dari laporan.

## FR-03: Media Management

Sistem harus mendukung upload foto dan video.

Persyaratan:
- Mendukung format media yang ditentukan aplikasi.
- Memvalidasi MIME type dan ukuran file.
- Menyimpan file menggunakan Laravel Filesystem.
- Menyimpan path media dalam database.
- Memisahkan bukti awal dan bukti penyelesaian.
- File tidak boleh dieksekusi sebagai kode.
- Akses media harus mengikuti kebijakan privasi dan hak akses.

## FR-04: Public Monitoring

Sistem harus menampilkan persebaran insiden bencana.

Persyaratan:
- Menampilkan titik berdasarkan koordinat insiden.
- Menampilkan status melalui warna atau simbol berbeda.
- Menampilkan jumlah laporan dalam satu insiden.
- Menyediakan detail ketika titik dipilih.
- Menampilkan laporan yang belum diverifikasi dengan label yang jelas.

## FR-05: Verification

Administrator harus dapat melakukan pemeriksaan laporan.

Persyaratan:
- Melihat informasi pelapor.
- Melihat lokasi kejadian.
- Melihat deskripsi.
- Melihat foto/video.
- Menyetujui atau menolak laporan.
- Menyimpan identitas admin dan waktu keputusan.

## FR-06: Incident Grouping

Administrator harus dapat mengelompokkan beberapa laporan menjadi satu insiden.

Persyaratan:
- Memilih laporan yang memiliki keterkaitan.
- Menghubungkan laporan dengan insiden.
- Mempertahankan seluruh data laporan.
- Mencegah satu laporan masuk ke beberapa insiden sekaligus.
- Memperbarui jumlah laporan pada insiden.

## FR-07: Resolution Verification

Administrator harus dapat memverifikasi bukti penyelesaian.

Persyaratan:
- Melihat bukti terbaru.
- Melihat informasi pengirim.
- Menerima atau menolak pengajuan.
- Menyimpan riwayat keputusan.
- Memperbarui status insiden.

---

# 8. Data Model Overview

Berikut gambaran entitas utama yang diperlukan.

## 8.1 Users

Menyimpan informasi pengguna.

Fields:
- id
- name
- email
- password
- role
- created_at
- updated_at

Role:
- citizen
- admin

## 8.2 Incidents

Merepresentasikan satu kejadian bencana.

Fields:
- id
- title
- description
- latitude
- longitude
- address
- status
- verified_by
- verified_at
- resolved_at
- created_at
- updated_at

## 8.3 Reports

Merepresentasikan kontribusi laporan dari masing-masing warga.

Fields:
- id
- incident_id (nullable saat belum dikelompokkan)
- user_id
- description
- latitude
- longitude
- submitted_at
- moderation_status
- created_at
- updated_at

## 8.4 Report Media

Menyimpan bukti visual laporan.

Fields:
- id
- report_id
- file_path
- file_type
- original_filename
- file_size
- created_at

## 8.5 Resolution Submissions

Menyimpan pengajuan bukti penyelesaian insiden.

Fields:
- id
- incident_id
- user_id
- description
- status
- reviewed_by
- reviewed_at
- created_at
- updated_at

## 8.6 Resolution Media

Menyimpan foto/video bukti penyelesaian.

Fields:
- id
- resolution_submission_id
- file_path
- file_type
- file_size
- created_at

## 8.7 Incident Status History

Mencatat perubahan status insiden.

Fields:
- id
- incident_id
- previous_status
- new_status
- changed_by
- reason
- created_at

Catatan: Struktur ini merupakan rancangan awal. Relasi, constraint, indeks geografis, dan kebutuhan audit akan disempurnakan saat perancangan database.

---

# 9. Technical Architecture

SiagaKita menggunakan dua repository utama.

## 9.1 Repository: siagakita-web

Stack:
- Laravel 13
- Inertia.js
- React
- TypeScript
- Tailwind CSS
- PostgreSQL (pilihan yang direkomendasikan)
- PostGIS (direkomendasikan untuk query geografis)
- Laravel Sanctum
- React Leaflet
- OpenStreetMap
- Laravel Filesystem

Responsibilities:
- REST API.
- Admin dashboard.
- Public monitoring web.
- Authentication.
- Business logic.
- Database management.
- Media storage.
- Verification process.
- Incident grouping.

## 9.2 Repository: siagakita-mobile

Stack:
- Flutter
- Dart
- Riverpod
- Dio
- flutter_map
- OpenStreetMap
- GPS/location services
- Image picker and camera integration

Responsibilities:
- Citizen authentication.
- Multi-disaster reporting (flood, earthquake, landslide, fire).
- GPS location.
- Photo/video upload.
- Incident monitoring.
- Report history.
- Resolution submission.

## 9.3 API Architecture

Laravel menjadi satu-satunya backend untuk kedua aplikasi.

API menggunakan versioning:

`/api/v1`

Contoh endpoint awal:

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Registrasi warga |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/logout` | Logout |
| GET | `/api/v1/incidents` | Daftar insiden |
| GET | `/api/v1/incidents/{id}` | Detail insiden |
| POST | `/api/v1/reports` | Membuat laporan |
| GET | `/api/v1/reports/my` | Riwayat laporan |
| POST | `/api/v1/incidents/{id}/reports` | Laporan tambahan |
| POST | `/api/v1/incidents/{id}/resolutions` | Mengajukan penyelesaian |
| GET | `/api/v1/incidents/map` | Data peta insiden |

Endpoint administratif dikelola melalui route web dan/atau API khusus dengan middleware role administrator.

Spesifikasi request, response, validation, dan error code akan ditentukan dalam API Specification terpisah.

## 9.4 Media Storage

Untuk MVP, file disimpan menggunakan Laravel Local Storage.

Direktori:

`storage/app/public/reports/`

`storage/app/public/resolutions/`

Database hanya menyimpan metadata dan path file.

Storage harus menggunakan persistent volume ketika deployment agar file tidak hilang saat aplikasi diperbarui.

---

# 10. Non-Functional Requirements

## Performance
- Halaman utama harus dapat dibuka dengan waktu respons yang wajar.
- Peta tidak boleh mengambil seluruh data media sekaligus.
- Data peta menggunakan pagination atau viewport-based loading apabila diperlukan.
- Upload media harus memiliki batas ukuran file.

## Security
- Password disimpan menggunakan hashing.
- Endpoint yang membutuhkan autentikasi harus dilindungi.
- Role administrator dan masyarakat harus dipisahkan.
- Validasi file dilakukan di backend.
- Media dan informasi pribadi tidak boleh terekspos tanpa kontrol akses.
- Setiap keputusan verifikasi memiliki catatan audit.

## Reliability
- Kegagalan upload tidak boleh membuat laporan tersimpan sebagai laporan lengkap tanpa bukti.
- Perubahan status harus dilakukan secara konsisten.
- Riwayat status tidak boleh hilang.
- Sistem harus menangani kegagalan koneksi API.

## Usability
- Form pelaporan harus sederhana.
- Penggunaan GPS harus mudah dipahami.
- Status laporan harus terlihat jelas.
- Peta harus mudah digunakan pada perangkat mobile maupun desktop.

---

# 11. MVP Exclusions

Fitur berikut tidak termasuk dalam pengembangan MVP kompetisi:

- Prediksi banjir menggunakan AI atau machine learning.
- Integrasi sensor IoT.
- Sistem relawan dan manajemen relawan.
- Donasi dan bantuan logistik.
- Chat antarwarga.
- Sistem navigasi evakuasi.
- Integrasi API eksternal untuk data cuaca.
- Push notification kompleks.
- Analisis prediktif dan forecasting.
- Multi-city management.

Fokus utama tetap pada pelaporan, pemantauan, pengelompokan insiden, dan verifikasi.

---

# 12. Acceptance Criteria

MVP dianggap berhasil apabila skenario berikut dapat berjalan.

### Scenario 1: Citizen Creates a Disaster Report
- Pengguna berhasil login.
- Pengguna mengirim lokasi GPS.
- Pengguna mengisi deskripsi.
- Pengguna melampirkan foto atau video.
- Laporan berhasil disimpan.
- Laporan muncul di peta publik dengan status `unverified`.

### Scenario 2: Admin Verifies a Report
- Admin berhasil login.
- Admin membuka daftar laporan.
- Admin memeriksa bukti.
- Admin memverifikasi laporan.
- Status insiden berubah menjadi `verified`.
- Public web menampilkan status terbaru.

### Scenario 3: Multiple Citizens Report the Same Incident
- Dua atau lebih warga mengirim laporan di lokasi kejadian yang sama atau berdekatan.
- Sistem dapat memberikan rekomendasi laporan yang berpotensi sama.
- Admin dapat mengelompokkan laporan tersebut.
- Semua data laporan tetap tersimpan.
- Public map menampilkan satu titik insiden dengan jumlah laporan yang sesuai.

### Scenario 4: Citizen Submits Resolution Evidence
- Pengguna membuka detail insiden.
- Pengguna mengirim foto/video kondisi terbaru.
- Pengajuan berhasil disimpan.
- Status berubah menjadi `resolution_submitted`.
- Admin dapat memeriksa bukti.

### Scenario 5: Admin Approves Resolution
- Admin memeriksa bukti penyelesaian.
- Admin menyetujui pengajuan.
- Status berubah menjadi `resolved`.
- Insiden tetap dapat dilihat di peta publik sebagai insiden selesai.

### Scenario 6: Admin Rejects Resolution
- Admin menolak bukti penyelesaian.
- Admin memberikan alasan penolakan.
- Status insiden kembali menjadi `verified`.
- Riwayat pengajuan dan alasan penolakan tetap tersimpan.

---

# 13. Development Milestones

Pengembangan direkomendasikan dalam beberapa tahap.

| Phase | Scope | Deliverables |
|---|---|---|
| Phase 1 | Foundation | Setup repository, database, authentication |
| Phase 2 | Backend Core | Reports, incidents, media upload, API |
| Phase 3 | Mobile Reporting | Flutter authentication dan pelaporan |
| Phase 4 | Web Monitoring | Public map dan incident detail |
| Phase 5 | Admin Management | Verification dan incident grouping |
| Phase 6 | Resolution Flow | Submission dan verification penyelesaian |
| Phase 7 | Integration & Testing | Integrasi mobile-web, QA, bug fixing |
| Phase 8 | Deployment | Deployment MVP untuk demonstrasi kompetisi |

Tahapan dapat dikerjakan secara paralel setelah API contract tersedia.

---

# 14. Product Constraints & Assumptions

1. SiagaKita dikembangkan untuk kebutuhan kompetisi software development.
2. Tahap MVP mendukung empat jenis bencana: banjir, gempa bumi, tanah longsor, dan kebakaran.
3. Cakupan geografis menggunakan tingkat kota.
4. Masyarakat menjadi target pengguna utama.
5. Semua laporan awal tetap terlihat di peta publik meskipun belum diverifikasi.
6. Administrator bertanggung jawab terhadap keputusan validasi.
7. Masyarakat lain dapat memberikan bukti penyelesaian insiden.
8. Satu insiden dapat memiliki beberapa laporan warga.
9. Repository web dan mobile dipisahkan.
10. Media disimpan secara lokal menggunakan Laravel Storage.
11. Laravel menjadi backend terpusat untuk seluruh client.
12. Pengembangan harus memprioritaskan fitur inti daripada kompleksitas tambahan.

---

# 15. Open Product Decisions

Beberapa keputusan berikut masih perlu difinalisasi sebelum development:

| Topic | Current Recommendation | Status |
|---|---|---|
| Database | PostgreSQL + PostGIS | Pending |
| Citizen registration | Account-based reporting | Proposed |
| GPS fallback | Manual pin adjustment | Proposed |
| Incident grouping | Admin-assisted grouping | Agreed |
| Resolution submission | Any authenticated citizen | Agreed |
| Resolution approval | Admin verification | Agreed |
| Media storage | Laravel Local Storage | Agreed |
| Web/mobile repositories | Separate repositories | Agreed |
| API documentation | OpenAPI / Swagger | Proposed |
| Notification | Basic in-app status refresh | Proposed |

---

# 16. Final Product Definition

SiagaKita adalah platform pelaporan dan pemantauan bencana berbasis lokasi yang menghubungkan masyarakat dan administrator melalui sistem informasi kejadian yang terpusat.

Produk terdiri dari:

**1. SiagaKita Mobile**

Aplikasi Flutter untuk masyarakat dalam melaporkan bencana, mengirim bukti visual, memantau insiden, dan mengonfirmasi kondisi bencana telah pulih.

**2. SiagaKita Web**

Aplikasi Laravel, Inertia, dan React yang menyediakan dashboard administrator serta peta pemantauan publik.

**Core Product Value:**

- Community-based reporting.
- Location-based incident monitoring.
- Evidence-based verification.
- Multiple reports, one incident.
- Community-supported resolution reporting.

**Prinsip utama SiagaKita:**

Setiap informasi kejadian bencana dapat berasal dari masyarakat, setiap laporan memiliki bukti dan lokasi, dan setiap status kejadian memiliki proses verifikasi yang jelas.

---

**End of PRD — SiagaKita MVP v1.0**
