# Auto Commit Bot

Script Node.js untuk membuat commit otomatis ke GitHub berdasarkan link repo yang dimasukkan user.

## Instalasi

```bash
npm install
```

## Menjalankan

```bash
npm start
```

Program akan meminta input:

```text
Masukkan link repo GitHub yang mau di-auto commit

> https://github.com/username/nama-repo.git

Mau berapa commit?

> 50

Branch yang mau dipakai?
(default: main)

> main

Mau langsung push ke repo tersebut? (y/n)
(default: y)

> y
```

Bot akan clone repo tersebut ke folder `target-repos/`. Setiap commit akan mengubah `commits/data.txt` di dalam repo target, menjalankan `git add .`, membuat commit dengan pesan acak, lalu push ke branch yang dipilih.

Pastikan akun Git di komputer sudah punya akses push ke repo tersebut. Untuk private repo, gunakan HTTPS dengan credential/token yang sudah tersimpan atau SSH URL seperti `git@github.com:user/repo.git`.

## Tes Lokal Tanpa Push

```bash
npm run local
```

Mode ini tetap meminta link repo dan membuat commit lokal di hasil clone, tetapi tidak menjalankan `git push`.
