/* ==========================================================
   KONTEN.JS — TEMPAT MENGUBAH ISI WEBSITE
   Ubah judul, deskripsi, artis, dll di sini saja. Tidak perlu
   menyentuh file HTML. Simpan file ini, lalu refresh halaman.

   ATURAN PENTING:
   - Tulis teks di antara tanda kutip "seperti ini".
   - Jangan hapus tanda koma (,) di akhir tiap baris / blok.
   - Kalau teks mengandung tanda kutip, tulis \" (contoh: "Dia bilang \"halo\"").
   - Urutan di daftar = urutan tampil di halaman.
   ========================================================== */

window.KONTEN = {
  /* ---------------------------------------------------------
     MUSIC  (file lagu taruh di assets/music/audio/,
             sampul taruh di assets/music/covers/)
     file   = nama file mp3
     judul  = judul lagu
     artis  = nama artis (boleh dikosongkan: "")
     sampul = nama file sampul (boleh dikosongkan: "")
     --------------------------------------------------------- */
  musik: [
    {
      file: "garam-madu.mp3",
      judul: "Garam & Madu (Sakit Dadaku)",
      artis: "Tenxi, Naykilla & Jemsii",
      sampul: "garam-madu.jpg",
    },
    {
      file: "doa.mp3",
      judul: "Doa",
      artis: "K3BI",
      sampul: "doa.jpg",
    },
    {
      file: "let-me-love-you.mp3",
      judul: "Let Me Love You",
      artis: "DJ Snake ft. Justin Bieber",
      sampul: "let-me-love-you.jpg",
    },
    {
      file: "ransom.mp3",
      judul: "Ransom",
      artis: "Lil Tecca",
      sampul: "ransom.jpg",
    },
    {
      file: "show-me-love.mp3",
      judul: "Show Me Love",
      artis: "WizTheMc, bees & honey",
      sampul: "show-me-love.jpg",
    },
    {
      file: "Sunflower.mp3",
      judul: "Sunflower",
      artis: "Post Malone, Swae Lee",
      sampul: "sunflower.jpg",
    },
  ],

  /* ---------------------------------------------------------
     GALLERY  (foto di assets/gallery/photos/, video di
               assets/gallery/videos/, sampul video di
               assets/gallery/thumbs/)
     tipe   = "foto" atau "video"
     file   = nama file foto / video
     sampul = (khusus video) nama file gambar sampulnya
     lebar, tinggi = (boleh dihapus) ukuran asli gambar dalam piksel.
                     Kalau diisi, galeri tampil lebih mulus saat dibuka.
     judul  = judul foto
     deskripsi = keterangan di bawah judul saat foto dibuka
     --------------------------------------------------------- */
  galeri: [
    {
      tipe: "foto",
      file: "animewey.png",
      lebar: 864,
      tinggi: 1536,
      judul: "Animewey",
      deskripsi: "Selfie deng karakter anime favorit beta.",
    },
    {
      tipe: "foto",
      file: "ronaldo-mu.png",
      lebar: 1086,
      tinggi: 1448,
      judul: "Ronaldo Red Devil",
      deskripsi: "Ronaldo di Manchester United.",
    },
    {
      tipe: "foto",
      file: "real-madrid.jpg",
      lebar: 922,
      tinggi: 2048,
      judul: "Real Madrid",
      deskripsi: "Hala Madrid.",
    },
    {
      tipe: "foto",
      file: "biruaestik.png",
      lebar: 1152,
      tinggi: 2048,
      judul: "Biru Aestetik",
      deskripsi: "suasana sore.",
    },
    {
      tipe: "foto",
      file: "putihee.jpg",
      lebar: 1200,
      tinggi: 2132,
      judul: "Putihee",
      deskripsi: "Parkiran depan jembatan Faer.",
    },
    {
      tipe: "foto",
      file: "koboi.jpg",
      lebar: 1024,
      tinggi: 2048,
      judul: "Koboi",
      deskripsi: "Toy Koboi.",
    },
    {
      tipe: "foto",
      file: "san-andresas.jpg",
      lebar: 736,
      tinggi: 1097,
      judul: "San Dresas",
      deskripsi: "siCJ.",
    },
    {
      tipe: "foto",
      file: "sultanmeow.jpg",
      lebar: 736,
      tinggi: 981,
      judul: "Sultan Meow",
      deskripsi: "meow meow meow.",
    },
    {
      tipe: "video",
      file: "arap-rapx.mp4",
      sampul: "rapx-sampul.jpg",
      lebar: 1280,
      tinggi: 720,
      judul: "Rapx",
      deskripsi: "rapx nieee.",
    },
  ],

  /* ---------------------------------------------------------
     PROFILE  (halaman Profile, foto utama: assets/core/images/foto-profil.jpeg)
     nama, tagline  = nama dan kalimat singkat di kartu profil
     lencana        = label kecil di bawah nama
     jumlahProyek   = angka "Proyek" di statistik (Lagu & Foto dihitung otomatis)
     bio            = paragraf "Tentang saya" (boleh tambah / kurangi)
     keahlian       = kemampuan: nama + persen (0-100)
     minat          = hal yang kamu suka: emoji + judul + keterangan
     linimasa       = perjalanan: judul + keterangan
     kontak         = tautan kontak. nama + teks + url. Kalau url kosong,
                      item tidak ditampilkan. Contoh:
                      { nama: "Instagram", teks: "@namakamu", url: "https://instagram.com/namakamu" }
     --------------------------------------------------------- */
  profil: {
    nama: "Yethrq",
    tagline: "Membuat, berbagi, dan menikmati.",
    lencana: ["Pembuat website", "Gaming", "Pencinta musik"],
    jumlahProyek: 4,
    bio: [
      "Halo, saya Yethrq. Saya membuat website ini. Website ini adalah rumah digital saya: tempat saya menaruh karya, lagu favorit, foto, dan hal-hal yang saya suka dan terserah beta.",
      "Perjalanan saya dimulai dari website pertama bernama Websye, lalu lanjut ke kalkulator, drum machine, dan markdown previewer sebagai tugas belajar.",
    ],
    keahlian: [
      { nama: "HTML", persen: 75 },
      { nama: "CSS", persen: 60 },
      { nama: "JavaScript", persen: 40 },
      { nama: "Desain halaman", persen: 80 },
    ],
    minat: [
      { ikon: "🎧", judul: "Musik", ket: "Dari Justin Bieber sampai K3BI dan banyak lagi." },
      { ikon: "⚽", judul: "Sepak bola", ket: "Hala Madrid, Ronaldo di Manchester United, dan Adik Guler15." },
      { ikon: "🎮", judul: "Game", ket: "GTA San Andreas, dan kita tunggu rilisnya GTA VI." },
      { ikon: "💻", judul: "Teknologi", ket: "Saya suka teknologi dan editing video & foto." },
    ],
    linimasa: [
      { judul: "Websye", ket: "Websye adalah website pertama saya." },
      { judul: "Belajar membuat", ket: "Kalkulator, Drum Machine, dan Markdown Previewer." },
      { judul: "Website ini", ket: "Rumah digital dengan musik, galeri, donasi, game, dan portofolio." },
    ],
    kontak: [
      { nama: "", teks: "", url: "" },
    ],
  },

  /* ---------------------------------------------------------
     GAMES  (daftar game favorit di halaman Games)
     judul   = nama game
     genre   = jenis game
     platform = tempat memainkannya (boleh dikosongkan: "")
     catatan = alasan kamu suka
     --------------------------------------------------------- */
  game: [
    {
      judul: "GTA San Andreas",
      genre: "Aksi · Dunia terbuka",
      platform: "",
      catatan: "Si CJ sampai masuk galeri website ini.",
    },
  ],

  /* ---------------------------------------------------------
     TOKO / SHOP  (foto produk taruh di assets/shop/products/)
     namaToko  = nama toko di pesan pesanan
     whatsapp  = nomor WhatsApp penerima pesanan, awali 62 tanpa
                 tanda + atau spasi. Contoh: "6281234567890".
                 Kalau kosong, pembeli hanya bisa "Salin pesanan".
     produk    = daftar barang:
       id        = kode unik tanpa spasi (jangan sama dengan produk lain)
       nama      = nama produk
       kategori  = pengelompok tombol filter (boleh dikosongkan: "")
       harga     = angka saja, tanpa titik. Contoh: 25000
       deskripsi = keterangan singkat
       foto      = nama file foto (boleh dikosongkan: "" -> tampil ikon)
       stok      = jumlah tersedia. 0 = habis. Hapus baris ini kalau
                   stok tidak dibatasi.
       label     = tulisan kecil di pojok foto, misal "Baru" (boleh kosong)
     --------------------------------------------------------- */
  toko: {
    namaToko: "Yethrq Shop",
    whatsapp: "",
    produk: [
      {
        id: "contoh-1",
        nama: "Contoh Produk 1",
        kategori: "Digital",
        harga: 15000,
        deskripsi: "Ganti dengan produk aslimu di js/konten.js.",
        foto: "",
        label: "Contoh",
      },
      {
        id: "contoh-2",
        nama: "Contoh Produk 2",
        kategori: "Merchandise",
        harga: 75000,
        deskripsi: "Foto produk taruh di assets/shop/products/.",
        foto: "",
        stok: 5,
      },
      {
        id: "contoh-3",
        nama: "Contoh Produk 3",
        kategori: "Merchandise",
        harga: 120000,
        deskripsi: "Stok 0 akan tampil sebagai Habis.",
        foto: "",
        stok: 0,
      },
    ],
  },
};
