/* ==========================================================
   GALLERY.JS — khusus halaman Gallery
   Fitur: filter Foto/Video + lightbox (panah, keyboard, geser)
   ========================================================== */
(function () {
  "use strict";

  const shots = Array.prototype.slice.call(document.querySelectorAll(".shot"));
  const chips = document.querySelectorAll(".chip[data-filter]");
  const empty = document.getElementById("empty");
  const box = document.getElementById("lightbox");
  if (!box) return;

  const stage = box.querySelector(".lb-stage");
  const titleEl = box.querySelector(".lb-title");
  const descEl = box.querySelector(".lb-desc");
  const countEl = box.querySelector(".lb-count");
  const btnPrev = box.querySelector(".lb-prev");
  const btnNext = box.querySelector(".lb-next");
  const btnClose = box.querySelector(".lb-close");

  let current = 0;       // indeks di dalam daftar yang sedang tampil
  let lastFocus = null;

  // 1. Filter + susunan Pinterest -------------------------------------------
  const grid = document.getElementById("gallery");
  const holder = document.createElement("div");   // tempat menyimpan item yang disembunyikan
  holder.hidden = true;
  let colCount = 0;

  function visibleShots() {
    return shots.filter(function (s) { return !s.hidden; });
  }

  function columnsFor(width) {
    if (window.innerWidth <= 960) return 2;                    // HP & tablet: 2 kolom
    return Math.max(3, Math.min(12, Math.floor(width / 260))); // desktop: makin lebar / zoom out, makin banyak kolom
  }

  function ratio(el) {
    const img = el.querySelector("img");
    const w = parseFloat(img.getAttribute("width")) || img.naturalWidth || 1;
    const h = parseFloat(img.getAttribute("height")) || img.naturalHeight || 1;
    return h / w;
  }

  // Masonry: tiap foto ditaruh di kolom yang paling pendek -> rapi, foto tidak dipotong
  function layout(force) {
    if (!grid) return;
    const n = columnsFor(grid.clientWidth || grid.parentNode.clientWidth);
    if (!force && n === colCount) return;
    colCount = n;
    shots.forEach(function (s) { holder.appendChild(s); });
    grid.textContent = "";
    grid.appendChild(holder);
    const cols = [], heights = [];
    for (let i = 0; i < n; i++) {
      const c = document.createElement("div");
      c.className = "gcol";
      grid.appendChild(c); cols.push(c); heights.push(0);
    }
    visibleShots().forEach(function (s) {
      let k = 0;
      for (let i = 1; i < n; i++) if (heights[i] < heights[k] - 0.001) k = i;
      cols[k].appendChild(s);
      heights[k] += ratio(s);
    });
  }

  function applyFilter(type) {
    shots.forEach(function (s) {
      const show = type === "all" || s.dataset.type === type;
      s.hidden = !show;
      if (show) s.classList.add("visible");
    });
    chips.forEach(function (c) {
      c.setAttribute("aria-pressed", String(c.dataset.filter === type));
    });
    if (empty) empty.hidden = visibleShots().length > 0;
    layout(true);
  }

  chips.forEach(function (c) {
    c.addEventListener("click", function () { applyFilter(c.dataset.filter); });
  });
  applyFilter("all");

  // Foto tanpa ukuran di konten.js: susun ulang setelah gambarnya selesai dimuat
  let lt;
  shots.forEach(function (s) {
    const im = s.querySelector("img");
    if (im && !im.getAttribute("width")) {
      im.addEventListener("load", function () {
        clearTimeout(lt);
        lt = setTimeout(function () { layout(true); }, 50);
      });
    }
  });

  // zoom in/out atau putar layar -> jumlah kolom menyesuaikan
  let rt;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () { layout(false); }, 80);
  });

  // 2. Lightbox -------------------------------------------------------------
  function render() {
    const list = visibleShots();
    const item = list[current];
    if (!item) return;

    // hentikan video sebelumnya, lalu kosongkan panggung
    const old = stage.querySelector("video");
    if (old) old.pause();
    stage.textContent = "";

    let media;
    if (item.dataset.type === "video") {
      media = document.createElement("video");
      media.src = item.dataset.full;
      media.controls = true;
      media.playsInline = true;
      media.autoplay = true;
    } else {
      media = document.createElement("img");
      media.src = item.dataset.full;
      media.alt = item.dataset.title || "";
    }
    stage.appendChild(media);

    titleEl.textContent = item.dataset.title || "";
    descEl.textContent = item.dataset.desc || "";
    countEl.textContent = (current + 1) + " / " + list.length;

    const single = list.length < 2;
    btnPrev.hidden = single;
    btnNext.hidden = single;
  }

  function open(item) {
    lastFocus = document.activeElement;
    current = visibleShots().indexOf(item);
    if (current < 0) current = 0;
    render();
    if (typeof box.showModal === "function") box.showModal();
    else box.setAttribute("open", "");
    document.documentElement.style.overflow = "hidden";
  }

  function close() {
    if (typeof box.close === "function") box.close();
    else box.removeAttribute("open");
  }

  // dipanggil setiap lightbox tertutup (tombol, Esc, atau klik latar)
  box.addEventListener("close", function () {
    const v = stage.querySelector("video");
    if (v) v.pause();
    stage.textContent = "";
    document.documentElement.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  });

  function step(dir) {
    const n = visibleShots().length;
    if (n < 2) return;
    current = (current + dir + n) % n;
    render();
  }

  shots.forEach(function (s) {
    s.addEventListener("click", function () { open(s); });
  });
  btnClose.addEventListener("click", close);
  btnPrev.addEventListener("click", function () { step(-1); });
  btnNext.addEventListener("click", function () { step(1); });

  // klik di area gelap (di luar foto) menutup lightbox
  box.addEventListener("click", function (e) {
    if (e.target === box || e.target === box.querySelector(".lb-figure") || e.target === stage) close();
  });

  // keyboard: panah kiri/kanan (Esc sudah ditangani <dialog>)
  document.addEventListener("keydown", function (e) {
    if (!box.open) return;
    if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
  });

  // geser jari di layar sentuh
  let startX = null;
  box.addEventListener("touchstart", function (e) {
    startX = e.touches.length === 1 ? e.touches[0].clientX : null;
  }, { passive: true });
  box.addEventListener("touchend", function (e) {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    startX = null;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
  }, { passive: true });
})();
