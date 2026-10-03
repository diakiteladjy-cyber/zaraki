/* Apex Drive — éléments communs : navigation, pied de page, révélations au défilement,
   compteurs animés, accordéons, thème, notifications. */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  const store = {
    get(k, fallback) { try { const v = localStorage.getItem("apex:" + k); return v === null ? fallback : JSON.parse(v); } catch (e) { return fallback; } },
    set(k, v) { try { localStorage.setItem("apex:" + k, JSON.stringify(v)); } catch (e) { /* stockage indisponible */ } }
  };

  /* ---------- Thème ---------- */
  const savedTheme = store.get("theme", null);
  if (savedTheme === "light" || savedTheme === "dark") document.documentElement.setAttribute("data-theme", savedTheme);

  function currentTheme() {
    const t = document.documentElement.getAttribute("data-theme");
    if (t) return t;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  const MARK = `<svg class="brand__mark" viewBox="0 0 32 32" aria-hidden="true"><path d="M3 26 L16 5 L29 26" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/><path d="M9.5 19.5 H22.5" stroke="currentColor" stroke-width="2.6"/><circle cx="16" cy="5" r="2.2" fill="currentColor"/></svg>`;

  const LINKS = [
    { href: "index.html", label: "Accueil", page: "home" },
    { href: "flotte.html", label: "Flotte", page: "fleet" },
    { href: "reservation.html", label: "Réserver", page: "booking" },
    { href: "legal.html", label: "Infos légales", page: "legal" }
  ];

  function renderNav() {
    const host = document.getElementById("site-nav");
    if (!host) return;
    const page = document.body.dataset.page;
    host.outerHTML = `<header class="nav" id="nav">
  <div class="wrap nav__inner">
    <a class="brand" href="index.html" aria-label="Apex Drive, accueil">${MARK}<span class="brand__name">APEX DRIVE</span></a>
    <button class="nav__toggle" type="button" aria-expanded="false" aria-controls="nav-links" aria-label="Ouvrir le menu"><span></span><span></span></button>
    <ul class="nav__links" id="nav-links">
      ${LINKS.map(l => `<li><a href="${l.href}"${l.page === page ? ' aria-current="page"' : ""}>${l.label}</a></li>`).join("")}
    </ul>
    <a class="btn btn--primary nav__cta" href="reservation.html">Réserver</a>
  </div>
</header>`;
    const nav = document.getElementById("nav");
    const toggle = nav.querySelector(".nav__toggle");
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    });
  }

  function renderFooter() {
    const host = document.getElementById("site-footer");
    if (!host) return;
    const A = window.Apex;
    host.outerHTML = `<footer class="footer">
  <div class="wrap">
    <div class="footer__grid">
      <div style="display:grid;gap:14px;align-content:start;max-width:36ch">
        <a class="brand" href="index.html">${MARK}<span class="brand__name">APEX DRIVE</span></a>
        <p class="muted" style="font-size:.875rem">Location de voitures de sport et de prestige, avec remise des clés en personne dans nos ${A.AGENCIES.length} agences.</p>
      </div>
      <div><h4>Flotte</h4><ul>
        <li><a href="flotte.html#Sportive">Sportives</a></li>
        <li><a href="flotte.html#Grand-Tourisme">Grand Tourisme</a></li>
        <li><a href="flotte.html#Supercar">Supercars</a></li>
        <li><a href="flotte.html#SUV">SUV</a></li>
      </ul></div>
      <div><h4>Agences</h4><ul>
        ${A.AGENCIES.map(a => `<li>${a.city}</li>`).join("")}
      </ul></div>
      <div><h4>Informations</h4><ul>
        <li><a href="legal.html#mentions">Mentions légales</a></li>
        <li><a href="legal.html#conditions">Conditions de location</a></li>
        <li><a href="legal.html#confidentialite">Confidentialité</a></li>
        <li><a href="reservation.html">Réserver un véhicule</a></li>
      </ul></div>
    </div>
    <div class="footer__base">
      <span>© ${new Date().getFullYear()} Apex Drive · Prix TTC en euros</span>
      <button class="theme-btn" type="button" id="theme-btn"></button>
    </div>
  </div>
</footer>`;
    const btn = document.getElementById("theme-btn");
    const label = () => { btn.textContent = currentTheme() === "dark" ? "Thème clair" : "Thème sombre"; };
    label();
    btn.addEventListener("click", () => {
      const next = currentTheme() === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      store.set("theme", next);
      label();
    });
  }

  /* ---------- Révélations au défilement ----------
     Seuls les éléments situés sous la ligne de flottaison reçoivent l'état de départ. */
  function initReveal(root) {
    const els = (root || document).querySelectorAll(".reveal:not(.is-seen)");
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.remove("pre"); e.target.classList.add("is-seen"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach(el => {
      if (el.getBoundingClientRect().top > window.innerHeight) { el.classList.add("pre"); io.observe(el); }
      else el.classList.add("is-seen");
    });
  }

  /* ---------- Compteurs ---------- */
  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const decimals = (el.dataset.count.split(".")[1] || "").length;
    const fmt = new Intl.NumberFormat("fr-FR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { el.textContent = fmt.format(target); return; }
    const t0 = performance.now(), dur = 1200;
    const tick = now => {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = fmt.format(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  function initCounters(root) {
    const els = (root || document).querySelectorAll("[data-count]");
    els.forEach(el => {
      // La valeur finale est déjà dans le HTML : l'animation ne masque jamais le chiffre.
      if (!("IntersectionObserver" in window)) return;
      const io = new IntersectionObserver(es => {
        if (es[0].isIntersecting) { animateCount(el); io.disconnect(); }
      });
      io.observe(el);
    });
  }

  /* ---------- Accordéons ---------- */
  function initAccordions(root) {
    (root || document).querySelectorAll(".acc-item").forEach((item, i) => {
      const btn = item.querySelector("button");
      const panel = item.querySelector(".acc-panel");
      if (!btn || !panel || btn.dataset.ready) return;
      btn.dataset.ready = "1";
      const pid = panel.id || "acc-" + i + "-" + Math.random().toString(36).slice(2, 7);
      panel.id = pid;
      btn.setAttribute("aria-controls", pid);
      btn.setAttribute("aria-expanded", item.classList.contains("is-open") ? "true" : "false");
      btn.addEventListener("click", () => {
        const open = item.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", String(open));
      });
    });
  }

  /* ---------- Notification ---------- */
  let toastTimer;
  function toast(msg) {
    let el = document.querySelector(".toast");
    if (!el) { el = document.createElement("div"); el.className = "toast"; el.setAttribute("role", "status"); document.body.appendChild(el); }
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 3200);
  }

  /* Lecture d'un identifiant dans l'ancre (#porsche-911) */
  function hashId() { return decodeURIComponent((location.hash || "").replace(/^#/, "")); }

  function vehicleCard(v) {
    const A = window.Apex;
    return `<a class="card reveal" href="vehicule.html#${v.id}">
  <div class="stage"><div class="stage__grid"></div>${A.carSVG(v)}</div>
  <div class="card__body">
    <div class="card__top">
      <div style="min-width:0"><div class="card__brand">${v.brand}</div><div class="card__name">${v.model}</div></div>
      <div class="card__price"><strong>${A.fmt.eur(v.price)}</strong><span>par jour</span></div>
    </div>
    <ul class="specs">
      <li><b>${v.power}</b><small>ch</small></li>
      <li><b>${A.fmt.dec(v.accel)} s</b><small>0–100</small></li>
      <li><b>${v.vmax}</b><small>km/h max</small></li>
    </ul>
    <div class="chip-row"><span class="chip">${v.category}</span><span class="chip${v.energy === "Électrique" ? " chip--ok" : ""}">${v.energy}</span><span class="chip">${v.seats} places</span></div>
  </div>
</a>`;
  }

  window.ApexUI = { store, toast, initReveal, initCounters, initAccordions, hashId, vehicleCard, currentTheme };

  document.addEventListener("DOMContentLoaded", () => {
    renderNav();
    renderFooter();
    initAccordions();
    initCounters();
    // Les scripts de page rendent leur contenu au DOMContentLoaded : on attend la frame suivante.
    requestAnimationFrame(() => initReveal());
  });
})();
