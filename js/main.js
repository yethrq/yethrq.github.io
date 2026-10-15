/* ==========================================================
   MAIN.JS — dipakai SEMUA halaman
   ========================================================== */
(function () {
  "use strict";

  const navbar = document.querySelector(".navbar");
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".nav-links");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = function (v, a, b) { return Math.min(Math.max(v, a), b); };

  // 1. Navbar mendapat latar saat di-scroll
  function onScroll() {
    navbar.classList.toggle("scrolled", window.scrollY > 20);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // 2. Menu mobile
  function setMenu(open) {
    menu.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
  }
  toggle.addEventListener("click", function () {
    setMenu(!menu.classList.contains("open"));
  });
  // delegasi: tetap jalan walau link menu diperbarui saat pindah halaman
  menu.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setMenu(false);
  });

  // 3. Animasi saat scroll gaya iOS — jalan ke bawah DAN ke atas
  //    Elemen .reveal muncul saat masuk layar & hilang lagi saat keluar.
  //    Dijalankan ulang tiap kali isi halaman diganti (initReveal).
  let io = null;
  function initReveal() {
    if (io) { io.disconnect(); io = null; }
    const items = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window && !reduceMotion) {
      io = new IntersectionObserver(function (entries) {
        let order = 0;
        entries.forEach(function (entry) {
          const el = entry.target;
          if (entry.isIntersecting) {
            el.style.transitionDelay = order * 80 + "ms"; // muncul bergantian
            order++;
            el.classList.remove("out-up");
            el.classList.add("visible");
            clearTimeout(el._delayTimer);
            el._delayTimer = setTimeout(function () { el.style.transitionDelay = ""; }, 1100);
          } else {
            el.style.transitionDelay = "0ms";
            // keluar lewat atas (scroll turun) -> naik; lewat bawah (scroll naik) -> turun
            el.classList.toggle("out-up", entry.boundingClientRect.top < 0);
            el.classList.remove("visible");
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
      items.forEach(function (el) { io.observe(el); });
    } else {
      items.forEach(function (el) { el.classList.add("visible"); });
    }
  }

  // Dipanggil render.js SETELAH daftar (lagu/galeri) selesai dibuat.
  // Saat pindah halaman tanpa reload, render.js jalan belakangan (script dimuat async),
  // sehingga elemen .reveal buatannya belum terpantau dan tertinggal transparan.
  window.refreshReveal = initReveal;

  // 3b. Efek yang mengikuti posisi scroll (halus, per frame)
  let heroCopy = null, glowA = null, glowB = null, depthEls = [];
  let ticking = false;

  function updateScrollFx() {
    ticking = false;
    const y = window.scrollY;
    const vh = window.innerHeight;
    if (reduceMotion) return;

    // Hero: baru mulai mengecil & memudar setelah scroll agak jauh
    if (heroCopy && y < vh * 1.3) {
      const dead = vh * 0.3;
      const e = Math.max(y - dead, 0);
      const p = clamp(e / (vh * 0.7), 0, 1);
      heroCopy.style.transform = "translate3d(0," + (e * 0.28) + "px,0) scale(" + (1 - p * 0.12) + ")";
      heroCopy.style.opacity = String(1 - p);
    }
    if (glowA) glowA.style.marginTop = (y * 0.18) + "px";
    if (glowB) glowB.style.marginBottom = (y * 0.12) + "px";

    // Kartu: mengecil halus saat mendekati tepi atas layar (efek kedalaman)
    depthEls.forEach(function (el) {
      const top = el.getBoundingClientRect().top;
      const t = clamp((110 - top) / 280, 0, 1);
      el.style.scale = t > 0 ? String(1 - t * 0.08) : "";
    });
  }
  function initScrollFx() {
    heroCopy = document.querySelector(".hero-copy");
    glowA = document.querySelector(".glow-a");
    glowB = document.querySelector(".glow-b");
    depthEls = document.querySelectorAll(".card.reveal, .intro.reveal");
    updateScrollFx();
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(updateScrollFx); }
  }, { passive: true });
  window.addEventListener("resize", updateScrollFx);

  // 4. Hal yang perlu dijalankan ulang setiap isi halaman berganti
  function initPage() {
    initReveal();
    initScrollFx();
    onScroll();
    const year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();
  }
  initPage();

  // 5. Tombol ganti tema (gelap / terang), pilihan disimpan di browser
  const themeBtn = document.querySelector(".theme-toggle");
  const root = document.documentElement;
  function syncSwitch() {
    if (themeBtn) themeBtn.setAttribute("aria-checked", String(root.dataset.theme === "light"));
  }
  function applyTheme(next) {
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
    syncSwitch();
  }
  syncSwitch();
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      const next = root.dataset.theme === "light" ? "dark" : "light";
      // Browser modern (Chrome/Safari HP): View Transitions = pemudaran halus lewat GPU.
      // Browser lama: ganti langsung (saklar tetap bergeser halus lewat CSS).
      if (document.startViewTransition && !reduceMotion) {
        try { document.startViewTransition(function () { applyTheme(next); }); }
        catch (e) { applyTheme(next); }
      } else {
        applyTheme(next);
      }
    });
  }

  // 5b. Cincin warna-warni di foto profil (khusus layar sentuh/HP):
  //     menyala saat ditap, lalu MATI SENDIRI setelah 3 detik (tanpa perlu tap di tempat lain).
  const touchOnly = window.matchMedia("(hover: none), (pointer: coarse)");
  const RING_MS = 3000; // ubah angka ini untuk durasi lain (milidetik)
  let ringTimer = null;
  navbar.addEventListener("click", function (e) {
    const logo = e.target.closest && e.target.closest(".brand-logo");
    if (!logo || !touchOnly.matches) return;
    logo.classList.add("ring-on");
    clearTimeout(ringTimer);
    ringTimer = setTimeout(function () { logo.classList.remove("ring-on"); }, RING_MS);
  });

  // 6. Musik latar: tombol bulat nyala/mati, status & posisi lagu diingat antar halaman
  const music = document.getElementById("bg-music");
  const musicBtn = document.querySelector(".music-toggle");
  function store(key, val) { try { localStorage.setItem(key, val); } catch (e) {} }
  function load(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  // Posisi lagu disimpan per-tab (sessionStorage): lanjut saat pindah halaman,
  // tapi mulai dari awal lagi saat website dibuka ulang.
  function sstore(key, val) { try { sessionStorage.setItem(key, val); } catch (e) {} }
  function sload(key) { try { return sessionStorage.getItem(key); } catch (e) { return null; } }

  if (music && musicBtn) {
    music.volume = 0.5; // 0 sampai 1, ubah sesuai selera
    // Jadikan alamat lagu absolut, supaya tetap benar walau URL halaman berganti
    // (navigasi tanpa reload) dan tetap bisa dipakai music.js.
    music.setAttribute("src", music.src);

    const playBtns = document.querySelectorAll(".music-toggle, .p-play");
    function setMusicUI(on) {
      const label = on ? "Matikan musik" : "Nyalakan musik";
      playBtns.forEach(function (b) {
        b.setAttribute("aria-pressed", String(on));
        b.setAttribute("aria-label", label);
        b.title = label;
      });
    }

    music.addEventListener("error", function () {
      setMusicUI(false);
      musicBtn.title = "File musik tidak ditemukan";
    });

    function toggleMusic() {
      if (music.paused) {
        music.play().then(function () {
          setMusicUI(true);
          store("music", "on");
        }).catch(function () {});
      } else {
        music.pause();
        setMusicUI(false);
        store("music", "off");
      }
    }
    playBtns.forEach(function (b) { b.addEventListener("click", toggleMusic); });

    // ---- Musik mati otomatis saat pengunjung KELUAR dari website ----
    // (pindah ke aplikasi/tab lain, tombol Home, layar dikunci, atau menutup/meninggalkan halaman).
    // Pindah halaman di dalam website TIDAK memicu ini, jadi musik tetap lanjut di sana.
    function stopOnLeave() {
      if (!music.paused) music.pause();
      store("music", "off");
    }
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stopOnLeave();
    });
    window.addEventListener("pagehide", stopOnLeave);

    // ---- Musik berhenti otomatis saat ada video diputar ----
    // Event "play" tidak menjalar ke atas, jadi didengarkan di fase capture pada document.
    // Berlaku untuk semua <video> (termasuk yang dibuat lightbox Gallery), juga di masa depan.
    function stopMusicForVideo(e) {
      if (e.target && e.target.tagName === "VIDEO" && !music.paused) {
        music.pause();            // tampilan tombol ikut menyesuaikan lewat event "pause"
        store("music", "off");    // dicatat "mati" agar tidak menyala sendiri saat halaman dibuka ulang
      }
    }
    // "play" = saat tombol play/autoplay dimulai, "playing" = saat gambar benar-benar berjalan
    // (cadangan untuk browser HP yang menunda video sampai selesai buffering).
    document.addEventListener("play", stopMusicForVideo, true);
    document.addEventListener("playing", stopMusicForVideo, true);

    // ---- Simpan posisi lagu (per-tab) ----
    // Disimpan terus-menerus, bukan hanya saat pagehide, karena di HP (Chrome/Safari)
    // pagehide sering tidak sempat jalan saat tombol Back ditekan atau tab dimatikan.
    let lastSave = 0;
    function saveTime() {
      if (!music.currentTime) return;
      sstore("musicTime", String(music.currentTime));
    }
    music.addEventListener("timeupdate", function () {
      const now = Date.now();
      if (now - lastSave > 1000) { lastSave = now; saveTime(); }
    });
    window.addEventListener("pagehide", saveTime);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) saveTime();
    });

    // Sinkronkan tampilan tombol dengan kondisi audio yang sebenarnya
    music.addEventListener("play", function () { setMusicUI(true); });
    music.addEventListener("pause", function () { setMusicUI(false); });

    // ---- Lanjutkan musik jika sebelumnya dinyalakan ----
    const savedTime = parseFloat(sload("musicTime")) || 0;
    let restored = false;
    function restorePosition() {
      if (restored) return;
      if (music.readyState > 0 && savedTime > 0 && savedTime < music.duration) {
        music.currentTime = savedTime;
        restored = true;
      } else if (music.readyState > 0) {
        restored = true;
      }
    }
    music.addEventListener("loadedmetadata", restorePosition);

    let waiting = false;
    function wantsMusic() { return load("music") === "on"; }

    function tryResume() {
      if (!wantsMusic() || !music.paused) return;
      restorePosition();
      music.play().then(function () {
        setMusicUI(true);
        stopWaiting();
      }).catch(waitForTouch);
    }

    // Browser HP menahan suara otomatis setelah pindah halaman.
    // Lanjutkan pada sentuhan/klik pertama (touchend/click dihitung sebagai interaksi,
    // pointerdown untuk sentuhan TIDAK dihitung).
    function onUserGesture(e) {
      if (e.target.closest && e.target.closest(".music-toggle, .p-play")) return;
      tryResume();
    }
    function waitForTouch() {
      if (waiting) return;
      waiting = true;
      ["touchend", "click", "keydown"].forEach(function (ev) {
        document.addEventListener(ev, onUserGesture, true);
      });
    }
    function stopWaiting() {
      if (!waiting) return;
      waiting = false;
      ["touchend", "click", "keydown"].forEach(function (ev) {
        document.removeEventListener(ev, onUserGesture, true);
      });
    }

    tryResume();

    // Kembali ke halaman lewat tombol Back (bfcache) atau balik dari aplikasi lain:
    // browser menjeda audio, jadi nyalakan lagi dari posisi terakhir.
    window.addEventListener("pageshow", function (e) {
      if (e.persisted) { restored = true; tryResume(); }
    });
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) tryResume();
    });
  }

  // 7. Setelah tombol diklik dengan mouse/sentuhan, lepas fokusnya.
  //    Supaya saat menekan tombol keyboard/volume tidak muncul lingkaran biru.
  //    (Navigasi dengan tombol Tab tetap menampilkan penanda fokus.)
  document.querySelectorAll(".music-toggle, .theme-toggle, .nav-toggle").forEach(function (b) {
    b.addEventListener("click", function (e) {
      if (e.detail > 0) b.blur();
    });
  });

  // 8. NAVIGASI TANPA RELOAD (agar musik tidak pernah mati saat pindah halaman / tekan Back)
  //    Navbar dan elemen <audio id="bg-music"> dibiarkan hidup. Yang diganti hanya isi halaman
  //    (main, footer, CSS & JS khusus halaman). Jika sesuatu gagal, otomatis pakai pindah halaman biasa.
  const canRoute = !!(window.fetch && window.DOMParser && window.history && history.pushState) &&
    /^https?:$/.test(location.protocol);

  if (canRoute) {
    const pageKey = function (u) { const x = new URL(u, location.href); return x.origin + x.pathname + x.search; };
    const cache = new Map();      // halaman yang sudah diambil
    const scrollPos = new Map();  // posisi scroll tiap halaman (untuk tombol Back)
    let currentKey = pageKey(location.href);
    let navToken = 0;
    let wantedStyles = new Set();
    try { history.scrollRestoration = "manual"; } catch (e) {}

    // Catat alamat absolut stylesheet yang sedang dipakai
    document.querySelectorAll('link[rel="stylesheet"]').forEach(function (l) { l.dataset.abs = l.href; });

    function hardNav(href) { window.location.href = href; }

    function loadStyles(doc, base) {
      wantedStyles = new Set();
      doc.querySelectorAll('head link[rel="stylesheet"]').forEach(function (l) {
        wantedStyles.add(new URL(l.getAttribute("href"), base).href);
      });
      const have = new Set();
      document.querySelectorAll('link[rel="stylesheet"]').forEach(function (l) { have.add(l.dataset.abs || l.href); });
      const jobs = [];
      wantedStyles.forEach(function (u) {
        if (have.has(u)) return;
        jobs.push(new Promise(function (resolve) {
          const l = document.createElement("link");
          l.rel = "stylesheet";
          l.media = "not all";          // diunduh dulu, belum dipakai (tidak mengubah halaman lama)
          l.dataset.abs = u;
          l.onload = l.onerror = function () { resolve(); };
          l.href = u;
          document.head.appendChild(l);
          setTimeout(resolve, 5000);
        }));
      });
      return Promise.all(jobs);
    }

    function runScripts(doc, base) {
      doc.body.querySelectorAll("script").forEach(function (old) {
        const src = old.getAttribute("src");
        if (src && /(^|\/)main\.js(\?|$)/.test(src)) return; // main.js tetap hidup, tidak dijalankan ulang
        const el = document.createElement("script");
        if (src) { el.src = new URL(src, base).href; el.async = false; }
        else el.textContent = old.textContent;
        document.body.appendChild(el);
      });
    }

    function swap(doc, href, push) {
      // hentikan pemutar khusus halaman lama (Legacy di navbar TIDAK disentuh)
      document.querySelectorAll("audio:not(#bg-music), video").forEach(function (m) {
        try { m.pause(); } catch (e) {}
      });

      if (push) history.pushState({ pjax: true }, "", href); // URL harus berubah dulu agar path relatif benar
      currentKey = pageKey(location.href);
      document.title = doc.title;

      // stylesheet: aktifkan yang baru, buang yang tidak dipakai halaman ini
      document.querySelectorAll('link[rel="stylesheet"]').forEach(function (l) {
        const abs = l.dataset.abs || l.href;
        if (!wantedStyles.has(abs)) l.remove();
        else if (l.media === "not all") l.media = "all";
      });

      // navbar: perbarui link (path relatif berbeda tiap folder) & penanda halaman aktif
      const nBrand = doc.querySelector(".navbar .brand");
      const brand = navbar.querySelector(".brand");
      if (nBrand && brand) {
        brand.setAttribute("href", nBrand.getAttribute("href"));
        const i = brand.querySelector("img"), ni = nBrand.querySelector("img");
        if (i && ni) i.setAttribute("src", ni.getAttribute("src"));
      }
      const nLinks = doc.querySelectorAll(".navbar .nav-links a");
      const links = navbar.querySelectorAll(".nav-links a");
      if (nLinks.length === links.length) {
        nLinks.forEach(function (n, k) {
          links[k].setAttribute("href", n.getAttribute("href"));
          links[k].className = n.className;
          if (n.hasAttribute("aria-current")) links[k].setAttribute("aria-current", n.getAttribute("aria-current"));
          else links[k].removeAttribute("aria-current");
        });
      }

      // isi halaman: buang yang lama (kecuali navbar, audio Legacy, main.js)
      document.body.className = doc.body.className;
      Array.prototype.slice.call(document.body.children).forEach(function (el) {
        if (el === navbar || el === music) return;
        if (el.tagName === "SCRIPT" && /(^|\/)main\.js(\?|$)/.test(el.getAttribute("src") || "")) return;
        el.remove();
      });
      // pasang isi halaman baru
      let seenHeader = false;
      Array.prototype.slice.call(doc.body.children).forEach(function (el) {
        if (el.matches("header.navbar")) { seenHeader = true; return; }
        if (el.tagName === "SCRIPT" || el.id === "bg-music") return;
        const node = document.adoptNode(el);
        if (!seenHeader) document.body.insertBefore(node, navbar);
        else if (music && music.parentNode === document.body) document.body.insertBefore(node, music);
        else document.body.appendChild(node);
      });

      runScripts(doc, location.href);
      setMenu(false);
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
      initPage();

      // posisi scroll
      const hash = location.hash && location.hash.length > 1 ? decodeURIComponent(location.hash.slice(1)) : "";
      const target = hash ? document.getElementById(hash) : null;
      if (push && target) target.scrollIntoView();
      else window.scrollTo({ top: push ? 0 : (scrollPos.get(currentKey) || 0), left: 0, behavior: "instant" });
      onScroll();
      updateScrollFx();
    }

    async function go(href, push) {
      const token = ++navToken;
      scrollPos.set(currentKey, window.scrollY);
      try {
        const k = pageKey(href);
        let html = cache.get(k);
        if (!html) {
          const res = await fetch(href, { credentials: "same-origin" });
          const type = res.headers.get("content-type") || "";
          if (!res.ok || type.indexOf("text/html") === -1) throw new Error("bukan halaman");
          html = await res.text();
          cache.set(k, html);
        }
        if (token !== navToken) return;
        const doc = new DOMParser().parseFromString(html, "text/html");
        if (!doc.body || !doc.querySelector("header.navbar") || !doc.querySelector("main")) throw new Error("struktur beda");
        await loadStyles(doc, href);
        if (token !== navToken) return;
        swap(doc, href, push);
      } catch (err) {
        hardNav(href); // cadangan: pindah halaman biasa
      }
    }

    document.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest && e.target.closest("a[href]");
      if (!a) return;
      if (a.target && a.target !== "_self") return;
      if (a.hasAttribute("download") || a.hasAttribute("data-no-route")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname.indexOf("/websye/") !== -1) return;           // mini-website terpisah
      const last = url.pathname.split("/").pop();
      if (last && last.indexOf(".") !== -1 && !/\.html?$/i.test(last)) return; // file (gambar, mp3, dll)
      if (pageKey(url.href) === currentKey) {
        if (url.hash) return;                                         // lompat ke bagian di halaman yang sama
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      e.preventDefault();
      go(url.href, true);
    });

    // Tombol Back/Forward (termasuk tombol bawaan HP & Chrome)
    window.addEventListener("popstate", function () {
      if (pageKey(location.href) === currentKey) return; // hanya ganti #hash
      go(location.href, false);
    });
  }
})();
