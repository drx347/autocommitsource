# Auto Commit Bot

Script Node.js untuk membuat commit otomatis ke GitHub berdasarkan jumlah commit yang dimasukkan user.

## Instalasi

```bash
npm install
```

## Menjalankan

```bash
node src/index.js
```

Program akan meminta input:

```text
Mau berapa commit?

> 50
```

Setiap commit akan mengubah `commits/data.txt`, menjalankan `git add .`, membuat commit dengan pesan acak, lalu push ke branch `main`.

Pastikan project sudah menjadi Git repository, remote `origin` sudah terhubung ke GitHub, dan branch utama bernama `main`.

## Tes Lokal Tanpa Push

```bash
npm run local
```

Mode ini tetap membuat commit, tetapi tidak menjalankan `git push`.

## Menghubungkan ke GitHub

Jika remote belum ada, jalankan:

```bash
git remote add origin <URL_REPOSITORY_GITHUB>
```

Lalu jalankan:

```bash
npm start
```
