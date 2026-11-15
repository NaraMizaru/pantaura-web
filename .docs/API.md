# SiagaKita REST API Documentation (`v1`)

Dokumentasi resmi untuk REST API `/api/v1` platform pelaporan dan pemantauan bencana **SiagaKita**.

- **Base URL (Local Docker):** `http://localhost:8080/api/v1`
- **Interactive Swagger UI:** [`/api/docs`](http://localhost:8080/api/docs)
- **OpenAPI 3.0.3 Spec:** [`public/docs/openapi.yaml`](../public/docs/openapi.yaml)
- **Format Request/Response:** `application/json` (atau `multipart/form-data` untuk endpoint unggah media)
- **Primary Key:** Seluruh ID entitas menggunakan **UUID v4** (`string`).

---

## 1. Autentikasi (Laravel Sanctum)

Endpoint yang membutuhkan autentikasi menggunakan **Bearer Token** dari Laravel Sanctum pada header `Authorization`:

```http
Authorization: Bearer <token>
Accept: application/json
```

- Token diperoleh melalui `POST /api/v1/auth/register` atau `POST /api/v1/auth/login`.
- Registrasi publik selalu menetapkan role akun sebagai `citizen` di sisi server.
- Endpoint `POST /api/v1/auth/register` dan `POST /api/v1/auth/login` dibatasi `throttle:10,1` (maksimal 10 permintaan per menit).

---

## 2. Format Error & Status HTTP

Semua request ke `/api/*` otomatis merender respons JSON:

| Status Code | Keterangan | Contoh Bentuk Respons |
|---|---|---|
| `200` / `201` | Berhasil / Resource terbuat | `{ "data": ... }` atau `{ "message": ..., "data": ... }` |
| `401` | Belum terautentikasi / token tidak valid | `{ "message": "Unauthenticated." }` |
| `404` | Insiden tidak ditemukan atau berstatus `rejected` | `{ "message": "..." }` |
| `422` | Validasi input gagal atau aturan status bisnis ditolak | `{ "message": "...", "errors": { "field": ["..."] } }` |
| `429` | Rate limit terlampaui (`throttle:10,1` pada auth) | `{ "message": "Too Many Attempts." }` |

---

## 3. Daftar Endpoint

### Auth

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| `POST` | `/auth/register` | Public (`throttle:10,1`) | Registrasi akun `citizen` baru + kembalikan token |
| `POST` | `/auth/login` | Public (`throttle:10,1`) | Login email & password + kembalikan token |
| `POST` | `/auth/logout` | Bearer Token | Cabut token Sanctum yang sedang aktif |
| `GET` | `/auth/me` | Bearer Token | Ambil profil user yang sedang login |

### Incidents (Public Monitoring)

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| `GET` | `/incidents` | Public | Daftar insiden terpaginasi (opsional `?status=`, `?page=`) |
| `GET` | `/incidents/map` | Public | Daftar marker insiden untuk peta (opsional `?status=`) |
| `GET` | `/incidents/{incident}` | Public | Detail insiden, laporan terkait, resolusi, & riwayat status |

> Insiden berstatus `rejected` tidak pernah ditampilkan di endpoint publik (`index`, `map`, maupun `show`).

### Reports & Resolutions (Authenticated)

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| `POST` | `/reports` | Bearer Token | Kirim laporan bencana baru + 1–5 file media bukti |
| `GET` | `/reports/my` | Bearer Token | Daftar terpaginasi laporan milik user yang login |
| `POST` | `/incidents/{incident}/reports` | Bearer Token | Tambah laporan baru ke insiden aktif yang sudah ada |
| `POST` | `/incidents/{incident}/resolutions` | Bearer Token | Ajukan bukti penyelesaian/kondisi pulih untuk insiden |

---

## 4. Contoh Penggunaan

### Registrasi & Login (cURL)

```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Budi Santoso",
    "email": "budi@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "device_name": "Android App"
  }'
```

### Mengirim Laporan Bencana Baru (`multipart/form-data`)

Aturan validasi `POST /api/v1/reports`:
- `disaster_type`: opsional, salah satu `flood`, `earthquake`, `landslide`, `fire` (default `flood`)
- `latitude`: wajib, numerik antara `-90` hingga `90`
- `longitude`: wajib, numerik antara `-180` hingga `180`
- `description`: wajib, string `10`–`2000` karakter
- `address`: opsional, string maksimal `255` karakter
- `media[]`: wajib, array `1`–`5` file (`image/jpeg`, `image/png`, `image/webp`, `video/mp4`, `video/quicktime`), maksimal `20480` KB (20 MB) per file

```bash
curl -X POST http://localhost:8080/api/v1/reports \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_SANCTUM_TOKEN" \
  -F "disaster_type=flood" \
  -F "latitude=-6.208763" \
  -F "longitude=106.845599" \
  -F "address=Jl. Jenderal Sudirman, Jakarta Pusat" \
  -F "description=Genangan air setinggi 50 cm menutupi lajur kiri jalan." \
  -F "media[]=@/path/to/foto-banjir.jpg"
```

### Mengambil Daftar Marker Peta (JavaScript `fetch`)

```javascript
const response = await fetch('http://localhost:8080/api/v1/incidents/map?status=verified&type=flood', {
  headers: {
    Accept: 'application/json',
  },
});

const { data } = await response.json();
console.log(data);
```

### Mengajukan Resolusi Insiden (Python `requests`)

```python
import requests

url = "http://localhost:8080/api/v1/incidents/{incident_uuid}/resolutions"
headers = {
    "Accept": "application/json",
    "Authorization": "Bearer YOUR_SANCTUM_TOKEN",
}
data = {
    "description": "Air sudah surut total dan saluran air sudah dibersihkan.",
}
files = [
    ("media[]", ("bukti-surut.jpg", open("/path/to/bukti-surut.jpg", "rb"), "image/jpeg")),
]

res = requests.post(url, headers=headers, data=data, files=files, timeout=30)
print(res.status_code, res.json())
```

---

## 5. Model Data & Enum

- **Incident Status (`status`):** `unverified`, `verified`, `resolution_submitted`, `resolved` (dan `rejected` untuk data internal yang disembunyikan dari publik)
- **Moderation Status (`moderation_status`):** `pending`, `verified`, `rejected`
- **Resolution Status (`status` pada resolusi):** `pending`, `approved`, `rejected`
- **User Role (`role`):** `citizen`, `admin`
- **Media Type (`file_type`):** `image`, `video`
