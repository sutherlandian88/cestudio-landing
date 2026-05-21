/* ============================================================
   GarageBids Chile — Shared App Logic
   ============================================================ */

/* ── Header scroll ─────────────────────────────────────── */
(function initHeader() {
  const header = document.querySelector(".header");
  if (!header) return;
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 10);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

/* ── Mobile nav ─────────────────────────────────────────── */
(function initMobileNav() {
  const btn = document.getElementById("hamburger");
  const nav = document.getElementById("mobile-nav");
  if (!btn || !nav) return;
  btn.addEventListener("click", () => {
    const open = nav.style.display === "flex";
    nav.style.display = open ? "none" : "flex";
  });
})();

/* ── Active nav link ────────────────────────────────────── */
(function setActiveNav() {
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav a, .mobile-nav a").forEach(a => {
    const href = a.getAttribute("href") || "";
    if (href === path || (path === "index.html" && href === "./") || href.includes(path)) {
      a.classList.add("active");
    }
  });
})();

/* ── Countdown timers ───────────────────────────────────── */
function startCountdown(el, totalMinutes) {
  if (!el) return;
  let remaining = totalMinutes * 60;
  function update() {
    if (remaining <= 0) { el.textContent = "Terminada"; return; }
    const h = Math.floor(remaining / 3600);
    const m = Math.floor((remaining % 3600) / 60);
    const s = remaining % 60;
    if (h > 0) {
      el.textContent = `${h}h ${String(m).padStart(2,"0")}m`;
    } else {
      el.textContent = `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
    }
    if (h < 1) el.classList.add("urgent");
    remaining--;
  }
  update();
  setInterval(update, 1000);
}

/* ── Live Ticker ────────────────────────────────────────── */
(function initTicker() {
  const ticker = document.querySelector(".ticker-inner");
  if (!ticker) return;
  ticker.innerHTML += ticker.innerHTML; // duplicate for seamless loop
})();

/* ── Save (watch) buttons ───────────────────────────────── */
document.addEventListener("click", function(e) {
  const btn = e.target.closest(".card-save-btn");
  if (!btn) return;
  btn.classList.toggle("saved");
  const savedCount = btn.dataset.saved ? parseInt(btn.dataset.saved) : 0;
  const isSaved = btn.classList.contains("saved");
  btn.dataset.saved = isSaved ? savedCount + 1 : Math.max(0, savedCount - 1);
  btn.setAttribute("aria-label", isSaved ? "Guardado" : "Guardar");
  btn.title = isSaved ? "Guardado en tu lista" : "Guardar auto";
});

/* ── Bid Modal ──────────────────────────────────────────── */
(function initBidModal() {
  const overlay = document.getElementById("bid-modal");
  if (!overlay) return;

  const amountInput = document.getElementById("bid-amount-input");
  const feeEl = document.getElementById("bid-fee");
  const totalEl = document.getElementById("bid-total");
  const minBidEl = document.getElementById("bid-min");

  let currentMin = 0;

  function openBidModal(minBid) {
    currentMin = minBid;
    if (minBidEl) minBidEl.textContent = formatCLP(minBid);
    if (amountInput) { amountInput.value = ""; amountInput.min = minBid; }
    if (feeEl) feeEl.textContent = "—";
    if (totalEl) totalEl.textContent = "—";
    overlay.classList.add("open");
    if (amountInput) setTimeout(() => amountInput.focus(), 50);
  }

  document.querySelectorAll("[data-open-bid]").forEach(btn => {
    btn.addEventListener("click", () => {
      const min = parseInt(btn.dataset.openBid || "0");
      openBidModal(min);
    });
  });

  overlay.addEventListener("click", e => {
    if (e.target === overlay) overlay.classList.remove("open");
  });
  document.querySelectorAll("[data-close-modal]").forEach(el => {
    el.addEventListener("click", () => overlay.classList.remove("open"));
  });

  if (amountInput) {
    amountInput.addEventListener("input", () => {
      const val = parseInt(amountInput.value.replace(/\D/g, "")) || 0;
      if (val > 0) {
        const { fee, total } = calcFee(val, 0.03, 150000, 1500000);
        if (feeEl) feeEl.textContent = formatCLP(fee);
        if (totalEl) totalEl.textContent = formatCLP(total);
      } else {
        if (feeEl) feeEl.textContent = "—";
        if (totalEl) totalEl.textContent = "—";
      }
    });
  }

  const submitBtn = document.getElementById("bid-submit");
  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      const val = parseInt((amountInput?.value || "").replace(/\D/g, "")) || 0;
      if (val < currentMin) {
        alert(`La puja mínima es ${formatCLP(currentMin)}`);
        return;
      }
      overlay.classList.remove("open");
      showToast(`Puja de ${formatCLP(val)} registrada. Te notificaremos si te superan.`);
    });
  }
})();

/* ── Question Modal ─────────────────────────────────────── */
(function initQuestionModal() {
  const overlay = document.getElementById("question-modal");
  if (!overlay) return;
  document.querySelectorAll("[data-open-question]").forEach(btn => {
    btn.addEventListener("click", () => overlay.classList.add("open"));
  });
  overlay.addEventListener("click", e => {
    if (e.target === overlay) overlay.classList.remove("open");
  });
  document.querySelectorAll("[data-close-question]").forEach(el => {
    el.addEventListener("click", () => overlay.classList.remove("open"));
  });
  const submitBtn = document.getElementById("question-submit");
  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      const q = document.getElementById("question-text")?.value?.trim();
      if (!q) { alert("Escribe tu pregunta antes de enviar."); return; }
      overlay.classList.remove("open");
      showToast("Pregunta enviada. El vendedor responderá en público.");
    });
  }
})();

/* ── Toast ──────────────────────────────────────────────── */
function showToast(msg, duration = 4000) {
  let t = document.getElementById("gb-toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "gb-toast";
    t.style.cssText = `
      position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);
      background:#111;color:#fff;padding:12px 22px;border-radius:8px;font-size:14px;
      font-weight:500;z-index:2000;opacity:0;transition:all 300ms ease;
      box-shadow:0 8px 32px rgba(0,0,0,.25);max-width:90vw;text-align:center;
      font-family:'Inter',sans-serif;pointer-events:none;
    `;
    document.body.appendChild(t);
  }
  t.textContent = msg;
  requestAnimationFrame(() => {
    t.style.opacity = "1";
    t.style.transform = "translateX(-50%) translateY(0)";
  });
  clearTimeout(t._timer);
  t._timer = setTimeout(() => {
    t.style.opacity = "0";
    t.style.transform = "translateX(-50%) translateY(10px)";
  }, duration);
}

/* ── Gallery ────────────────────────────────────────────── */
(function initGallery() {
  const mainImg = document.getElementById("gallery-main-img");
  const thumbs = document.querySelectorAll(".gallery-thumb");
  if (!mainImg || !thumbs.length) return;
  thumbs.forEach((thumb, i) => {
    thumb.addEventListener("click", () => {
      const src = thumb.querySelector("img")?.src;
      if (src) mainImg.src = src;
      thumbs.forEach(t => t.classList.remove("active"));
      thumb.classList.add("active");
    });
  });
})();

/* ── Tabs ───────────────────────────────────────────────── */
(function initTabs() {
  document.querySelectorAll(".tabs").forEach(tabGroup => {
    const tabs = tabGroup.querySelectorAll(".tab");
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        const target = tab.dataset.tab;
        if (target) {
          document.querySelectorAll("[data-tab-content]").forEach(panel => {
            panel.style.display = panel.dataset.tabContent === target ? "" : "none";
          });
        }
      });
    });
  });
})();

/* ── Filter chips ───────────────────────────────────────── */
(function initFilterChips() {
  document.querySelectorAll(".filter-chip[data-filter]").forEach(chip => {
    chip.addEventListener("click", () => {
      const group = chip.dataset.filterGroup;
      if (group) {
        document.querySelectorAll(`.filter-chip[data-filter-group="${group}"]`).forEach(c => c.classList.remove("active"));
      }
      chip.classList.toggle("active");
      filterCars();
    });
  });
})();

/* ── Car grid filter ────────────────────────────────────── */
function filterCars() {
  const activeStatus = document.querySelector(".tab.active")?.dataset.tab || "activas";
  const cards = document.querySelectorAll(".auction-card[data-status], .vehicle-card[data-status]");
  cards.forEach(card => {
    const status = card.dataset.status;
    let show = true;
    if (activeStatus === "activas" && status !== "active") show = false;
    if (activeStatus === "vendidas" && status !== "sold") show = false;
    if (activeStatus === "sinreserva" && card.dataset.reserve !== "false") show = false;
    card.parentElement.style.display = show ? "" : "none";
  });
}

function applyFilters() {
  if (typeof CARS === "undefined") return;
  const el = document.getElementById("all-cars-grid");
  if (!el) return;

  const checkedCats = [...document.querySelectorAll('.filter-section input[value]:checked')].map(i => i.value);
  const checkedTrans = [...document.querySelectorAll('input[value="Manual"]:checked, input[value="Automático"]:checked, input[value="PDK"]:checked')].map(i => i.value);
  const noReserve = document.getElementById("filter-noreserve")?.checked;
  const hotOnly = document.getElementById("filter-hot")?.checked;
  const editorialOnly = document.getElementById("filter-editorial")?.checked;
  const endingSoonOnly = document.getElementById("filter-endingsoon")?.checked;

  const cats = ['Deportivo','4x4 Icónico','Clásico Moderno','Premium Usado','Rare Spec'];
  const trans = ['Manual','Automático','PDK'];
  const checkedCatsFiltered = checkedCats.filter(v => cats.includes(v));
  const checkedTransFiltered = checkedTrans.filter(v => trans.includes(v));

  let cars = CARS.filter(c => c.status === "active");
  if (checkedCatsFiltered.length) cars = cars.filter(c => checkedCatsFiltered.some(cat => c.category.includes(cat)));
  if (checkedTransFiltered.length) cars = cars.filter(c => checkedTransFiltered.some(t => c.transmission.includes(t)));
  if (noReserve) cars = cars.filter(c => c.isSinReserva);
  if (hotOnly) cars = cars.filter(c => c.isHot);
  if (editorialOnly) cars = cars.filter(c => c.isEditorialPick);
  if (endingSoonOnly) cars = cars.filter(c => c.endingSoon);

  el.innerHTML = cars.map(renderVehicleCard).join("");
  cars.forEach(car => {
    el.querySelectorAll(`[data-countdown="${car.slug}"]`).forEach(e => startCountdown(e, car.timeLeftHours*60+car.timeLeftMinutes));
  });

  const count = document.getElementById("results-count");
  if (count) count.innerHTML = `<strong>${cars.length}</strong> subasta${cars.length !== 1 ? 's' : ''}`;
}

function sortCars(val) {
  if (typeof CARS === "undefined") return;
  const el = document.getElementById("all-cars-grid");
  if (!el) return;
  let cars = [...CARS.filter(c => c.status === "active")];
  if (val === "bids") cars.sort((a,b) => b.bidCount - a.bidCount);
  else if (val === "price-high") cars.sort((a,b) => b.currentBid - a.currentBid);
  else if (val === "price-low") cars.sort((a,b) => a.currentBid - b.currentBid);
  else if (val === "watchers") cars.sort((a,b) => b.watchers - a.watchers);
  else cars.sort((a,b) => (a.timeLeftHours*60+a.timeLeftMinutes) - (b.timeLeftHours*60+b.timeLeftMinutes));
  el.innerHTML = cars.map(renderVehicleCard).join("");
  cars.forEach(car => {
    el.querySelectorAll(`[data-countdown="${car.slug}"]`).forEach(e => startCountdown(e, car.timeLeftHours*60+car.timeLeftMinutes));
  });
}

function clearFilters() {
  document.querySelectorAll(".filter-option input[type=checkbox]").forEach(i => i.checked = false);
  applyFilters();
}

/* ── Sell form ──────────────────────────────────────────── */
(function initSellForm() {
  const form = document.getElementById("sell-form");
  if (!form) return;
  form.addEventListener("submit", e => {
    e.preventDefault();
    form.style.display = "none";
    const success = document.getElementById("sell-success");
    if (success) success.style.display = "block";
    window.scrollTo({ top: success?.offsetTop - 100, behavior: "smooth" });
  });
})();

/* ── Fee calculator (pricing page) ─────────────────────── */
(function initFeeCalc() {
  const input = document.getElementById("fee-calc-input");
  if (!input) return;
  const feeEl = document.getElementById("fee-result");
  const minEl = document.getElementById("fee-min");
  const maxEl = document.getElementById("fee-max");
  const totalEl = document.getElementById("fee-total");

  input.addEventListener("input", () => {
    const raw = input.value.replace(/\D/g, "");
    const val = parseInt(raw) || 0;
    if (val > 0) {
      const { fee, total } = calcFee(val, 0.03, 150000, 1500000);
      if (feeEl) feeEl.textContent = formatCLP(fee);
      if (totalEl) totalEl.textContent = formatCLP(total);
    } else {
      if (feeEl) feeEl.textContent = "—";
      if (totalEl) totalEl.textContent = "—";
    }
  });

  if (minEl) minEl.textContent = formatCLP(150000);
  if (maxEl) maxEl.textContent = formatCLP(1500000);
})();

/* ── WhatsApp share ─────────────────────────────────────── */
document.addEventListener("click", function(e) {
  const btn = e.target.closest("[data-whatsapp]");
  if (!btn) return;
  const text = btn.dataset.whatsapp || "Mira este auto en GarageBids Chile";
  const url = encodeURIComponent(window.location.href);
  const msg = encodeURIComponent(text + " — " + window.location.href);
  window.open(`https://wa.me/?text=${msg}`, "_blank");
});

/* ── Render auction card (Cars & Bids style) ────────────── */
function renderVehicleCard(car) {
  const urgentClass = isUrgent(car.timeLeftHours) ? "urgent" : "";
  const timeLabel = getTimeLabel(car.timeLeftHours, car.timeLeftMinutes);

  const badges = [];
  if (car.isSinReserva) badges.push(`<span class="badge badge-noreserve">Sin Reserva</span>`);
  if (car.isHot) badges.push(`<span class="badge badge-hot">Hot</span>`);
  if (car.isEditorialPick) badges.push(`<span class="badge badge-editorial">Pick</span>`);
  if (car.endingSoon) badges.push(`<span class="badge badge-endingsoon">Termina Hoy</span>`);
  if (car.status === "upcoming") badges.push(`<span class="badge badge-upcoming">Próximamente</span>`);

  const specLine = [car.transmission, car.drivetrain, car.color].filter(Boolean).join(" · ");

  if (car.status === "upcoming") {
    return `
    <div class="auction-card" data-status="${car.status}" data-reserve="true">
      <div class="auction-card-img" style="background:var(--bg-3)">
        <div class="auction-img-badges">${badges.join("")}</div>
        <img src="${car.heroImage}" alt="${car.title}" loading="lazy" style="opacity:.6">
      </div>
      <div class="auction-card-body">
        <div class="auction-card-title">${car.title}</div>
        <div class="auction-card-sub">${specLine}</div>
      </div>
      <div class="auction-card-bar">
        <div class="auction-bar-col">
          <div class="auction-bar-label">Estado</div>
          <div class="auction-bar-value">Próximamente</div>
        </div>
        <div class="auction-bar-col">
          <div class="auction-bar-label">Ubicación</div>
          <div class="auction-bar-value" style="font-size:12px;font-weight:500">${car.location}</div>
        </div>
        <div class="auction-bar-col">
          <div class="auction-bar-label">Km</div>
          <div class="auction-bar-value">${car.mileage.toLocaleString("es-CL")}</div>
        </div>
      </div>
    </div>`;
  }

  return `
    <a href="auto.html?id=${car.slug}" class="auction-card" data-status="${car.status}" data-reserve="${car.isSinReserva ? 'false' : 'true'}">
      <div class="auction-card-img">
        <div class="auction-img-badges">${badges.join("")}</div>
        <button class="auction-save-btn" onclick="event.preventDefault();this.classList.toggle('saved')" aria-label="Guardar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
        <img src="${car.heroImage}" alt="${car.title}" loading="lazy">
        <div class="auction-location-chip">${car.location}</div>
      </div>
      <div class="auction-card-body">
        <div class="auction-card-title">${car.title}</div>
        <div class="auction-card-sub">${specLine}</div>
      </div>
      <div class="auction-card-bar">
        <div class="auction-bar-col">
          <div class="auction-bar-label">Termina en</div>
          <div class="auction-bar-value ${urgentClass}" data-countdown="${car.slug}">${timeLabel}</div>
        </div>
        <div class="auction-bar-col" style="text-align:center">
          <div class="auction-bar-label">Puja actual</div>
          <div class="auction-bar-bid">${formatCLP(car.currentBid)}</div>
        </div>
        <div class="auction-bar-col">
          <div class="auction-bar-label">Pujas</div>
          <div class="auction-bar-value">${car.bidCount}</div>
        </div>
      </div>
    </a>`;
}

/* ── Render featured auction hero (C&B homepage style) ──── */
function renderFeaturedAuction(car) {
  const timeLabel = getTimeLabel(car.timeLeftHours, car.timeLeftMinutes);
  const urgentClass = isUrgent(car.timeLeftHours) ? "urgent" : "";
  const badges = [];
  if (car.isSinReserva) badges.push(`<span class="badge badge-noreserve">Sin Reserva</span>`);
  if (car.isHot) badges.push(`<span class="badge badge-hot">Hot</span>`);
  if (car.isEditorialPick) badges.push(`<span class="badge badge-editorial">Editorial Pick</span>`);

  return `
    <a href="auto.html?id=${car.slug}" class="featured-auction">
      <div class="featured-auction-img">
        <img src="${car.heroImage}" alt="${car.title}">
        <div class="featured-auction-badges">${badges.join("")}</div>
      </div>
      <div class="featured-auction-panel">
        <div>
          <div class="featured-auction-eyebrow">${car.category} · ${car.year}</div>
          <h2 class="featured-auction-title">${car.title}</h2>
          <div class="featured-auction-specs">${car.transmission} · ${car.drivetrain} · ${car.engine}</div>
          <div class="featured-auction-location">${car.location} · ${car.mileage.toLocaleString("es-CL")} km</div>
        </div>
        <div>
          <div class="featured-auction-bid-label">Puja actual</div>
          <div class="featured-auction-bid">${formatCLP(car.currentBid)}</div>
          <div class="featured-auction-meta">
            <div class="featured-meta-item">
              <div class="featured-meta-label">Termina en</div>
              <div class="featured-meta-value ${urgentClass}" data-countdown="${car.slug}">${timeLabel}</div>
            </div>
            <div class="featured-meta-item">
              <div class="featured-meta-label">Pujas</div>
              <div class="featured-meta-value">${car.bidCount}</div>
            </div>
          </div>
          <div style="margin-top:20px;display:flex;gap:10px">
            <span class="btn btn-primary" style="flex:1;justify-content:center;pointer-events:none">Ver subasta →</span>
          </div>
        </div>
      </div>
    </a>`;
}

/* ── renderFeaturedCard (legacy alias) ──────────────────── */
function renderFeaturedCard(car) { return renderFeaturedAuction(car); }

/* ── Mount car grids ────────────────────────────────────── */
(function mountCarGrids() {
  if (typeof CARS === "undefined") return;

  // Helper: init all countdown timers in a container
  function initCountdowns(container, cars) {
    cars.forEach(car => {
      const els = container.querySelectorAll(`[data-countdown="${car.slug}"]`);
      els.forEach(el => startCountdown(el, car.timeLeftHours * 60 + car.timeLeftMinutes));
    });
  }

  // Featured auction hero (homepage)
  const heroFeaturedEl = document.getElementById("home-featured-auction");
  if (heroFeaturedEl) {
    const hero = CARS.filter(c => c.status === "active" && (c.isHot || c.isEditorialPick))[0]
      || CARS.find(c => c.status === "active");
    if (hero) {
      heroFeaturedEl.innerHTML = renderFeaturedAuction(hero);
      initCountdowns(heroFeaturedEl, [hero]);
    }
  }

  // Featured grid (homepage — 6 cards below hero)
  const featuredEl = document.getElementById("featured-grid");
  if (featuredEl) {
    const cars = CARS.filter(c => c.status === "active").slice(0, 6);
    featuredEl.innerHTML = cars.map(renderVehicleCard).join("");
    initCountdowns(featuredEl, cars);
  }

  // All cars grid (subastas page)
  const allCarsEl = document.getElementById("all-cars-grid");
  if (allCarsEl) {
    allCarsEl.innerHTML = CARS.map(renderVehicleCard).join("");
    initCountdowns(allCarsEl, CARS);
  }
})();

/* ── Load car detail page ───────────────────────────────── */
(function loadCarDetail() {
  const detailRoot = document.getElementById("car-detail-root");
  if (!detailRoot || typeof CARS === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const car = CARS.find(c => c.slug === id) || CARS[0];

  document.title = `${car.title} — GarageBids Chile`;

  // Set hero image & gallery
  const mainImg = document.getElementById("gallery-main-img");
  if (mainImg) mainImg.src = car.heroImage;

  const thumbContainer = document.getElementById("gallery-thumbs");
  if (thumbContainer) {
    const imgs = [car.heroImage, ...(car.gallery || [])].slice(0, 6);
    thumbContainer.innerHTML = imgs.map((src, i) =>
      `<div class="gallery-thumb ${i === 0 ? 'active' : ''}" onclick="document.getElementById('gallery-main-img').src='${src}';document.querySelectorAll('.gallery-thumb').forEach(t=>t.classList.remove('active'));this.classList.add('active')">
        <img src="${src}" alt="Foto ${i+1}">
      </div>`
    ).join("");
    const galleryCount = document.getElementById("gallery-count");
    if (galleryCount) galleryCount.textContent = `${imgs.length * 8} fotos`;
  }

  // Title section
  const titleEl = document.getElementById("detail-title");
  if (titleEl) titleEl.textContent = car.title;

  const badgesEl = document.getElementById("detail-badges");
  if (badgesEl) {
    let b = `<span class="badge badge-category">${car.category}</span>`;
    if (car.isEditorialPick) b += `<span class="badge badge-editorial">Editorial Pick</span>`;
    if (car.isSinReserva) b += `<span class="badge badge-noreserve">Sin Reserva</span>`;
    if (car.isHot) b += `<span class="badge badge-hot">Hot Auction</span>`;
    if (car.endingSoon) b += `<span class="badge badge-endingsoon">Termina Hoy</span>`;
    badgesEl.innerHTML = b;
  }

  const quickfactsEl = document.getElementById("detail-quickfacts");
  if (quickfactsEl) {
    quickfactsEl.innerHTML = [
      { label: "Ubicación", val: car.location },
      { label: "Km", val: car.mileage.toLocaleString("es-CL") + " km" },
      { label: "Trans.", val: car.transmission },
      { label: "Motor", val: car.engine },
      { label: "Tracción", val: car.drivetrain },
    ].map(f => `<span class="quickfact"><span style="color:var(--graphite-5);font-size:11px;text-transform:uppercase;letter-spacing:.04em">${f.label}</span> <span>${f.val}</span></span>`).join("");
  }

  // Bid panel
  const bidAmountEl = document.getElementById("bid-current-amount");
  if (bidAmountEl) bidAmountEl.textContent = formatCLP(car.currentBid);

  const bidCountdown = document.getElementById("bid-countdown");
  if (bidCountdown) startCountdown(bidCountdown, car.timeLeftHours * 60 + car.timeLeftMinutes);

  const bidStats = document.getElementById("bid-panel-stats");
  if (bidStats) {
    bidStats.innerHTML = `
      <div class="bid-stat"><div class="bid-stat-val">${car.bidCount}</div><div class="bid-stat-label">Pujas</div></div>
      <div class="bid-stat"><div class="bid-stat-val">${car.watchers}</div><div class="bid-stat-label">Guardados</div></div>
      <div class="bid-stat"><div class="bid-stat-val">${car.views.toLocaleString()}</div><div class="bid-stat-label">Vistas</div></div>
      <div class="bid-stat"><div class="bid-stat-val">${car.commentCount}</div><div class="bid-stat-label">Preguntas</div></div>
    `;
  }

  // Set bid modal min
  const nextBid = car.currentBid + 100000;
  document.querySelectorAll("[data-open-bid]").forEach(btn => btn.dataset.openBid = nextBid);

  // Why we like it
  const whyEl = document.getElementById("why-we-like-it");
  if (whyEl) whyEl.textContent = car.whyWeLikeIt;

  // Highlights
  const highlightsEl = document.getElementById("highlights-list");
  if (highlightsEl) {
    highlightsEl.innerHTML = (car.highlights || []).map(h =>
      `<div class="highlight-item">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        <span class="highlight-text">${h}</span>
      </div>`
    ).join("");
  }

  // Known flaws
  const flawsEl = document.getElementById("flaws-list");
  if (flawsEl) {
    flawsEl.innerHTML = (car.knownFlaws || []).map(f =>
      `<div class="flaw-item"><span>${f}</span></div>`
    ).join("");
  }

  // Maintenance
  const maintEl = document.getElementById("maintenance-timeline");
  if (maintEl) {
    maintEl.innerHTML = (car.maintenance || []).map(m =>
      `<div class="maintenance-item">
        <div class="mt-date">${m.date}</div>
        <div class="mt-content">
          <div class="mt-title">${m.title} <span style="color:var(--graphite-5);font-weight:400;font-size:12px">· ${m.km} km</span></div>
          <div class="mt-detail">${m.detail}</div>
        </div>
      </div>`
    ).join("");
  }

  // Modifications
  const modsEl = document.getElementById("mods-list");
  if (modsEl) {
    const mods = car.modifications || [];
    if (mods.length === 0) {
      modsEl.innerHTML = `<p style="color:var(--graphite-4);font-size:14px">Sin modificaciones — completamente original.</p>`;
    } else {
      modsEl.innerHTML = mods.map(m => `<div class="flaw-item" style="background:var(--bg-2);border-color:var(--border)">${m}</div>`).join("");
    }
  }

  // Equipment
  const equipEl = document.getElementById("equipment-list");
  if (equipEl) {
    equipEl.innerHTML = (car.equipment || []).map(eq =>
      `<span class="highlight-tag" style="font-size:12.5px">✓ ${eq}</span>`
    ).join("");
  }

  // Bid history
  const bidHistEl = document.getElementById("bid-history-tbody");
  if (bidHistEl) {
    bidHistEl.innerHTML = (car.bidHistory || []).map((b, i) =>
      `<tr class="${i === 0 ? 'winning' : ''}">
        <td>${b.bidder}</td>
        <td style="font-weight:600">${formatCLP(b.amount)}</td>
        <td style="color:var(--graphite-5)">${b.time}</td>
      </tr>`
    ).join("") || `<tr><td colspan="3" style="color:var(--graphite-5);font-style:italic">Aún no hay pujas. Sé el primero.</td></tr>`;
  }

  // Q&A
  const qaEl = document.getElementById("qa-list");
  if (qaEl) {
    const qa = car.questions || [];
    if (qa.length === 0) {
      qaEl.innerHTML = `<p style="color:var(--graphite-4);font-size:14px">Aún no hay preguntas públicas.</p>`;
    } else {
      qaEl.innerHTML = qa.map(q =>
        `<div class="qa-item">
          <div class="qa-q">${q.q}</div>
          <div class="qa-a">${q.a}</div>
          <div class="qa-meta">${q.user} · ${q.time}</div>
        </div>`
      ).join("");
    }
  }

  // Seller notes
  const sellerEl = document.getElementById("seller-notes");
  if (sellerEl) sellerEl.textContent = car.sellerNotes;

  // Sticky bar
  const stickyBar = document.getElementById("sticky-bid-bar");
  const stickyTitle = document.getElementById("sticky-title");
  const stickyBid = document.getElementById("sticky-bid");
  if (stickyBar && stickyTitle && stickyBid) {
    stickyTitle.textContent = car.title;
    stickyBid.textContent = formatCLP(car.currentBid);
  }

  // Quirks
  const quirksEl = document.getElementById("quirks-list");
  if (quirksEl) {
    quirksEl.innerHTML = (car.quirks || []).map(q =>
      `<div style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);font-size:14px">
        <span style="color:var(--graphite-2);line-height:1.5">${q}</span>
      </div>`
    ).join("");
  }

  // Related cars
  const relatedEl = document.getElementById("related-cars");
  if (relatedEl) {
    const related = CARS.filter(c => c.slug !== car.slug && c.category === car.category).slice(0, 3);
    if (related.length < 3) related.push(...CARS.filter(c => c.slug !== car.slug && !related.includes(c)).slice(0, 3 - related.length));
    relatedEl.innerHTML = related.slice(0, 3).map(renderVehicleCard).join("");
  }

  detailRoot.style.display = "";
})();

/* ── Render sold cars ───────────────────────────────────── */
(function renderSoldCars() {
  const el = document.getElementById("sold-cars-list");
  if (!el || typeof SOLD_CARS === "undefined") return;
  el.innerHTML = SOLD_CARS.map(car => `
    <div class="sold-card">
      <div class="sold-card-img">
        <img src="${car.image}" alt="${car.title}" loading="lazy">
      </div>
      <div class="sold-card-body">
        <div>
          <div style="display:flex;gap:6px;margin-bottom:6px">
            <span class="badge badge-sold">Vendido</span>
            <span class="badge badge-category">${car.category}</span>
          </div>
          <div class="sold-card-title">${car.title}</div>
          <div class="sold-stats">
            <span>${car.bidCount} pujas</span>
            <span>${car.watchers} guardados</span>
            <span>${car.daysListed} días</span>
          </div>
        </div>
        <div>
          <div style="font-size:11px;color:var(--graphite-5);text-transform:uppercase;letter-spacing:.05em;margin-bottom:2px">Precio final</div>
          <div class="sold-price">${formatCLP(car.soldPrice)}</div>
          <div class="sold-comment">${car.editorialComment}</div>
        </div>
      </div>
    </div>
  `).join("");
})();

/* ── Render editorial cards ─────────────────────────────── */
(function renderEditorial() {
  const el = document.getElementById("editorial-grid");
  if (!el || typeof ARTICLES === "undefined") return;
  el.innerHTML = ARTICLES.map(a => `
    <div class="editorial-card">
      <div class="editorial-card-img">
        <img src="${a.image}" alt="${a.title}" loading="lazy">
      </div>
      <div class="editorial-card-body">
        <div class="editorial-tag">${a.tag}</div>
        <div class="editorial-card-title">${a.title}</div>
        <div class="editorial-card-lead">${a.lead}</div>
        <div class="editorial-meta">${a.author} · ${a.date} · ${a.readTime} lectura</div>
      </div>
    </div>
  `).join("");
})();

/* ── Render categories ──────────────────────────────────── */
(function renderCategories() {
  const el = document.getElementById("categories-grid");
  if (!el || typeof CATEGORIES === "undefined") return;
  el.innerHTML = CATEGORIES.map(cat => `
    <a href="subastas.html" class="category-card">
      <div class="category-icon">${cat.icon}</div>
      <div class="category-name">${cat.name}</div>
      <div class="category-desc">${cat.desc}</div>
      <div style="font-size:12px;color:var(--accent);font-weight:600;margin-top:4px">${cat.count} activos →</div>
    </a>
  `).join("");
})();
