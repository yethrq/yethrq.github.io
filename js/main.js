/* ==========================================================
   MAIN.JS — dipakai SEMUA halaman
   ========================================================== */
(function () {
  "use strict";

  const navbar = document.querySelector(".navbar");
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".nav-links");

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
  menu.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () { setMenu(false); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setMenu(false);
  });

  // 3. Animasi saat scroll gaya iOS — jalan ke bawah DAN ke atas
  //    Elemen .reveal muncul saat masuk layar & hilang lagi saat keluar,
  //    jadi animasinya terulang tiap kali kamu scroll bolak-balik.
  const items = document.querySelectorAll(".reveal");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(function (entries) {
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

  // 3b. Efek yang mengikuti posisi scroll (halus, per frame)
  const heroCopy = document.querySelector(".hero-copy");
  const glowA = document.querySelector(".glow-a");
  const glowB = document.querySelector(".glow-b");
  const depthEls = document.querySelectorAll(".card.reveal, .intro.reveal");
  let ticking = false;
  const clamp = function (v, a, b) { return Math.min(Math.max(v, a), b); };

  function updateScrollFx() {
    ticking = false;
    const y = window.scrollY;
    const vh = window.innerHeight;
    if (reduceMotion) return;

    // Hero: baru mulai mengecil & memudar setelah scroll agak jauh,
    // jadi tombol di bawahnya tetap jelas (tanpa blur) saat pertama kali muncul.
    if (heroCopy && y < vh * 1.3) {
      const dead = vh * 0.3;                        // jarak scroll awal tanpa efek
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
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(updateScrollFx); }
  }, { passive: true });
  window.addEventListener("resize", updateScrollFx);
  updateScrollFx();

  // 4. Perpindahan halaman: langsung (tanpa layar penutup).
  //    Animasi masuk ditangani CSS (lihat 'Transisi halaman' di global.css).

  // 5. Tombol ganti tema (gelap / terang), pilihan disimpan di browser
  const themeBtn = document.querySelector(".theme-toggle");
  const root = document.documentElement;
  function syncSwitch() {
    if (themeBtn) themeBtn.setAttribute("aria-checked", String(root.dataset.theme === "light"));
  }
  syncSwitch();
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      const next = root.dataset.theme === "light" ? "dark" : "light";
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        root.classList.add("theme-anim");
        setTimeout(function () { root.classList.remove("theme-anim"); }, 450);
      }
      root.dataset.theme = next;
      try { localStorage.setItem("theme", next); } catch (e) {}
      syncSwitch();
    });
  }

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

    // Simpan posisi lagu saat pindah halaman (hanya berlaku selama tab ini terbuka)
    window.addEventListener("pagehide", function () {
      sstore("musicTime", String(music.currentTime));
    });

    // Lanjutkan musik jika sebelumnya dinyalakan
    if (load("music") === "on") {
      const savedTime = parseFloat(sload("musicTime")) || 0;
      music.addEventListener("loadedmetadata", function () {
        if (savedTime < music.duration) music.currentTime = savedTime;
      }, { once: true });

      music.play().then(function () {
        setMusicUI(true);
      }).catch(function () {
        // Browser menahan musik otomatis: lanjutkan pada sentuhan pertama
        function resume(e) {
          document.removeEventListener("pointerdown", resume);
          document.removeEventListener("keydown", resume);
          if (e.target.closest && e.target.closest(".music-toggle, .p-play")) return;
          music.play().then(function () { setMusicUI(true); }).catch(function () {});
        }
        document.addEventListener("pointerdown", resume);
        document.addEventListener("keydown", resume);
      });
    }
  }

  // 7. Setelah tombol diklik dengan mouse/sentuhan, lepas fokusnya.
  //    Supaya saat menekan tombol keyboard/volume tidak muncul lingkaran biru.
  //    (Navigasi dengan tombol Tab tetap menampilkan penanda fokus.)
  document.querySelectorAll(".music-toggle, .theme-toggle, .nav-toggle").forEach(function (b) {
    b.addEventListener("click", function (e) {
      if (e.detail > 0) b.blur();
    });
  });

  // 8. Tahun otomatis di footer
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
