/* ==========================================================
   RENDER.JS — membuat daftar Music, Gallery, Profile & Games dari js/konten.js
   (tidak perlu diubah; ubah isi di konten.js)
   Harus dimuat SEBELUM main.js.
   ========================================================== */
(function () {
  "use strict";
  const K = window.KONTEN || {};

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  // ---------- GALLERY ----------
  const gallery = document.getElementById("gallery");
  if (gallery && K.galeri) {
    K.galeri.forEach(function (g) {
      const isVideo = g.tipe === "video";
      const btn = el("button", "shot reveal");
      btn.type = "button";
      btn.dataset.type = isVideo ? "video" : "photo";
      btn.dataset.full =
        "../assets/gallery/" + (isVideo ? "videos/" : "photos/") + g.file;
      btn.dataset.title = g.judul || "";
      btn.dataset.desc = g.deskripsi || "";

      const img = document.createElement("img");
      img.src =
        "../assets/gallery/" +
        (isVideo ? "thumbs/" + (g.sampul || "") : "photos/" + g.file);
      img.alt = g.judul || "";
      img.loading = "lazy";
      if (g.lebar && g.tinggi) {
        img.width = g.lebar;
        img.height = g.tinggi;
      } // kalau kosong, diukur otomatis
      btn.appendChild(img);

      if (isVideo) {
        const play = el("span", "shot-play");
        play.setAttribute("aria-hidden", "true");
        play.innerHTML =
          '<svg viewBox="0 0 24 24"><path d="M8 5.5v13c0 .9 1 1.4 1.7.9l9.6-6.5c.6-.4.6-1.4 0-1.8L9.7 4.6C9 4.1 8 4.6 8 5.5z"/></svg>';
        btn.appendChild(play);
      }
      btn.appendChild(el("span", "shot-cap", g.judul || ""));
      gallery.appendChild(btn);
    });
  }

  // ---------- MUSIC ----------
  const tracks = document.getElementById("tracks");
  if (tracks && K.musik) {
    K.musik.forEach(function (m) {
      const li = el("li", "reveal");
      const btn = el("button", "track");
      btn.type = "button";
      btn.dataset.file = m.file;
      btn.dataset.title = m.judul || "";
      btn.dataset.artist = m.artis || "";
      const cover = m.sampul ? "../assets/music/covers/" + m.sampul : "";
      if (cover) btn.dataset.cover = cover;

      const thumb = el("span", "t-thumb");
      if (cover) {
        const img = document.createElement("img");
        img.src = cover;
        img.alt = "";
        img.width = 52;
        img.height = 52;
        img.loading = "lazy";
        thumb.appendChild(img);
      }
      const eq = el("i", "eq");
      eq.setAttribute("aria-hidden", "true");
      eq.innerHTML = "<b></b><b></b><b></b>";
      thumb.appendChild(eq);

      const text = el("span", "t-text");
      text.appendChild(el("span", "t-name", m.judul || ""));
      text.appendChild(el("span", "t-artist", m.artis || ""));

      btn.appendChild(thumb);
      btn.appendChild(text);
      btn.appendChild(el("span", "t-dur", "–:––"));
      li.appendChild(btn);
      tracks.appendChild(li);
    });
  }

  // ---------- PROFILE ----------
  const P = K.profil;
  const profRoot = document.getElementById("profile-root");
  if (P && profRoot) {
    function put(id, fn) { const t = document.getElementById(id); if (t) fn(t); }
    put("pf-name", function (t) { t.textContent = P.nama || ""; });
    put("pf-tag", function (t) { t.textContent = P.tagline || ""; });
    put("pf-badges", function (t) {
      (P.lencana || []).forEach(function (b) { t.appendChild(el("li", "", b)); });
    });
    put("pf-bio", function (t) {
      (P.bio || []).forEach(function (b) { t.appendChild(el("p", "", b)); });
    });
    put("pf-stats", function (t) {
      const photos = (K.galeri || []).length;
      [
        [P.jumlahProyek || 0, "Proyek"],
        [(K.musik || []).length, "Lagu"],
        [photos, "Foto & video"],
      ].forEach(function (s) {
        const li = el("li", "stat reveal");
        li.appendChild(el("strong", "", String(s[0])));
        li.appendChild(el("span", "", s[1]));
        t.appendChild(li);
      });
    });
    put("pf-skills", function (t) {
      (P.keahlian || []).forEach(function (k) {
        const pct = Math.max(0, Math.min(100, Number(k.persen) || 0));
        const li = el("li", "skill");
        li.style.setProperty("--p", pct + "%");
        const row = el("div", "skill-row");
        row.appendChild(el("span", "skill-name", k.nama || ""));
        row.appendChild(el("span", "skill-pct", pct + "%"));
        const bar = el("div", "bar");
        bar.setAttribute("role", "progressbar");
        bar.setAttribute("aria-label", k.nama || "");
        bar.setAttribute("aria-valuemin", "0");
        bar.setAttribute("aria-valuemax", "100");
        bar.setAttribute("aria-valuenow", String(pct));
        bar.appendChild(el("i", "bar-fill"));
        li.appendChild(row);
        li.appendChild(bar);
        t.appendChild(li);
      });
    });
    put("pf-likes", function (t) {
      (P.minat || []).forEach(function (m) {
        const li = el("li", "like");
        const ic = el("span", "like-ico", m.ikon || "");
        ic.setAttribute("aria-hidden", "true");
        const tx = el("span", "like-text");
        tx.appendChild(el("strong", "", m.judul || ""));
        tx.appendChild(el("span", "", m.ket || ""));
        li.appendChild(ic);
        li.appendChild(tx);
        t.appendChild(li);
      });
    });
    put("pf-timeline", function (t) {
      (P.linimasa || []).forEach(function (n) {
        const li = el("li", "");
        li.appendChild(el("strong", "", n.judul || ""));
        li.appendChild(el("span", "", n.ket || ""));
        t.appendChild(li);
      });
    });
    put("pf-contacts", function (t) {
      (P.kontak || []).forEach(function (c) {
        if (!c || !c.url) return;
        const a = el("a", "btn btn-ghost");
        a.href = c.url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = (c.nama || "Tautan") + (c.teks ? " · " + c.teks : "");
        t.appendChild(a);
      });
    });
  }

  // ---------- GAMES ----------
  const favGames = document.getElementById("fav-games");
  if (favGames && K.game) {
    K.game.forEach(function (g) {
      const card = el("article", "gcard reveal");
      const cover = el("div", "gcard-cover");
      cover.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 8h10a4 4 0 0 1 4 4v1a3 3 0 0 1-5.2 2L14.5 14h-5l-1.3 1A3 3 0 0 1 3 13v-1a4 4 0 0 1 4-4z"/><path d="M8 10.6v2.8M6.6 12h2.8"/><circle cx="15.6" cy="11.2" r=".9" fill="currentColor"/><circle cx="17.6" cy="13" r=".9" fill="currentColor"/></svg>';
      const body = el("div", "gcard-body");
      body.appendChild(el("span", "gcard-genre", g.genre || ""));
      body.appendChild(el("h3", "", g.judul || ""));
      if (g.catatan) body.appendChild(el("p", "", g.catatan));
      if (g.platform) body.appendChild(el("span", "gcard-plat", g.platform));
      card.appendChild(cover);
      card.appendChild(body);
      favGames.appendChild(card);
    });
    const more = el("article", "gcard gcard-more reveal");
    const mb = el("div", "gcard-body");
    mb.appendChild(el("h3", "", "Masih bertambah"));
    mb.appendChild(el("p", "", "Daftar game favorit ini akan terus diperbarui."));
    more.appendChild(mb);
    favGames.appendChild(more);
  }

  // Daftar baru dibuat di atas -> daftarkan ke animasi reveal.
  // (Saat halaman dibuka penuh, main.js belum ada dan akan mengurusnya sendiri.
  //  Saat pindah halaman tanpa reload, main.js sudah hidup sehingga harus dipanggil di sini.)
  if (typeof window.refreshReveal === "function") window.refreshReveal();
})();
