/* ==========================================================
   DONATION.JS — hanya untuk halaman Donation
   Form donasi: pilih nominal, metode, lalu tampilkan rincian pembayaran.
   ========================================================== */
(function () {
  "use strict";

  /* ---- UBAH DI SINI: detail pembayaran milikmu ----
     Nilai di bawah hanya contoh. Ganti dengan data asli sebelum website dipublikasikan.
     Untuk QRIS, taruh gambar QR di assets/images/qris.png lalu isi "image". */
  const PAYMENT = {
    qris:    { label: "QRIS", image: "", note: "Scan kode QR dengan aplikasi e-wallet atau m-banking, lalu masukkan nominal sesuai donasi." },
    bank:    { label: "Transfer bank", name: "Nama Bank — a.n. Nama Kamu", number: "0000 0000 0000", note: "Transfer sesuai nominal donasi." },
    ewallet: { label: "E-wallet", name: "DANA / GoPay / OVO — a.n. Nama Kamu", number: "0800 0000 0000", note: "Kirim sesuai nominal donasi." }
  };
  const MIN_AMOUNT = 1000;
  const MAX_AMOUNT = 100000000;

  const form = document.getElementById("donate-form");
  if (!form) return;
  const thanks = document.getElementById("thanks");
  const chips = form.querySelectorAll(".chip");
  const customWrap = document.getElementById("custom-wrap");
  const customInput = document.getElementById("custom-amount");
  const amountError = document.getElementById("amount-error");
  const nameInput = document.getElementById("donor-name");
  const anon = document.getElementById("anon");
  const msg = document.getElementById("donor-msg");
  const msgCount = document.getElementById("msg-count");
  const submitTotal = document.getElementById("submit-total");

  let selected = 25000; // angka, atau "custom"

  function rupiah(n) { return "Rp " + Number(n).toLocaleString("id-ID"); }
  function esc(t) {
    return String(t).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function currentAmount() {
    if (selected === "custom") return parseInt(customInput.value.replace(/\D/g, ""), 10) || 0;
    return selected;
  }
  function updateTotal() {
    const a = currentAmount();
    submitTotal.textContent = a > 0 ? rupiah(a) : "";
  }
  function setError(text) {
    amountError.textContent = text;
    customInput.setAttribute("aria-invalid", text && selected === "custom" ? "true" : "false");
  }

  // Pilih nominal
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      const v = chip.dataset.amount;
      selected = v === "custom" ? "custom" : parseInt(v, 10);
      chips.forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
      customWrap.hidden = selected !== "custom";
      if (selected === "custom") customInput.focus();
      setError("");
      updateTotal();
    });
  });

  // Nominal lain: hanya angka, diberi titik pemisah ribuan
  customInput.addEventListener("input", function () {
    const digits = customInput.value.replace(/\D/g, "").slice(0, 9);
    customInput.value = digits ? Number(digits).toLocaleString("id-ID") : "";
    setError("");
    updateTotal();
  });

  // Anonim & penghitung pesan
  anon.addEventListener("change", function () {
    nameInput.disabled = anon.checked;
    if (anon.checked) nameInput.value = "";
  });
  msg.addEventListener("input", function () { msgCount.textContent = msg.value.length; });

  // Kirim
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const amount = currentAmount();
    if (amount < MIN_AMOUNT) { setError("Minimal donasi " + rupiah(MIN_AMOUNT) + "."); (selected === "custom" ? customInput : chips[0]).focus(); return; }
    if (amount > MAX_AMOUNT) { setError("Maksimal " + rupiah(MAX_AMOUNT) + " per donasi."); customInput.focus(); return; }

    const key = form.querySelector('input[name="method"]:checked').value;
    const pay = PAYMENT[key];
    const donor = anon.checked || !nameInput.value.trim() ? "Anonim" : nameInput.value.trim();
    const note = msg.value.trim();

    let rows = "<div><dt>Donatur</dt><dd>" + esc(donor) + "</dd></div>" +
               "<div><dt>Nominal</dt><dd>" + rupiah(amount) + "</dd></div>" +
               "<div><dt>Metode</dt><dd>" + esc(pay.label) + "</dd></div>";
    if (note) rows += "<div><dt>Pesan</dt><dd>" + esc(note) + "</dd></div>";
    document.getElementById("receipt").innerHTML = rows;

    let detail = "";
    if (key === "qris") {
      detail = pay.image
        ? '<img src="../' + esc(pay.image) + '" alt="Kode QRIS" style="max-width:220px;margin:0 auto;border-radius:20px">'
        : "";
    } else {
      detail = '<strong>' + esc(pay.name) + '</strong>' +
        '<div class="num"><span id="pay-num">' + esc(pay.number) + '</span>' +
        '<button type="button" class="copy" id="copy-btn">Salin</button></div>';
    }
    detail += '<p class="pay-note">' + esc(pay.note) + "</p>";
    document.getElementById("pay-detail").innerHTML = detail;

    const copyBtn = document.getElementById("copy-btn");
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        const num = pay.number.replace(/\s/g, "");
        const done = function () { copyBtn.textContent = "Tersalin"; setTimeout(function () { copyBtn.textContent = "Salin"; }, 1800); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(num).then(done, function () {});
      });
    }

    document.getElementById("thanks-title").textContent = "Terima kasih, " + (donor === "Anonim" ? "teman" : donor) + "!";
    form.hidden = true;
    thanks.hidden = false;
    thanks.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  // Donasi lagi
  document.getElementById("again").addEventListener("click", function () {
    form.reset();
    selected = 25000;
    chips.forEach(function (c) { c.setAttribute("aria-pressed", String(c.dataset.amount === "25000")); });
    customWrap.hidden = true;
    nameInput.disabled = false;
    msgCount.textContent = "0";
    setError("");
    updateTotal();
    thanks.hidden = true;
    form.hidden = false;
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  });
})();
