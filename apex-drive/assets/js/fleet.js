/* Apex Drive — sélecteur de flotte (filtres, tri) */
document.addEventListener("DOMContentLoaded", () => {
  "use strict";
  const A = window.Apex, UI = window.ApexUI;
  const form = document.getElementById("filters");
  const grid = document.getElementById("fleet");
  const empty = document.getElementById("fleet-empty");
  const count = document.getElementById("fleet-count");
  const price = document.getElementById("f-price");
  const priceOut = document.getElementById("f-price-out");
  const sort = document.getElementById("f-sort");

  const uniq = key => [...new Set(A.VEHICLES.map(v => v[key]))];
  const slug = s => s.replace(/\s+/g, "-");

  function seg(hostId, name, values) {
    document.getElementById(hostId).innerHTML =
      `<input type="radio" name="${name}" id="${name}-all" value="" checked><label for="${name}-all">Toutes</label>` +
      values.map(v => `<input type="radio" name="${name}" id="${name}-${slug(v)}" value="${v}"><label for="${name}-${slug(v)}">${v}</label>`).join("");
  }
  seg("f-category", "category", uniq("category"));
  seg("f-energy", "energy", uniq("energy"));

  const DEFAULTS = { category: "", energy: "", seats: "0", price: "1300", sort: "price-asc" };

  function read() {
    const fd = new FormData(form);
    return { category: fd.get("category") || "", energy: fd.get("energy") || "", seats: fd.get("seats") || "0", price: price.value, sort: sort.value };
  }
  function write(s) {
    const pick = (name, val) => { const el = form.querySelector(`input[name="${name}"][value="${CSS.escape(val)}"]`); if (el) el.checked = true; };
    pick("category", s.category); pick("energy", s.energy); pick("seats", s.seats);
    price.value = s.price; sort.value = s.sort;
  }

  function render() {
    const s = read();
    priceOut.textContent = A.fmt.eur(+s.price);
    const list = A.VEHICLES
      .filter(v => (!s.category || v.category === s.category)
        && (!s.energy || v.energy === s.energy)
        && v.seats >= +s.seats
        && v.price <= +s.price)
      .sort({
        "price-asc": (a, b) => a.price - b.price,
        "price-desc": (a, b) => b.price - a.price,
        "power-desc": (a, b) => b.power - a.power,
        "accel-asc": (a, b) => a.accel - b.accel
      }[s.sort]);
    grid.innerHTML = list.map(UI.vehicleCard).join("");
    grid.querySelectorAll(".reveal").forEach(el => el.classList.add("is-seen"));
    empty.hidden = list.length > 0;
    count.textContent = list.length + (list.length > 1 ? " véhicules" : " véhicule");
    UI.store.set("fleet", s);
  }

  // Ancre (#SUV, #Grand-Tourisme) prioritaire sur les filtres mémorisés
  const fromHash = UI.hashId().replace(/-/g, " ");
  const saved = Object.assign({}, DEFAULTS, UI.store.get("fleet", {}));
  if (fromHash && uniq("category").includes(fromHash)) Object.assign(saved, DEFAULTS, { category: fromHash });
  write(saved);
  render();

  form.addEventListener("input", render);
  form.addEventListener("change", render);
  sort.addEventListener("change", render);
  form.addEventListener("reset", () => setTimeout(() => { write(DEFAULTS); render(); }));
  form.addEventListener("submit", e => e.preventDefault());
  document.getElementById("fleet-reset").addEventListener("click", () => { write(DEFAULTS); render(); });
  window.addEventListener("hashchange", () => {
    const c = UI.hashId().replace(/-/g, " ");
    if (uniq("category").includes(c)) { write(Object.assign({}, DEFAULTS, { category: c })); render(); }
  });
});
