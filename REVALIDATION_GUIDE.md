# 🔄 On-Demand Revalidation Guide

## Cara Kerja

Sistem ini memungkinkan Anda untuk **update data dari Supabase secara instant** tanpa perlu:
- ❌ Restart server
- ❌ Clear cache manual (`Remove-Item .next`)
- ❌ Redeploy aplikasi

## 📋 Cara Menggunakan

### 1️⃣ Tambah Data di Supabase
1. Buka Supabase Dashboard
2. Tambah project baru atau skill baru
3. Pastikan `is_active = true`

### 2️⃣ Update Website (Pilih salah satu)

#### Option A: Via Browser (Paling Mudah) 🌐
Buka URL ini di browser:
```
http://localhost:3000/api/revalidate?secret=dev123
```

Akan muncul response:
```json
{
  "success": true,
  "message": "Path / has been revalidated",
  "timestamp": "2025-12-24T03:42:00.000Z"
}
```

#### Option B: Via PowerShell/Terminal 💻
```powershell
Invoke-WebRequest "http://localhost:3000/api/revalidate?secret=dev123"
```

#### Option C: Via curl (jika ada curl di Windows)
```bash
curl http://localhost:3000/api/revalidate?secret=dev123
```

### 3️⃣ Refresh Halaman
- Buka/refresh `http://localhost:3000`
- Data baru langsung muncul! ✨

## 🚀 Production (Setelah Deploy)

### Setup di Vercel
1. Buat `REVALIDATE_SECRET` yang kuat di Environment Variables
   - Contoh: `b3d7a8f9c2e1d4a6b9c8e7f6a5d4c3b2`
   - **Jangan pakai `dev123` di production!**

2. Simpan secret ini (Anda akan butuh untuk revalidate)

### Cara Update di Production
Setiap kali tambah data di Supabase, panggil:
```
https://yourdomain.com/api/revalidate?secret=YOUR_SECRET_KEY
```

**Contoh:**
```
https://galuhwikri.vercel.app/api/revalidate?secret=b3d7a8f9c2e1d4a6b9c8e7f6a5d4c3b2
```

## 🔗 Automation dengan Supabase Webhook (Optional)

Untuk **update otomatis 100%** tanpa manual trigger:

### Setup Webhook di Supabase
1. Buka Supabase Dashboard → Database → Webhooks
2. Klik "Create new hook"
3. Isi form:
   - **Name:** Portfolio Revalidation
   - **Table:** `projects` (ulangi untuk `skills`)
   - **Events:** ✅ INSERT, ✅ UPDATE, ✅ DELETE
   - **Type:** HTTP Request
   - **Method:** POST
   - **URL:** `https://yourdomain.com/api/revalidate`
   - **HTTP Headers:**
     ```
     Content-Type: application/json
     ```
   - **HTTP Params (Body):**
     ```json
     {
       "secret": "YOUR_SECRET_KEY",
       "path": "/"
     }
     ```

### Hasil
Setiap kali Anda:
- ➕ Tambah project/skill baru
- ✏️ Edit data
- 🗑️ Hapus data

Website **langsung update otomatis** dalam hitungan detik! 🚀

## ⏱️ Timeline Update

| Method | Update Time | Manual Action Required |
|--------|-------------|----------------------|
| **ISR (Normal)** | Development: 30s<br>Production: 1 hour | ❌ No |
| **On-Demand API** | Instant (< 1 second) | ✅ Yes - Call API |
| **Webhook** | Instant (< 1 second) | ❌ No - Fully automatic |

## 🔒 Security

- Secret token harus **kuat & random** di production
- Jangan commit secret ke Git
- Gunakan environment variables
- Ganti `dev123` dengan string random 32+ karakter

## ✅ Testing

### Test API Berfungsi
```
http://localhost:3000/api/revalidate?secret=dev123
```

**Success Response:**
```json
{
  "success": true,
  "message": "Path / has been revalidated"
}
```

**Error Response (Wrong Secret):**
```json
{
  "error": "Invalid secret token"
}
```

## 🎯 Workflow Rekomendasi

### Development (Lokal)
1. Tambah data di Supabase
2. Buka `http://localhost:3000/api/revalidate?secret=dev123`
3. Refresh halaman → Done! ✨

### Production (Deploy)
1. Setup webhook Supabase (sekali saja)
2. Tambah data di Supabase
3. **Otomatis update** tanpa action apapun! 🎉

---

**No more manual cache clearing!** 🎊
