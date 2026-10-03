/* Apex Drive — parcours de réservation en quatre étapes */
document.addEventListener("DOMContentLoaded", () => {
  "use strict";
  const A = window.Apex, UI = window.ApexUI;
  const $ = id => document.getElementById(id);
  const form = $("booking");

  /* ---------- Utilitaires de dates ---------- */
  const iso = d => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const parseDate = s => { if (!s) return null; const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const at = (date, time) => { const d = parseDate(date); if (!d) return null; const [h, mi] = time.split(":").map(Number); d.setHours(h, mi); return d; };
  const longDate = new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "long" });
  function yearsBetween(from, to) {
    let y = to.getFullYear() - from.getFullYear();
    if (to.getMonth() < from.getMonth() || (to.getMonth() === from.getMonth() && to.getDate() < from.getDate())) y--;
    return y;
  }

  /* ---------- Construction des champs ---------- */
  $("vh-pick").innerHTML = A.VEHICLES.map(v => `
    <label>
      <input type="radio" name="vehicle" value="${v.id}">
      <div class="stage"><div class="stage__grid"></div>${A.carSVG(v)}</div>
      <b>${v.brand} ${v.model}</b>
      <span>${A.fmt.eur(v.price)} / jour</span>
    </label>`).join("");

  const agencyOpts = A.AGENCIES.map(a => `<option value="${a.id}">${a.city} · ${a.area}</option>`).join("");
  $("pickup").innerHTML = agencyOpts;
  $("dropoff").innerHTML = agencyOpts;

  const slots = [];
  for (let h = 8; h <= 20; h++) for (const m of [0, 30]) if (!(h === 20 && m)) slots.push(String(h).padStart(2, "0") + ":" + (m ? "30" : "00"));
  const slotOpts = slots.map(s => `<option value="${s}">${s.replace(":", " h ")}</option>`).join("");
  $("start-time").innerHTML = slotOpts;
  $("end-time").innerHTML = slotOpts;

  $("opt-list").innerHTML = A.OPTIONS.map(o => `
    <label class="opt">
      <input type="checkbox" name="options" value="${o.id}">
      <span><strong>${o.name}</strong><small>${o.detail}</small></span>
      <span class="opt__price">${A.fmt.eur(o.price)}<small>${o.per === "jour" ? "par jour" : "forfait"}</small></span>
    </label>`).join("");

  /* ---------- État ---------- */
  const today = iso(new Date());
  ["start-date", "end-date"].forEach(id => { $(id).min = today; });
  $("birth").max = today; $("license").max = today;

  function defaults() {
    const d = new Date(); d.setHours(0, 0, 0, 0);
    const toFri = ((5 - d.getDay()) + 7) % 7 || 7;
    const s = new Date(d); s.setDate(d.getDate() + toFri);
    const e = new Date(s); e.setDate(s.getDate() + 3);
    return { vehicle: A.VEHICLES[0].id, pickup: "paris", dropoff: "paris", startDate: iso(s), startTime: "17:00", endDate: iso(e), endTime: "10:00", options: [] };
  }

  function readState() {
    const fd = new FormData(form);
    return {
      vehicle: fd.get("vehicle"), pickup: fd.get("pickup"), dropoff: fd.get("dropoff"),
      startDate: fd.get("startDate"), startTime: fd.get("startTime"),
      endDate: fd.get("endDate"), endTime: fd.get("endTime"),
      options: fd.getAll("options"),
      firstname: (fd.get("firstname") || "").trim(), lastname: (fd.get("lastname") || "").trim(),
      email: (fd.get("email") || "").trim(), phone: (fd.get("phone") || "").trim(),
      birth: fd.get("birth"), license: fd.get("license"), notes: fd.get("notes") || ""
    };
  }
  function writeState(s) {
    const r = form.querySelector(`input[name="vehicle"][value="${s.vehicle}"]`);
    if (r) r.checked = true;
    ["pickup", "dropoff"].forEach(k => { if (s[k]) $(k).value = s[k]; });
    const map = { startDate: "start-date", startTime: "start-time", endDate: "end-date", endTime: "end-time" };
    Object.keys(map).forEach(k => { if (s[k]) $(map[k]).value = s[k]; });
    form.querySelectorAll('input[name="options"]').forEach(c => { c.checked = (s.options || []).includes(c.value); });
    ["firstname", "lastname", "email", "phone", "birth", "license", "notes"].forEach(k => { if (s[k]) $(k).value = s[k]; });
  }

  // Priorité : véhicule de l'ancre, puis brouillon, puis dates choisies sur la fiche véhicule
  let state = Object.assign(defaults(), UI.store.get("booking", {}));
  if (state.startDate && state.startDate < today) Object.assign(state, { startDate: defaults().startDate, endDate: defaults().endDate });
  const prefill = UI.store.get("prefill", null);
  const fromHash = A.getVehicle(UI.hashId());
  if (fromHash) {
    state.vehicle = fromHash.id;
    if (prefill && prefill.vehicle === fromHash.id && prefill.start >= today && prefill.end > prefill.start) {
      state.startDate = prefill.start; state.endDate = prefill.end;
    }
  }
  writeState(state);

  /* ---------- Récapitulatif ---------- */
  function computed(s) {
    const v = A.getVehicle(s.vehicle);
    const start = at(s.startDate, s.startTime), end = at(s.endDate, s.endTime);
    const q = v && start && end && end > start ? A.quote(v, start, end, s.options, s.pickup !== s.dropoff) : null;
    return { v, start, end, q };
  }

  function renderSummary() {
    const s = readState();
    const { v, start, end, q } = computed(s);
    const host = $("summary");
    if (!v) { host.innerHTML = `<p class="muted">Choisissez un véhicule pour voir le prix.</p>`; return; }
    const pick = A.getAgency(s.pickup), drop = A.getAgency(s.dropoff);
    host.innerHTML = `
      <div class="stage" style="aspect-ratio:16/9;display:grid;place-items:center;padding:6% 6% 10%"><div class="stage__grid"></div>${A.carSVG(v)}</div>
      <div><div class="card__brand">${v.brand}</div><div class="card__name">${v.model}</div></div>
      <dl>
        <dt>Départ</dt><dd>${start ? longDate.format(start) + " · " + s.startTime.replace(":", " h ") : "—"}</dd>
        <dt></dt><dd class="muted" style="font-family:var(--f-body)">${pick ? pick.city : ""}</dd>
        <dt>Retour</dt><dd>${end ? longDate.format(end) + " · " + s.endTime.replace(":", " h ") : "—"}</dd>
        <dt></dt><dd class="muted" style="font-family:var(--f-body)">${drop ? drop.city : ""}</dd>
      </dl>
      ${q ? `<dl>
        <dt>${q.days} jour${q.days > 1 ? "s" : ""} × ${A.fmt.eur(v.price)}</dt><dd>${A.fmt.eur(q.base)}</dd>
        ${q.discount ? `<dt>Remise durée (${Math.round(q.rate * 100)} %)</dt><dd>− ${A.fmt.eur(q.discount)}</dd>` : ""}
        ${q.lines.map(l => `<dt>${l.name}</dt><dd>${A.fmt.eur(l.amount)}</dd>`).join("")}
        ${q.oneWay ? `<dt>Aller simple</dt><dd>${A.fmt.eur(q.oneWay)}</dd>` : ""}
      </dl>
      <div class="total"><span>Total TTC</span><span class="price-big" style="font-size:1.8rem">${A.fmt.eur(q.total)}</span></div>
      <dl>
        <dt>Dont TVA (20 %)</dt><dd>${A.fmt.eur(q.vat)}</dd>
        <dt>Kilométrage inclus</dt><dd>${q.km === null ? "Illimité" : A.fmt.num(q.km) + " km"}</dd>
        <dt>Caution (empreinte)</dt><dd>${A.fmt.eur(q.deposit)}</dd>
      </dl>` : `<p class="notice">Indiquez un retour postérieur au départ pour calculer le prix.</p>`}`;
  }

  /* ---------- Validation ---------- */
  function setFieldError(id, msg) {
    const f = $(id).closest(".field");
    f.classList.toggle("is-invalid", !!msg);
    $(id).setAttribute("aria-invalid", msg ? "true" : "false");
    const e = f.querySelector(".err");
    if (e) e.textContent = msg || "";
  }

  function validate(step) {
    const s = readState();
    const { v, start, end } = computed(s);
    if (step === 1) {
      let msg = "";
      if (!v) msg = "Choisissez un véhicule.";
      else if (!start || !end) msg = "Indiquez les dates de départ et de retour.";
      else if (start < new Date()) msg = "La date de départ est déjà passée. Choisissez une date à venir.";
      else if (end <= start) msg = "Le retour doit avoir lieu après le départ.";
      $("s1-error").textContent = msg;
      $("s1-error").hidden = !msg;
      return !msg;
    }
    if (step === 3) {
      const errs = {};
      if (!s.firstname) errs.firstname = "Indiquez votre prénom.";
      if (!s.lastname) errs.lastname = "Indiquez votre nom.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.email)) errs.email = "Saisissez une adresse e-mail valide, par exemple nom@domaine.fr.";
      if (s.phone.replace(/\D/g, "").length < 9) errs.phone = "Saisissez un numéro de téléphone complet.";
      const birth = parseDate(s.birth), lic = parseDate(s.license);
      if (!birth) errs.birth = "Indiquez votre date de naissance.";
      else if (v && start && yearsBetween(birth, start) < v.minAge)
        errs.birth = `Ce véhicule demande ${v.minAge} ans minimum. Vous aurez ${yearsBetween(birth, start)} ans au départ.`;
      if (!lic) errs.license = "Indiquez la date d'obtention de votre permis.";
      else if (birth && yearsBetween(birth, lic) < 15) errs.license = "Cette date est antérieure à vos 15 ans. Vérifiez la saisie.";
      else if (v && start && yearsBetween(lic, start) < v.licenseYears)
        errs.license = `Ce véhicule demande ${v.licenseYears} ans de permis. Vous en aurez ${Math.max(0, yearsBetween(lic, start))} au départ.`;
      ["firstname", "lastname", "email", "phone", "birth", "license"].forEach(k => setFieldError(k, errs[k]));
      const first = Object.keys(errs)[0];
      if (first) $(first).focus();
      return !first;
    }
    if (step === 4) {
      const ok = $("accept").checked;
      $("s4-error").textContent = ok ? "" : "Cochez la case pour accepter les conditions de location.";
      $("s4-error").hidden = ok;
      return ok;
    }
    return true;
  }

  /* ---------- Étapes ---------- */
  let step = 1;
  function renderRecap() {
    const s = readState();
    const { v, start, end, q } = computed(s);
    const rows = [
      ["Véhicule", `${v.brand} ${v.model}`],
      ["Départ", `${longDate.format(start)} à ${s.startTime.replace(":", " h ")}, ${A.getAgency(s.pickup).city}`],
      ["Retour", `${longDate.format(end)} à ${s.endTime.replace(":", " h ")}, ${A.getAgency(s.dropoff).city}`],
      ["Options", q.lines.length ? q.lines.map(l => l.name).join(", ") : "Aucune"],
      ["Conducteur", `${s.firstname} ${s.lastname}`],
      ["Contact", `${s.email} · ${s.phone}`],
      ["Total TTC", A.fmt.eur(q.total)]
    ];
    $("recap").innerHTML = `<table class="spec-table"><tbody>${rows.map(r => `<tr><th scope="row">${r[0]}</th><td style="font-family:var(--f-body)">${escapeHTML(r[1])}</td></tr>`).join("")}</tbody></table>
      <p class="muted" style="font-size:.85rem">Pièces à présenter au départ : permis de conduire, pièce d'identité et carte bancaire au nom du conducteur pour l'empreinte de ${A.fmt.eur(q.deposit)}.</p>`;
  }
  function escapeHTML(s) { return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

  function go(n) {
    step = n;
    form.querySelectorAll(".book-step[data-step]").forEach(sec => { sec.hidden = +sec.dataset.step !== n; });
    $("done").hidden = true;
    $("stepper").querySelectorAll("li").forEach(li => {
      const k = +li.dataset.step;
      li.classList.toggle("is-current", k === n);
      li.classList.toggle("is-done", k < n);
      if (k === n) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
    });
    $("prev").style.visibility = n === 1 ? "hidden" : "visible";
    $("next").textContent = n === 4 ? "Confirmer la réservation" : "Continuer";
    if (n === 4) renderRecap();
    const top = $("stepper").getBoundingClientRect().top + window.scrollY - 100;
    if (window.scrollY > top) window.scrollTo({ top, behavior: "smooth" });
  }

  function finish() {
    const s = readState();
    const { v, start, q } = computed(s);
    const code = "AD-" + Date.now().toString(36).toUpperCase().slice(-6);
    form.querySelectorAll(".book-step[data-step]").forEach(sec => { sec.hidden = true; });
    $("nav-btns").hidden = true;
    $("done").hidden = false;
    $("code").textContent = code;
    $("done-text").textContent = `${v.brand} ${v.model}, le ${longDate.format(start)} à ${s.startTime.replace(":", " h ")} à ${A.getAgency(s.pickup).city}. Montant total : ${A.fmt.eur(q.total)} TTC. L'agence vous appellera la veille pour confirmer l'heure de remise des clés.`;
    $("stepper").querySelectorAll("li").forEach(li => { li.classList.remove("is-current"); li.classList.add("is-done"); });
    UI.store.set("booking", {});
    UI.toast("Réservation " + code + " enregistrée");
  }

  form.addEventListener("submit", e => {
    e.preventDefault();
    if (!validate(step)) return;
    if (step < 4) go(step + 1); else finish();
  });
  $("prev").addEventListener("click", () => { if (step > 1) go(step - 1); });
  $("restart").addEventListener("click", () => {
    form.reset(); writeState(defaults()); $("nav-btns").hidden = false; go(1); renderSummary();
  });

  // Mise à jour en direct + brouillon mémorisé (les données personnelles restent sur cet appareil)
  form.addEventListener("input", () => { renderSummary(); UI.store.set("booking", readState()); });
  form.addEventListener("change", e => {
    if (e.target.id === "pickup" && $("dropoff").value === state.pickup) $("dropoff").value = e.target.value;
    if (e.target.id === "start-date" && $("end-date").value <= $("start-date").value) {
      const d = parseDate($("start-date").value); d.setDate(d.getDate() + 1); $("end-date").value = iso(d);
    }
    if (e.target.name === "vehicle") $("s1-error").hidden = true;
    state = readState();
    renderSummary();
    UI.store.set("booking", state);
  });
  ["firstname", "lastname", "email", "phone", "birth", "license"].forEach(id =>
    $(id).addEventListener("input", () => setFieldError(id, "")));

  renderSummary();
  go(1);
});
