/* ==========================================================
   SHOP.JS — khusus halaman Shop (tidak perlu diubah)
   Daftar produk dibaca dari js/konten.js (bagian "toko").
   Keranjang disimpan di browser (localStorage) supaya tidak
   hilang saat pindah halaman. Pesanan dikirim lewat WhatsApp.
   ========================================================== */
(function () {
  "use strict";

  const grid = document.getElementById("shop-grid");
  if (!grid) return;

  const T = (window.KONTEN && window.KONTEN.toko) || {};
  const CART_KEY = "shop-cart";
  const MAX_QTY = 99;

  // ---------- data produk ----------
  function slug(t) {
    return String(t || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
  const products = (T.produk || [])
    .filter(function (p) { return p && p.nama; })
    .map(function (p, i) {
      const limited = typeof p.stok === "number";
      const harga = Math.max(0, Number(p.harga) || 0);
      const asli = Math.max(0, Number(p.hargaAsli) || 0);
      const rating = Math.max(0, Math.min(5, Number(p.rating) || 0));
      return {
        hargaAsli: asli > harga ? asli : 0,
        diskon: asli > harga ? Math.round((1 - harga / asli) * 100) : 0,
        rating: rating,
        id: String(p.id || slug(p.nama) || "produk-" + i),
        nama: String(p.nama),
        kategori: p.kategori ? String(p.kategori) : "",
        harga: harga,
        deskripsi: p.deskripsi ? String(p.deskripsi) : "",
        foto: p.foto ? "../assets/shop/products/" + p.foto : "",
        label: p.label ? String(p.label) : "",
        stok: limited ? Math.max(0, Math.floor(p.stok)) : null, // null = tidak dibatasi
      };
    });
  const byId = {};
  products.forEach(function (p) { byId[p.id] = p; });

  function maxQty(p) { return p.stok === null ? MAX_QTY : Math.min(MAX_QTY, p.stok); }
  function rupiah(n) { return "Rp " + Math.round(n).toLocaleString("id-ID"); }

  // ---------- elemen ----------
  const $ = function (id) { return document.getElementById(id); };
  const filterBox = $("shop-filter");
  const countEl = $("shop-count");
  const emptyEl = $("shop-empty");
  const fab = $("cart-open");
  const badge = $("cart-badge");
  const backdrop = $("cart-backdrop");
  const drawer = $("cart");
  const closeBtn = $("cart-close");
  const list = $("cart-list");
  const emptyMsg = $("cart-empty");
  const foot = $("cart-foot");
  const totalEl = $("cart-total");
  const nameIn = $("cart-name");
  const noteIn = $("cart-note");
  const sendBtn = $("cart-send");
  const copyBtn = $("cart-copy");
  const clearBtn = $("cart-clear");
  const msgEl = $("cart-msg");

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }
  const STAR =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z"/></svg>';
  function ratingRow(r) {
    const row = el("div", "pcard-rate");
    const st = el("span", "stars");
    st.setAttribute("role", "img");
    st.setAttribute("aria-label", "Rating " + r.toFixed(1) + " dari 5");
    const bg = el("span", "stars-bg");
    bg.innerHTML = STAR.repeat(5);
    const fg = el("span", "stars-fg");
    fg.innerHTML = STAR.repeat(5);
    fg.style.width = (r / 5) * 100 + "%";
    st.appendChild(bg);
    st.appendChild(fg);
    row.appendChild(st);
    row.appendChild(el("span", "rate-num", r.toFixed(1)));
    return row;
  }
  function priceLine(p, cls) {
    const box = el("div", cls);
    if (p.diskon) box.appendChild(el("s", "price-old", rupiah(p.hargaAsli)));
    box.appendChild(el("strong", "price-now", rupiah(p.harga)));
    return box;
  }
  const ICON_BAG =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8V7a3 3 0 0 1 6 0v1"/></svg>';

  // ---------- keranjang (aman bila localStorage diblokir) ----------
  let cart = {};
  function loadCart() {
    try {
      const raw = JSON.parse(localStorage.getItem(CART_KEY) || "{}");
      Object.keys(raw).forEach(function (id) {
        const p = byId[id];
        const q = Math.floor(Number(raw[id]) || 0);
        if (p && q > 0 && maxQty(p) > 0) cart[id] = Math.min(q, maxQty(p));
      });
    } catch (e) { cart = {}; }
  }
  function saveCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {}
  }
  function count() { return Object.keys(cart).reduce(function (n, id) { return n + cart[id]; }, 0); }
  function total() { return Object.keys(cart).reduce(function (n, id) { return n + cart[id] * byId[id].harga; }, 0); }

  // ---------- daftar produk ----------
  const cards = [];
  const addBtns = {};

  function buildCard(p) {
    const card = el("article", "pcard reveal" + (maxQty(p) === 0 ? " soldout" : ""));
    card.dataset.cat = p.kategori;

    const media = el("div", "pcard-media");
    if (p.foto) {
      const img = document.createElement("img");
      img.src = p.foto;
      img.alt = p.nama;
      img.loading = "lazy";
      img.addEventListener("error", function () { img.remove(); media.insertAdjacentHTML("beforeend", ICON_BAG); });
      media.appendChild(img);
    } else {
      media.innerHTML = ICON_BAG;
    }
    if (p.label) media.insertAdjacentElement("afterbegin", el("span", "pcard-tag", p.label));
    if (p.diskon) {
      const off = el("span", "pcard-off", "-" + p.diskon + "%");
      off.setAttribute("aria-label", "Diskon " + p.diskon + " persen");
      media.appendChild(off);
    }

    const body = el("div", "pcard-body");
    if (p.kategori) body.appendChild(el("span", "pcard-cat", p.kategori));
    body.appendChild(el("h3", "", p.nama));
    if (p.rating) body.appendChild(ratingRow(p.rating));
    if (p.deskripsi) body.appendChild(el("p", "pcard-desc", p.deskripsi));

    const foot = el("div", "pcard-foot");
    const price = priceLine(p, "pcard-price");
    if (p.stok !== null && p.stok > 0 && p.stok <= 10) price.appendChild(el("span", "pcard-stock", "Sisa " + p.stok));
    const btn = el("button", "btn btn-primary small btn-add", maxQty(p) === 0 ? "Habis" : "Tambah");
    btn.type = "button";
    btn.dataset.id = p.id;
    btn.disabled = maxQty(p) === 0;
    btn.setAttribute("aria-label", (maxQty(p) === 0 ? "Habis: " : "Tambah ke keranjang: ") + p.nama);
    btn.addEventListener("click", function () { add(p.id, btn); });
    addBtns[p.id] = btn;
    foot.appendChild(price);
    foot.appendChild(btn);
    body.appendChild(foot);

    card.appendChild(media);
    card.appendChild(body);
    return card;
  }

  products.forEach(function (p) {
    const c = buildCard(p);
    cards.push(c);
    grid.appendChild(c);
  });

  // ---------- filter kategori ----------
  let activeCat = "";
  function applyFilter() {
    let shown = 0;
    cards.forEach(function (c) {
      const ok = !activeCat || c.dataset.cat === activeCat;
      c.hidden = !ok;
      if (ok) shown++;
    });
    countEl.textContent = products.length ? shown + " produk" : "";
    emptyEl.hidden = products.length > 0;
    if (filterBox) {
      filterBox.querySelectorAll(".fchip").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.dataset.cat === activeCat));
      });
    }
  }
  const cats = [];
  products.forEach(function (p) { if (p.kategori && cats.indexOf(p.kategori) === -1) cats.push(p.kategori); });
  if (filterBox && cats.length > 1) {
    ["" ].concat(cats).forEach(function (c) {
      const b = el("button", "fchip", c || "Semua");
      b.type = "button";
      b.dataset.cat = c;
      b.addEventListener("click", function () { activeCat = c; applyFilter(); });
      filterBox.appendChild(b);
    });
  }

  // ---------- aksi keranjang ----------
  function add(id, btn) {
    const p = byId[id];
    if (!p) return;
    const cur = cart[id] || 0;
    if (cur >= maxQty(p)) { flash(btn, "Stok habis"); return; }
    cart[id] = cur + 1;
    saveCart();
    render();
    flash(btn, "Ditambahkan");
    fab.classList.remove("bump");
    void fab.offsetWidth; // mulai ulang animasi
    fab.classList.add("bump");
  }
  function flash(btn, text) {
    if (!btn) return;
    const old = btn.dataset.label || btn.textContent;
    btn.dataset.label = old;
    btn.textContent = text;
    btn.classList.add("added");
    clearTimeout(btn._t);
    btn._t = setTimeout(function () { btn.textContent = old; btn.classList.remove("added"); }, 1100);
  }
  function setQty(id, q) {
    const p = byId[id];
    if (!p) return;
    q = Math.max(0, Math.min(q, maxQty(p)));
    if (q === 0) delete cart[id]; else cart[id] = q;
    saveCart();
    render();
  }

  function render() {
    const n = count();
    badge.textContent = String(n);
    badge.hidden = n === 0;
    fab.setAttribute("aria-label", n ? "Buka keranjang, " + n + " barang" : "Buka keranjang");

    list.innerHTML = "";
    const ids = Object.keys(cart);
    emptyMsg.hidden = ids.length > 0;
    foot.hidden = ids.length === 0;

    ids.forEach(function (id) {
      const p = byId[id];
      const li = el("li", "citem");

      const th = el("span", "citem-thumb");
      if (p.foto) {
        const im = document.createElement("img");
        im.src = p.foto; im.alt = ""; im.loading = "lazy";
        im.addEventListener("error", function () { im.remove(); th.innerHTML = ICON_BAG; });
        th.appendChild(im);
      } else th.innerHTML = ICON_BAG;

      const mid = el("div", "citem-mid");
      mid.appendChild(el("div", "citem-name", p.nama));
      mid.appendChild(priceLine(p, "citem-price"));
      const q = el("div", "citem-qty");
      const minus = el("button", "qbtn", "−");
      minus.type = "button";
      minus.setAttribute("aria-label", "Kurangi " + p.nama);
      minus.addEventListener("click", function () { setQty(id, cart[id] - 1); });
      const num = el("span", "qnum", String(cart[id]));
      num.setAttribute("aria-live", "polite");
      const plus = el("button", "qbtn", "+");
      plus.type = "button";
      plus.setAttribute("aria-label", "Tambah " + p.nama);
      plus.disabled = cart[id] >= maxQty(p);
      plus.addEventListener("click", function () { setQty(id, cart[id] + 1); });
      q.appendChild(minus); q.appendChild(num); q.appendChild(plus);
      mid.appendChild(q);

      const side = el("div", "citem-side");
      side.appendChild(el("span", "citem-sum", rupiah(cart[id] * p.harga)));
      const del = el("button", "citem-del", "Hapus");
      del.type = "button";
      del.setAttribute("aria-label", "Hapus " + p.nama + " dari keranjang");
      del.addEventListener("click", function () { setQty(id, 0); });
      side.appendChild(del);

      li.appendChild(th); li.appendChild(mid); li.appendChild(side);
      list.appendChild(li);
    });
    totalEl.textContent = rupiah(total());
  }

  // ---------- panel keranjang ----------
  let lastFocus = null;
  function openCart() {
    lastFocus = document.activeElement;
    msgEl.textContent = "";
    backdrop.hidden = false;
    drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("cart-open");
    fab.setAttribute("aria-expanded", "true");
    requestAnimationFrame(function () {
      backdrop.classList.add("show");
      drawer.classList.add("open");
      closeBtn.focus({ preventScroll: true });
    });
  }
  function closeCart() {
    backdrop.classList.remove("show");
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("cart-open");
    fab.setAttribute("aria-expanded", "false");
    setTimeout(function () { if (!drawer.classList.contains("open")) backdrop.hidden = true; }, 320);
    if (lastFocus && lastFocus.focus && document.body.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  }
  fab.addEventListener("click", openCart);
  closeBtn.addEventListener("click", closeCart);
  backdrop.addEventListener("click", closeCart);

  function onKey(e) {
    if (!document.body.contains(drawer)) { document.removeEventListener("keydown", onKey); return; }
    if (!drawer.classList.contains("open")) return;
    if (e.key === "Escape") { closeCart(); return; }
    if (e.key === "Tab") { // fokus tetap di dalam panel
      const f = drawer.querySelectorAll("button:not([disabled]), input, textarea");
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }
  document.addEventListener("keydown", onKey);

  // ---------- kirim / salin pesanan ----------
  function orderText() {
    const lines = ["Halo, saya mau pesan dari " + (T.namaToko || "toko") + ":", ""];
    Object.keys(cart).forEach(function (id, i) {
      const p = byId[id];
      lines.push((i + 1) + ". " + p.nama + " x" + cart[id] + " = " + rupiah(cart[id] * p.harga));
    });
    lines.push("", "Total: " + rupiah(total()));
    const nm = nameIn.value.trim();
    const nt = noteIn.value.trim();
    if (nm) lines.push("", "Nama: " + nm);
    if (nt) lines.push("Catatan: " + nt);
    return lines.join("\n");
  }
  function waNumber() {
    let n = String(T.whatsapp || "").replace(/\D/g, "");
    if (n.indexOf("0") === 0) n = "62" + n.slice(1);
    return n;
  }
  function say(t) { msgEl.textContent = t; }

  sendBtn.addEventListener("click", function () {
    if (!count()) return;
    const num = waNumber();
    if (!num) {
      say("Nomor WhatsApp toko belum diisi. Pakai Salin pesanan dulu.");
      return;
    }
    const url = "https://wa.me/" + num + "?text=" + encodeURIComponent(orderText());
    const w = window.open(url, "_blank");
    if (w) { try { w.opener = null; } catch (e) {} }
    else window.location.href = url; // kalau tab baru diblokir, buka di tab ini
    say("");
  });

  copyBtn.addEventListener("click", function () {
    if (!count()) return;
    const text = orderText();
    function fallback() {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;top:0;left:0;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand("copy"); } catch (e) {}
      ta.remove();
      say(ok ? "Pesanan disalin." : "Gagal menyalin. Salin manual dari keranjang.");
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { say("Pesanan disalin."); }, fallback);
    } else fallback();
  });

  clearBtn.addEventListener("click", function () {
    cart = {};
    saveCart();
    render();
    say("");
  });

  // ---------- mulai ----------
  loadCart();
  applyFilter();
  render();
  if (typeof window.refreshReveal === "function") window.refreshReveal();
})();
