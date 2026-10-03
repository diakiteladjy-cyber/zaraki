/* Apex Drive — fiche véhicule : galerie SVG, chargement 3D, devis rapide */
document.addEventListener("DOMContentLoaded", () => {
  "use strict";
  const A = window.Apex, UI = window.ApexUI;
  const $ = id => document.getElementById(id);

  const VIEWS = [
    { id: "side", label: "Profil" },
    { id: "rear", label: "Profil gauche" },
    { id: "night", label: "De nuit" },
    { id: "wheel", label: "Jante et étrier" }
  ];

  let v, color, view = "side", mode = "3d", car3d = null, loading = null;

  function pickVehicle() {
    return A.getVehicle(UI.hashId()) || A.getVehicle(UI.store.get("lastVehicle", "")) || A.VEHICLES[0];
  }

  /* ---------- Galerie ---------- */
  function renderSVG() {
    $("viewer-svg").innerHTML = A.carSVG(v, { color: color.h, colorName: color.n, view });
  }
  function renderThumbs() {
    $("thumbs").innerHTML = VIEWS.map(x => `
      <button type="button" data-view="${x.id}" aria-pressed="${mode === "photo" && x.id === view}" aria-label="${x.label}">
        <div class="stage"><div class="stage__grid"></div>${A.carSVG(v, { color: color.h, colorName: color.n, view: x.id })}</div>
      </button>`).join("");
    $("thumbs").querySelectorAll("button").forEach(b => b.addEventListener("click", () => { view = b.dataset.view; setMode("photo"); }));
  }

  /* ---------- 3D ---------- */
  function webglOK() {
    try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); }
    catch (e) { return false; }
  }
  function load3D() {
    if (car3d || loading) return loading;
    const status = $("viewer-status");
    if (!webglOK()) {
      status.textContent = "3D indisponible sur cet appareil";
      $("tab-3d").disabled = true;
      setMode("photo");
      return null;
    }
    status.textContent = "Chargement 3D…";
    const url = new URL("assets/js/car3d.js", document.baseURI).href;
    loading = import(url).then(mod => {
      car3d = mod.mountCar3D($("viewer"), v, color.h);
      car3d.el = $("viewer").querySelector("canvas");
      car3d.el.hidden = mode !== "3d";
      status.textContent = mode === "3d" ? "Glissez pour tourner" : "";
    }).catch(err => {
      console.error(err);
      status.textContent = "La vue 3D n'a pas pu se charger";
      $("tab-3d").disabled = true;
      setMode("photo");
    }).finally(() => { loading = null; });
    return loading;
  }

  function setMode(m) {
    mode = m;
    $("tab-3d").setAttribute("aria-selected", String(m === "3d"));
    $("tab-photo").setAttribute("aria-selected", String(m === "photo"));
    $("viewer-svg").hidden = m === "3d";
    if (car3d && car3d.el) car3d.el.hidden = m !== "3d";
    if (m === "3d") {
      if (!car3d) load3D(); else $("viewer-status").textContent = "Glissez pour tourner";
    } else {
      $("viewer-status").textContent = VIEWS.find(x => x.id === view).label;
      renderSVG();
    }
    $("thumbs").querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(m === "photo" && b.dataset.view === view)));
  }

  /* ---------- Teintes ---------- */
  function renderSwatches() {
    $("swatches").innerHTML = v.colors.map((c, i) =>
      `<button type="button" class="swatch" style="background:${c.h}" aria-label="${c.n}" aria-pressed="${c.h === color.h}" data-i="${i}"></button>`).join("");
    $("swatch-name").textContent = color.n;
    $("swatches").querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
      color = v.colors[+b.dataset.i];
      $("swatches").querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
      $("swatch-name").textContent = color.n;
      if (car3d) car3d.setColor(color.h);
      renderSVG();
      renderThumbs();
      updateBookLink();
    }));
  }

  /* ---------- Données ---------- */
  function renderInfo() {
    document.title = `${v.brand} ${v.model} · Apex Drive`;
    $("vh-brand").textContent = v.brand;
    $("vh-model").textContent = v.model;
    $("vh-tagline").textContent = v.tagline;
    $("vh-desc").textContent = v.description;
    $("vh-price").textContent = A.fmt.eur(v.price);
    $("vh-rating").textContent = "★ " + A.fmt.dec(v.rating);
    $("vh-rating").setAttribute("aria-label", `Note moyenne ${A.fmt.dec(v.rating)} sur 5`);
    $("vh-chips").innerHTML = [v.category, v.energy, v.gearbox, v.seats + " places"]
      .map((c, i) => `<span class="chip${i === 0 ? " chip--accent" : ""}">${c}</span>`).join("");

    const max = k => Math.max(...A.VEHICLES.map(x => x[k]));
    const minAccel = Math.min(...A.VEHICLES.map(x => x.accel));
    const gauges = [
      ["Puissance", v.power + " ch", v.power / max("power")],
      ["0–100 km/h", A.fmt.dec(v.accel) + " s", minAccel / v.accel],
      ["Vitesse maximale", v.vmax + " km/h", v.vmax / max("vmax")],
      ["Volume de coffre", v.luggage + " L", v.luggage / max("luggage")]
    ];
    $("gauges").innerHTML = gauges.map(g => `
      <div class="gauge">
        <div class="gauge__row"><span>${g[0]}</span><span class="hud">${g[1]}</span></div>
        <div class="gauge__bar"><span data-w="${Math.round(g[2] * 100)}"></span></div>
      </div>`).join("");
    requestAnimationFrame(() => requestAnimationFrame(() =>
      $("gauges").querySelectorAll(".gauge__bar span").forEach(s => { s.style.width = s.dataset.w + "%"; })));

    const rows = [
      ["Énergie", v.energy], ["Boîte de vitesses", v.gearbox], ["Puissance", v.power + " ch"],
      ["0–100 km/h", A.fmt.dec(v.accel) + " s"], ["Vitesse maximale", v.vmax + " km/h"],
      ["Places", v.seats], ["Coffre", v.luggage + " L"], ["Consommation", v.consumption]
    ];
    $("spec-table").innerHTML = rows.map(r => `<tr><th scope="row">${r[0]}</th><td>${r[1]}</td></tr>`).join("");

    const cond = [
      ["Âge minimum", v.minAge + " ans"], ["Permis depuis", v.licenseYears + " ans"],
      ["Kilométrage inclus", v.kmPerDay + " km / jour"], ["Caution (empreinte)", A.fmt.eur(v.deposit)]
    ];
    $("conditions").innerHTML = cond.map(r => `<tr><th scope="row">${r[0]}</th><td>${r[1]}</td></tr>`).join("");

    const similar = A.VEHICLES.filter(x => x.id !== v.id)
      .sort((a, b) => Math.abs(a.price - v.price) - Math.abs(b.price - v.price)).slice(0, 3);
    $("similar").innerHTML = similar.map(UI.vehicleCard).join("");
    UI.initReveal($("similar"));
  }

  /* ---------- Devis rapide ---------- */
  const iso = d => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  function defaultDates() {
    const d = new Date(); d.setHours(0, 0, 0, 0);
    const toFri = ((5 - d.getDay()) + 7) % 7 || 7;
    const start = new Date(d); start.setDate(d.getDate() + toFri);
    const end = new Date(start); end.setDate(start.getDate() + 3);
    return [start, end];
  }
  function parse(val) { const [y, m, d] = val.split("-").map(Number); return new Date(y, m - 1, d); }

  function updateQuote() {
    const s = $("q-start").value, e = $("q-end").value;
    const dl = $("quote");
    if (!s || !e || parse(e) <= parse(s)) {
      dl.innerHTML = `<dt>Choisissez une date de retour postérieure au départ.</dt><dd></dd>`;
      return;
    }
    const q = A.quote(v, parse(s), parse(e), [], false);
    dl.innerHTML = `
      <dt>${q.days} jour${q.days > 1 ? "s" : ""} × ${A.fmt.eur(v.price)}</dt><dd>${A.fmt.eur(q.base)}</dd>
      ${q.discount ? `<dt>Remise durée (${Math.round(q.rate * 100)} %)</dt><dd>− ${A.fmt.eur(q.discount)}</dd>` : ""}
      <dt>Kilométrage inclus</dt><dd>${A.fmt.num(q.km)} km</dd>
      <dt style="color:var(--fg);font-weight:600">Total TTC</dt><dd style="color:var(--fg);font-size:1.1rem">${A.fmt.eur(q.total)}</dd>`;
    UI.store.set("quickDates", { start: s, end: e });
    updateBookLink();
  }
  function updateBookLink() {
    $("book-link").href = "reservation.html#" + v.id;
    UI.store.set("prefill", { vehicle: v.id, color: color.n, start: $("q-start").value, end: $("q-end").value });
  }

  function init() {
    if (car3d) { car3d.dispose(); car3d = null; }
    v = pickVehicle();
    color = v.colors[0];
    view = "side";
    UI.store.set("lastVehicle", v.id);
    renderInfo();
    renderSwatches();
    renderThumbs();
    renderSVG();
    updateQuote();
    setMode("3d");
  }

  /* Dates : dernière saisie ou week-end suivant */
  const saved = UI.store.get("quickDates", null);
  const today = iso(new Date());
  const [ds, de] = defaultDates();
  $("q-start").min = today; $("q-end").min = today;
  $("q-start").value = saved && saved.start >= today ? saved.start : iso(ds);
  $("q-end").value = saved && saved.end > $("q-start").value ? saved.end : iso(de);
  $("q-start").addEventListener("change", () => {
    if ($("q-end").value <= $("q-start").value) {
      const e = parse($("q-start").value); e.setDate(e.getDate() + 1); $("q-end").value = iso(e);
    }
    updateQuote();
  });
  $("q-end").addEventListener("change", updateQuote);

  $("tab-3d").addEventListener("click", () => setMode("3d"));
  $("tab-photo").addEventListener("click", () => setMode("photo"));
  window.addEventListener("hashchange", () => { init(); window.scrollTo({ top: 0, behavior: "smooth" }); });

  init();
});
