/* ==========================================================
   MUSIC.JS — khusus halaman Music
   - Lagu di halaman ini diputar lewat #page-audio (terpisah).
   - Lagu Legacy (#bg-music) tetap hanya dikontrol tombol kecil di navbar
     (ditangani main.js) dan tidak pernah diganti.
   - Saat lagu di sini diputar, Legacy dijeda. Saat Legacy dinyalakan
     lagi dari navbar, lagu di sini dijeda dan Legacy lanjut dari posisinya.
   ========================================================== */
(function () {
  "use strict";

  const bg = document.getElementById("bg-music");
  const audio = document.getElementById("page-audio");
  const list = document.getElementById("tracks");
  if (!bg || !audio || !list) return;

  const tracks = Array.prototype.slice.call(list.querySelectorAll(".track"));
  const titleEl = document.getElementById("p-title");
  const seek = document.getElementById("seek");
  const tNow = document.getElementById("t-now");
  const tAll = document.getElementById("t-all");
  const mainBtn = document.getElementById("play-main");
  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");
  const navBtn = document.querySelector(".music-toggle");
  const artistEl = document.getElementById("p-artist");
  const stateEl = document.getElementById("p-state");
  const vol = document.getElementById("vol");
  const coverImg = document.getElementById("cover-img");
  const bgImg = document.getElementById("np-bg");
  const dir = bg.getAttribute("src").replace(/[^\/]*$/, ""); // folder audio

  let index = 0;
  let seeking = false;

  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function fmt(s) {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60), r = Math.floor(s % 60);
    return m + ":" + (r < 10 ? "0" : "") + r;
  }

  // Tombol bulat di navbar hanya mewakili Legacy
  function syncNav() {
    if (!navBtn) return;
    const on = !bg.paused;
    const label = on ? "Matikan musik" : "Nyalakan musik";
    navBtn.setAttribute("aria-pressed", String(on));
    navBtn.setAttribute("aria-label", label);
    navBtn.title = label;
  }
  bg.addEventListener("play", function () {
    audio.pause();       // Legacy menyala -> lagu halaman ini dijeda
    syncNav();
  });
  bg.addEventListener("pause", syncNav);

  // Sisa waktu gaya iOS: -3:21
  function remain(now) {
    return isFinite(audio.duration) ? "-" + fmt(audio.duration - now) : "-0:00";
  }

  // Tampilan pemutar halaman ini
  function setPlaying(on) {
    if (stateEl) stateEl.textContent = on ? "Sedang diputar" : "Dijeda";
    document.body.classList.toggle("is-playing", on);
    mainBtn.setAttribute("aria-pressed", String(on));
    const label = on ? "Jeda lagu" : "Putar lagu";
    mainBtn.setAttribute("aria-label", label);
    mainBtn.title = label;
  }
  audio.addEventListener("play", function () { setPlaying(true); });
  audio.addEventListener("pause", function () { setPlaying(false); });

  function showCurrent() {
    tracks.forEach(function (t, n) {
      t.classList.toggle("current", n === index);
      t.setAttribute("aria-current", String(n === index));
    });
    titleEl.textContent = tracks[index].dataset.title;
    if (artistEl) artistEl.textContent = tracks[index].dataset.artist || "";
    tAll.textContent = remain(0);
  }

  function load(i) {
    index = (i + tracks.length) % tracks.length;
    audio.src = dir + tracks[index].dataset.file;
    seek.value = 0;
    seek.style.setProperty("--pct", "0%");
    tNow.textContent = "0:00";
    // sampul khusus lagu (opsional): data-cover
    const cov = tracks[index].dataset.cover;
    if (cov) { coverImg.src = cov; bgImg.src = cov; }
    showCurrent();
  }

  function play() {
    if (!audio.src) load(index);
    // Legacy dijeda dan dicatat "mati" supaya tidak menyala sendiri di halaman lain
    if (!bg.paused) bg.pause();
    store("music", "off");
    audio.play().catch(function () {});
  }

  function togglePlay() {
    if (audio.paused) play(); else audio.pause();
  }

  mainBtn.addEventListener("click", togglePlay);
  tracks.forEach(function (t, i) {
    t.addEventListener("click", function () {
      if (i === index && audio.src) { togglePlay(); return; }
      load(i);
      play();
    });
  });

  // Jika lagunya cuma satu, tombol kiri/kanan berfungsi mundur/maju 10 detik
  const multi = tracks.length > 1;
  if (!multi) {
    prevBtn.setAttribute("aria-label", "Mundur 10 detik");
    prevBtn.title = "Mundur 10 detik";
    nextBtn.setAttribute("aria-label", "Maju 10 detik");
    nextBtn.title = "Maju 10 detik";
  }
  prevBtn.addEventListener("click", function () {
    if (!multi) { audio.currentTime = Math.max(0, audio.currentTime - 10); return; }
    if (audio.currentTime > 3) audio.currentTime = 0;
    else { load(index - 1); play(); }
  });
  nextBtn.addEventListener("click", function () {
    if (!multi) {
      if (isFinite(audio.duration)) audio.currentTime = Math.min(audio.duration - 0.5, audio.currentTime + 10);
      return;
    }
    load(index + 1); play();
  });
  audio.addEventListener("ended", function () {
    if (multi) { load(index + 1); play(); }
    else { audio.currentTime = 0; setPlaying(false); }
  });

  // Progres
  audio.addEventListener("timeupdate", function () {
    if (!isFinite(audio.duration) || seeking) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    seek.value = pct;
    seek.style.setProperty("--pct", pct + "%");
    tNow.textContent = fmt(audio.currentTime);
    tAll.textContent = remain(audio.currentTime);
  });
  audio.addEventListener("loadedmetadata", function () { tAll.textContent = remain(audio.currentTime); });
  seek.addEventListener("input", function () {
    seeking = true;
    seek.style.setProperty("--pct", seek.value + "%");
    if (isFinite(audio.duration)) {
      const t = (seek.value / 100) * audio.duration;
      tNow.textContent = fmt(t);
      tAll.textContent = remain(t);
    }
  });
  seek.addEventListener("change", function () {
    if (isFinite(audio.duration)) audio.currentTime = (seek.value / 100) * audio.duration;
    seeking = false;
  });

  // Durasi tiap lagu: baca metadata saja (ringan)
  tracks.forEach(function (t) {
    const probe = new Audio();
    probe.preload = "metadata";
    probe.addEventListener("loadedmetadata", function () {
      t.querySelector(".t-dur").textContent = fmt(probe.duration);
      // lagu aktif: tampilkan sisa waktu penuh sebelum diputar
      if (tracks[index] === t && !isFinite(audio.duration)) tAll.textContent = "-" + fmt(probe.duration);
    });
    probe.src = dir + t.dataset.file;
  });

  // Volume pemutar halaman ini (Legacy punya volume sendiri)
  if (vol) {
    const applyVol = function () {
      audio.volume = vol.value / 100;
      vol.style.setProperty("--pct", vol.value + "%");
    };
    vol.addEventListener("input", applyVol);
    applyVol();
  }

  load(0);
  syncNav();
})();
