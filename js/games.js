/* ==========================================================
   GAMES.JS — khusus halaman Games
   Dua game mini: Memory Match dan Tap Cepat.
   Skor terbaik disimpan di browser (localStorage).
   ========================================================== */
(function () {
  "use strict";

  const memBoard = document.getElementById("mem-board");
  const tapPad = document.getElementById("tap-pad");
  if (!memBoard || !tapPad) return;

  // ---------- penyimpanan skor terbaik (aman bila localStorage diblokir) ----------
  function load(key) {
    try { const v = localStorage.getItem(key); return v === null ? null : Number(v); } catch (e) { return null; }
  }
  function save(key, val) {
    try { localStorage.setItem(key, String(val)); } catch (e) {}
  }
  function fmt(sec) {
    const s = Math.floor(sec);
    return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
  }
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* =========================================================
     MEMORY MATCH
     ========================================================= */
  (function memory() {
    const ICONS = ["⚽", "🎧", "🎮", "🌻", "🔥", "🌸"];
    const movesEl = document.getElementById("mem-moves");
    const timeEl = document.getElementById("mem-time");
    const bestEl = document.getElementById("mem-best");
    const msgEl = document.getElementById("mem-msg");
    const resetBtn = document.getElementById("mem-reset");
    const BEST_KEY = "game-memory-best";

    let first = null, lock = false, moves = 0, matched = 0, started = 0, timer = null;

    function shuffle(a) {
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
    }
    function showBest() {
      const b = load(BEST_KEY);
      bestEl.textContent = b ? b + " langkah" : "–";
    }
    function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }

    function build() {
      stopTimer();
      first = null; lock = false; moves = 0; matched = 0; started = 0;
      movesEl.textContent = "0"; timeEl.textContent = "0:00"; msgEl.textContent = "";
      memBoard.innerHTML = "";
      shuffle(ICONS.concat(ICONS)).forEach(function (icon) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "mem-card";
        b.dataset.icon = icon;
        b.setAttribute("aria-label", "Kartu tertutup");
        b.innerHTML = '<span class="face back"></span><span class="face front" aria-hidden="true">' + icon + "</span>";
        b.addEventListener("click", function () { flip(b); });
        memBoard.appendChild(b);
      });
      showBest();
    }

    function flip(card) {
      if (lock || card.classList.contains("flipped") || card.classList.contains("matched")) return;
      if (!started) {
        started = Date.now();
        timer = setInterval(function () {
          if (!document.body.contains(memBoard)) { stopTimer(); return; }
          timeEl.textContent = fmt((Date.now() - started) / 1000);
        }, 250);
      }
      card.classList.add("flipped");
      card.setAttribute("aria-label", "Kartu " + card.dataset.icon);
      if (!first) { first = card; return; }

      moves++;
      movesEl.textContent = String(moves);
      const a = first, b = card;
      first = null;

      if (a.dataset.icon === b.dataset.icon) {
        [a, b].forEach(function (c) { c.classList.add("matched"); c.disabled = true; });
        matched++;
        if (matched === ICONS.length) win();
      } else {
        lock = true;
        setTimeout(function () {
          [a, b].forEach(function (c) {
            c.classList.remove("flipped");
            c.setAttribute("aria-label", "Kartu tertutup");
          });
          lock = false;
        }, reduceMotion ? 500 : 800);
      }
    }

    function win() {
      stopTimer();
      const secs = (Date.now() - started) / 1000;
      timeEl.textContent = fmt(secs);
      const best = load(BEST_KEY);
      if (!best || moves < best) {
        save(BEST_KEY, moves);
        msgEl.textContent = "Rekor baru! " + moves + " langkah dalam " + fmt(secs) + ".";
      } else {
        msgEl.textContent = "Selesai dalam " + moves + " langkah. Coba lebih sedikit!";
      }
      showBest();
    }

    resetBtn.addEventListener("click", build);
    build();
  })();

  /* =========================================================
     TAP CEPAT
     ========================================================= */
  (function tap() {
    const DURATION = 10;
    const scoreEl = document.getElementById("tap-score");
    const timeEl = document.getElementById("tap-time");
    const bestEl = document.getElementById("tap-best");
    const labelEl = document.getElementById("tap-label");
    const msgEl = document.getElementById("tap-msg");
    const resetBtn = document.getElementById("tap-reset");
    const BEST_KEY = "game-tap-best";

    let score = 0, running = false, endAt = 0, timer = null, cooling = false;

    function showBest() {
      const b = load(BEST_KEY);
      bestEl.textContent = b ? String(b) : "–";
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    function reset() {
      stop();
      score = 0; running = false; cooling = false;
      scoreEl.textContent = "0";
      timeEl.textContent = DURATION.toFixed(1);
      labelEl.textContent = "Mulai";
      msgEl.textContent = "";
      tapPad.disabled = false;
      showBest();
    }

    function finish() {
      stop();
      running = false;
      timeEl.textContent = "0.0";
      tapPad.disabled = true;
      cooling = true;
      labelEl.textContent = "Selesai";
      const best = load(BEST_KEY);
      if (!best || score > best) {
        save(BEST_KEY, score);
        msgEl.textContent = "Rekor baru: " + score + " tap!";
      } else {
        msgEl.textContent = "Skor kamu " + score + " tap. Rekor: " + best + ".";
      }
      showBest();
      setTimeout(function () {
        cooling = false;
        tapPad.disabled = false;
        labelEl.textContent = "Main lagi";
      }, 900);
    }

    function start() {
      score = 0;
      running = true;
      scoreEl.textContent = "0";
      msgEl.textContent = "";
      endAt = Date.now() + DURATION * 1000;
      timer = setInterval(function () {
        if (!document.body.contains(tapPad)) { stop(); return; }
        const left = (endAt - Date.now()) / 1000;
        if (left <= 0) finish();
        else timeEl.textContent = left.toFixed(1);
      }, 50);
    }

    tapPad.addEventListener("click", function () {
      if (cooling) return;
      if (!running) {
        // tap pertama (atau "Main lagi") memulai permainan sekaligus dihitung 1 tap
        start();
      }
      score++;
      scoreEl.textContent = String(score);
      labelEl.textContent = "Tap!";
      tapPad.classList.add("hit");
      setTimeout(function () { tapPad.classList.remove("hit"); }, 70);
    });

    resetBtn.addEventListener("click", reset);
    reset();
  })();
})();
