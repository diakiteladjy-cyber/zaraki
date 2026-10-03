/* Apex Drive — page d'accueil */
document.addEventListener("DOMContentLoaded", () => {
  "use strict";
  const A = window.Apex, UI = window.ApexUI;
  const featured = A.VEHICLES.filter(v => v.featured);

  /* Héros : sélecteur de modèle + tableau de bord */
  const carHost = document.getElementById("hero-car");
  const picker = document.getElementById("hero-picker");
  let index = 0, timer = null;

  function setHUD(id, value) {
    const el = document.getElementById(id);
    el.dataset.count = String(value);
    const decimals = (String(value).split(".")[1] || "").length;
    const fmt = new Intl.NumberFormat("fr-FR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { el.textContent = fmt.format(value); return; }
    const from = parseFloat(String(el.textContent).replace(/\s/g, "").replace(",", ".")) || 0;
    const t0 = performance.now();
    const tick = now => {
      const p = Math.min((now - t0) / 700, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt.format(from + (value - from) * e);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function show(i, fromUser) {
    index = (i + featured.length) % featured.length;
    const v = featured[index];
    carHost.innerHTML = A.carSVG(v);
    const svg = carHost.firstElementChild;
    if (svg && svg.animate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      svg.animate([{ transform: "translateX(-6%)", opacity: 0.2 }, { transform: "none", opacity: 1 }], { duration: 600, easing: "cubic-bezier(.2,.7,.2,1)" });
    }
    document.getElementById("hero-brand").textContent = v.brand;
    document.getElementById("hero-name").textContent = v.model;
    setHUD("hud-power", v.power);
    setHUD("hud-accel", v.accel);
    setHUD("hud-vmax", v.vmax);
    setHUD("hud-price", v.price);
    picker.querySelectorAll("button").forEach((b, j) => b.setAttribute("aria-pressed", String(j === index)));
    if (fromUser) stop();
  }

  picker.innerHTML = featured.map((v, i) =>
    `<button type="button" aria-pressed="false" aria-label="${v.brand} ${v.model}">${String(i + 1).padStart(2, "0")}</button>`).join("");
  picker.querySelectorAll("button").forEach((b, i) => b.addEventListener("click", () => show(i, true)));

  function start() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    timer = setInterval(() => { if (!carHost.isConnected) return stop(); show(index + 1); }, 5000);
  }
  function stop() { clearInterval(timer); timer = null; }
  document.getElementById("hero-stage").addEventListener("click", e => {
    if (!e.target.closest("button")) location.href = "vehicule.html#" + featured[index].id;
  });
  document.getElementById("hero-stage").style.cursor = "pointer";

  carHost.innerHTML = A.carSVG(featured[0]);
  picker.querySelectorAll("button")[0].setAttribute("aria-pressed", "true");
  start();

  /* Sélection */
  document.getElementById("featured").innerHTML = featured.map(UI.vehicleCard).join("");

  /* Agences */
  document.getElementById("agencies").innerHTML = A.AGENCIES.map(a => `
    <div class="agency">
      <h3>${a.city}</h3>
      <span class="muted" style="font-size:.875rem">${a.area}</span>
      <span style="font-size:.875rem">${a.address}</span>
      <span class="hud">${a.hours}</span>
      <span class="hud">${a.phone}</span>
    </div>`).join("");

  /* Avis */
  document.getElementById("reviews").innerHTML = A.REVIEWS.slice(0, 3).map(r => {
    const v = A.getVehicle(r.vehicle);
    return `<figure class="review reveal" style="margin:0">
      <span class="stars" aria-label="${r.stars} sur 5">${"★".repeat(r.stars)}${"☆".repeat(5 - r.stars)}</span>
      <blockquote>${r.text}</blockquote>
      <footer><span><strong style="color:var(--fg)">${r.name}</strong> · ${r.city}</span><span>${v ? v.brand + " " + v.model : ""} · ${r.date}</span></footer>
    </figure>`;
  }).join("");
});
