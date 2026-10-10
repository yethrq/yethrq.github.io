/* ==========================================================
   PORTFOLIO.JS — hanya untuk halaman Portfolio
   Filter proyek berdasarkan kategori.
   ========================================================== */
(function () {
  "use strict";
  const chips = document.querySelectorAll(".chip");
  const works = document.querySelectorAll(".work");
  const empty = document.getElementById("works-empty");

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      const cat = chip.dataset.filter;
      chips.forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
      let shown = 0;
      works.forEach(function (w) {
        const match = cat === "all" || w.dataset.cat === cat;
        w.hidden = !match;
        if (match) shown++;
      });
      if (empty) empty.hidden = shown > 0;
    });
  });
})();
