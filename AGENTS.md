# AGENTS.md — Pantaura (siagakita-web)

Panduan konteks dan konvensi proyek untuk developer dan AI coding agent yang bekerja di repository `siagakita-web`.

---

## 1. Gambaran Proyek

**Pantaura** adalah backend terpusat, REST API (`/api/v1`), Public Monitoring Web, dan Admin Dashboard untuk platform pelaporan & pemantauan kejadian bencana **Pantaura**.

Dokumen referensi utama:

- Product Requirements: [`.docs/PRD.md`](.docs/PRD.md)
- Implementation Plan & Task Checklist: [`.docs/IMPLEMENTATION_PLAN.md`](.docs/IMPLEMENTATION_PLAN.md)
- Referensi UI Publik (Stitch): [`.docs/STITCH_INSTRUCTION.md`](.docs/STITCH_INSTRUCTION.md)

---

## 2. Tech Stack & Arsitektur

- **Backend:** PHP 8.3+, Laravel 13, Laravel Fortify (web auth), Laravel Sanctum (API token `/api/v1`), Laravel Wayfinder
- **Frontend:** Inertia.js v3, React 19, TypeScript, Tailwind CSS v4, `shadcn/ui` (`radix-nova`), `react-leaflet` + OpenStreetMap
- **Database & Infra:** PostgreSQL 16 (UUID primary/foreign keys), Redis 6, Docker Compose ([`docker-compose.yaml`](docker-compose.yaml), [`Makefile`](Makefile))
- **Quality & Testing:** Laravel Pint, Larastan (`phpstan`), Pest PHP, Vite+ (`vp build`, `tsc --noEmit`)

### Struktur Penting

- `app/Enums/` — Enum domain (`UserRole`, `IncidentStatus`, `ModerationStatus`, `ResolutionStatus`, `MediaType`)
- `app/Models/` — Model Eloquent dengan `HasUuids` (`User`, `Incident`, `Report`, `ReportMedia`, `ResolutionSubmission`, `ResolutionMedia`, `IncidentStatusHistory`)
- `app/Services/` — Business logic (`MediaStorageService`, `IncidentService`, `ReportService`, `ResolutionService`)
- `app/Http/Controllers/Api/V1/` — Endpoint REST API untuk aplikasi mobile (`/api/v1/*`)
- `app/Http/Controllers/Public/` — Public monitoring web (`/` dan `/incidents/{incident}`)
- `app/Http/Controllers/Admin/` — Admin dashboard (`/admin/*`, dilindungi middleware `auth`, `verified`, `admin`)
- `resources/js/pages/public/` — UI Publik (menggunakan style **Pantaura Civic Shield** dari Stitch)
- `resources/js/pages/admin/` — UI Admin Dashboard (menggunakan layout sidebar `shadcn/ui`)
- `resources/js/features/` — Komponen domain & peta (`DisasterMap`, `MediaGallery`, `StatusBadge`, `UiStates`)

---

## 3. Aturan Domain & Konvensi Kode

1. **UUID Primary Keys:** Seluruh tabel domain menggunakan `uuid('id')->primary()` dan `HasUuids`. Pastikan foreign key memakai `foreignUuid` dan Sanctum menggunakan `uuidMorphs('tokenable')`.
2. **Thin Controllers, Service Layer:**
    - Validasi input selalu menggunakan `FormRequest` (jangan pakai `$request->all()` langsung).
    - Business logic dan transaksi database (`DB::transaction`) diletakkan di `app/Services/`.
    - Respons API `/api/v1` menggunakan `JsonResource` (`app/Http/Resources/Api/V1/`).
3. **Incident Lifecycle & Grouping:**
    - Status insiden: `unverified` -> `verified` -> `resolution_submitted` -> `resolved` (atau `rejected`).
    - Insiden `rejected` disembunyikan dari peta dan API publik, tetapi tetap tersimpan di database.
    - Konsep **Multiple Reports, One Incident**: pengelompokan laporan tidak boleh menghapus data laporan asli; laporan dipindahkan `incident_id`-nya dan insiden stub kosong berstatus `unverified` dibersihkan.
    - Setiap perubahan status insiden wajib mencatat `IncidentStatusHistory`.
4. **Media Storage:**
    - Disimpan di disk `public` (`storage/app/public/reports/` dan `storage/app/public/resolutions/`).
    - Kegagalan upload atau database harus melakukan rollback atomik agar tidak ada laporan tanpa bukti.
5. **UI & Aksesibilitas:**
    - Gunakan komponen `shadcn/ui` di `resources/js/components/ui/` serta token warna & layout yang konsisten.
    - Pastikan semua halaman memiliki empty state, kontrol keyboard yang jelas, dan responsif di mobile maupun desktop.
    - Jangan menampilkan statistik atau angka fiktif tanpa sumber data dari backend.

---

## 4. Perintah Docker & Verifikasi

Gunakan [`Makefile`](Makefile) atau `docker compose` untuk menjalankan perintah backend di dalam container `web` (`pantaura.web.local`):

```bash
# Menjalankan / melihat status container
make serve
make ps

# Reset database + seeder (AdminSeeder + DummyDataSeeder)
docker compose -f docker-compose.yaml -p ${DOCKER_NAME:-local-pantaura} exec -T web php artisan migrate:fresh --seed --force

# Seeder khusus akun Admin saja (admin@pantaura.test / password)
docker compose -f docker-compose.yaml -p ${DOCKER_NAME:-local-pantaura} exec -T web php artisan db:seed --class=AdminSeeder

# Menjalankan Pint, Larastan, dan Pest test suite
docker compose -f docker-compose.yaml -p ${DOCKER_NAME:-local-pantaura} exec -T web composer test
```

Untuk build dan type-check frontend (di host):

```bash
npm run types:check
npm run build
```

---

## 5. Checklist Sebelum Selesai

Sebelum menganggap task selesai:

1. Perbarui status checklist di [`.docs/IMPLEMENTATION_PLAN.md`](.docs/IMPLEMENTATION_PLAN.md) jika ada fase/task yang dikerjakan.
2. Pastikan `composer test` (Pint, Larastan, Pest) dan `npm run types:check && npm run build` lolos tanpa error.
3. Jangan pernah melakukan commit file rahasia (`.env`, API key MCP pribadi).
