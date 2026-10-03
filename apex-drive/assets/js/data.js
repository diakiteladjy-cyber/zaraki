/* Apex Drive — données (véhicules, options, agences, avis) + moteur de rendu SVG.
   Les caractéristiques sont indicatives (données constructeur arrondies). */
(function () {
  "use strict";

  /* ---------- Silhouettes ----------
     Repère 400 × 160, sol à y = 132, l'avant du véhicule est à droite.
     top    : ligne de toit/caisse (lissée par Catmull-Rom selon `tension`)
     glass  : vitrage latéral
     wheels : [x arrière, x avant], r : rayon de roue, sill : bas de caisse */
  const SHAPES = {
    coupe: {
      tension: 1, wheels: [112, 298], r: 25, sill: 114, shoulder: 84,
      top: [[38, 106], [40, 88], [60, 76], [118, 56], [176, 44], [226, 50], [262, 68], [318, 76], [356, 83], [372, 98], [372, 108]],
      glass: [[126, 62], [176, 50], [221, 55], [249, 70], [134, 71]],
      lamp: [356, 88], tail: [44, 84]
    },
    supercar: {
      tension: 1, wheels: [108, 300], r: 26, sill: 114, shoulder: 88,
      top: [[36, 106], [38, 86], [80, 74], [150, 56], [200, 48], [236, 54], [286, 74], [340, 82], [372, 92], [376, 106]],
      glass: [[152, 62], [198, 53], [231, 58], [266, 74], [152, 75]],
      lamp: [360, 89], tail: [42, 84]
    },
    berline: {
      tension: 1, wheels: [105, 300], r: 25, sill: 115, shoulder: 84,
      top: [[30, 106], [32, 88], [52, 74], [100, 66], [150, 46], [210, 42], [256, 52], [292, 70], [350, 78], [372, 90], [374, 106]],
      glass: [[108, 70], [152, 52], [208, 48], [249, 57], [279, 72]],
      lamp: [358, 86], tail: [36, 82]
    },
    break: {
      tension: 1, wheels: [100, 302], r: 25, sill: 115, shoulder: 84,
      top: [[30, 106], [30, 84], [38, 60], [62, 50], [200, 44], [248, 50], [290, 70], [350, 78], [372, 90], [374, 106]],
      glass: [[46, 64], [64, 56], [200, 50], [243, 56], [277, 72], [48, 72]],
      lamp: [358, 86], tail: [34, 76]
    },
    suv: {
      tension: 1, wheels: [102, 300], r: 28, sill: 108, shoulder: 76,
      top: [[28, 102], [28, 70], [40, 48], [70, 40], [220, 38], [262, 48], [296, 64], [352, 72], [372, 84], [374, 102]],
      glass: [[48, 53], [72, 46], [216, 44], [255, 53], [285, 66], [50, 66]],
      lamp: [358, 78], tail: [32, 68]
    },
    offroad: {
      tension: 0.25, wheels: [98, 296], r: 30, sill: 104, shoulder: 70,
      top: [[26, 100], [26, 46], [34, 34], [230, 32], [246, 36], [262, 62], [360, 66], [374, 72], [376, 100]],
      glass: [[42, 40], [224, 38], [237, 41], [251, 62], [42, 62]],
      lamp: [362, 74], tail: [30, 60]
    }
  };

  /* ---------- Véhicules ---------- */
  const VEHICLES = [
    {
      id: "porsche-911", brand: "Porsche", model: "911 Carrera S", category: "Sportive", shape: "coupe",
      energy: "Essence", gearbox: "Automatique", power: 450, accel: 3.5, vmax: 308, seats: 4, luggage: 132,
      consumption: "10,5 L/100 km", price: 590, deposit: 5000, kmPerDay: 200, minAge: 25, licenseYears: 5,
      featured: true, rating: 4.9,
      tagline: "La référence, depuis 1963.",
      description: "Six cylindres à plat biturbo, boîte PDK à 8 rapports et un équilibre de châssis qui rend chaque virage lisible. La 911 la plus demandée de notre flotte, aussi à l'aise sur l'autoroute que sur une route de col.",
      colors: [{ n: "Gris Craie", h: "#c9c7bf" }, { n: "Bleu Gentiane", h: "#1f3a73" }, { n: "Noir Intense", h: "#16181c" }, { n: "Rouge Carmin", h: "#8f1b22" }],
      caliper: "#c8102e"
    },
    {
      id: "bmw-m4", brand: "BMW", model: "M4 Competition", category: "Sportive", shape: "coupe",
      energy: "Essence", gearbox: "Automatique", power: 510, accel: 3.9, vmax: 250, seats: 4, luggage: 440,
      consumption: "10,2 L/100 km", price: 390, deposit: 4000, kmPerDay: 250, minAge: 25, licenseYears: 3,
      featured: false, rating: 4.8,
      tagline: "Quatre vraies places, aucun compromis.",
      description: "Six cylindres en ligne de 510 ch, propulsion et coffre de 440 litres : la sportive que l'on peut prendre pour un week-end à deux comme à quatre.",
      colors: [{ n: "Jaune São Paulo", h: "#e3bf1f" }, { n: "Vert Isle of Man", h: "#1f5a46" }, { n: "Gris Brooklyn", h: "#8a8d90" }, { n: "Noir Saphir", h: "#121418" }],
      caliper: "#1c4fa1"
    },
    {
      id: "amg-gt", brand: "Mercedes-AMG", model: "GT 63 Coupé", category: "Grand Tourisme", shape: "coupe",
      energy: "Essence", gearbox: "Automatique", power: 585, accel: 3.2, vmax: 315, seats: 4, luggage: 321,
      consumption: "14,1 L/100 km", price: 520, deposit: 6000, kmPerDay: 250, minAge: 27, licenseYears: 5,
      featured: true, rating: 4.8,
      tagline: "Le V8 qui avale les kilomètres.",
      description: "V8 biturbo de 4,0 litres, transmission intégrale et suspension active. Une GT pensée pour relier Paris à la Côte d'Azur dans la journée, sans fatigue.",
      colors: [{ n: "Argent High-Tech", h: "#a7acb1" }, { n: "Bleu Spectral", h: "#22407a" }, { n: "Noir Obsidienne", h: "#141519" }, { n: "Blanc Opalite", h: "#e6e5e0" }],
      caliper: "#d6a75c"
    },
    {
      id: "huracan-evo", brand: "Lamborghini", model: "Huracán EVO", category: "Supercar", shape: "supercar",
      energy: "Essence", gearbox: "Automatique", power: 640, accel: 2.9, vmax: 325, seats: 2, luggage: 100,
      consumption: "13,9 L/100 km", price: 1290, deposit: 15000, kmPerDay: 150, minAge: 30, licenseYears: 8,
      featured: true, rating: 5.0,
      tagline: "Un V10 atmosphérique, à 8 500 tr/min.",
      description: "Le dernier V10 atmosphérique de série, 640 ch et un son que l'on n'oublie pas. Remise du véhicule avec briefing personnalisé de 30 minutes par un de nos préparateurs.",
      colors: [{ n: "Verde Mantis", h: "#5ea52a" }, { n: "Arancio Borealis", h: "#e2701c" }, { n: "Grigio Telesto", h: "#6d7176" }, { n: "Bianco Monocerus", h: "#ecebe6" }],
      caliper: "#111111"
    },
    {
      id: "ferrari-roma", brand: "Ferrari", model: "Roma", category: "Grand Tourisme", shape: "coupe",
      energy: "Essence", gearbox: "Automatique", power: 620, accel: 3.4, vmax: 320, seats: 4, luggage: 272,
      consumption: "11,2 L/100 km", price: 1090, deposit: 12000, kmPerDay: 200, minAge: 30, licenseYears: 8,
      featured: false, rating: 4.9,
      tagline: "La Dolce Vita, en V8.",
      description: "Un dessin épuré, un V8 de 620 ch et un confort de grande routière. Idéale pour un mariage, un anniversaire ou une escapade sur la Riviera.",
      colors: [{ n: "Rosso Portofino", h: "#a5121c" }, { n: "Blu Roma", h: "#2a3d5c" }, { n: "Grigio Ingrid", h: "#6b6e70" }, { n: "Nero Daytona", h: "#121214" }],
      caliper: "#e2c044"
    },
    {
      id: "taycan-4s", brand: "Porsche", model: "Taycan 4S", category: "Berline", shape: "berline",
      energy: "Électrique", gearbox: "Automatique", power: 598, accel: 3.7, vmax: 250, seats: 5, luggage: 407,
      consumption: "Autonomie jusqu'à 640 km", price: 450, deposit: 5000, kmPerDay: 300, minAge: 25, licenseYears: 3,
      featured: true, rating: 4.8,
      tagline: "800 volts, zéro émission à l'usage.",
      description: "Recharge de 10 à 80 % en 18 minutes sur borne haute puissance, quatre roues motrices et une vraie banquette arrière. Badge de recharge inclus dans la location.",
      colors: [{ n: "Bleu Glacier", h: "#8fb3cf" }, { n: "Gris Volcan", h: "#53565a" }, { n: "Blanc Carrara", h: "#e9e8e3" }, { n: "Vert Provence", h: "#73806a" }],
      caliper: "#2bbfa4"
    },
    {
      id: "audi-rs6", brand: "Audi", model: "RS 6 Avant performance", category: "Break", shape: "break",
      energy: "Hybride", gearbox: "Automatique", power: 630, accel: 3.4, vmax: 250, seats: 5, luggage: 565,
      consumption: "12,2 L/100 km", price: 420, deposit: 5000, kmPerDay: 300, minAge: 25, licenseYears: 5,
      featured: false, rating: 4.9,
      tagline: "Les vacances en famille, à 630 ch.",
      description: "V8 biturbo à hybridation légère, transmission quattro et 565 litres de coffre. Barres de toit et coffre de toit disponibles sur demande.",
      colors: [{ n: "Gris Nardo", h: "#8c8e8c" }, { n: "Bleu Ascari", h: "#1d4f8f" }, { n: "Noir Mythic", h: "#131416" }, { n: "Vert Sebring", h: "#2f4a3a" }],
      caliper: "#c8102e"
    },
    {
      id: "range-sport", brand: "Land Rover", model: "Range Rover Sport P550e", category: "SUV", shape: "suv",
      energy: "Hybride", gearbox: "Automatique", power: 550, accel: 4.3, vmax: 242, seats: 5, luggage: 647,
      consumption: "Jusqu'à 113 km en électrique", price: 380, deposit: 4000, kmPerDay: 300, minAge: 25, licenseYears: 3,
      featured: false, rating: 4.7,
      tagline: "Le luxe, même hors du bitume.",
      description: "Hybride rechargeable de 550 ch, suspension pneumatique et plus de 100 km en mode électrique. Le SUV de nos clients pour les stations de ski.",
      colors: [{ n: "Gris Charente", h: "#5a5f63" }, { n: "Vert Belgravia", h: "#2b3a33" }, { n: "Blanc Fuji", h: "#ecebe7" }, { n: "Bleu Varese", h: "#1f2e47" }],
      caliper: "#c0c4c8"
    },
    {
      id: "amg-g63", brand: "Mercedes-AMG", model: "G 63", category: "SUV", shape: "offroad",
      energy: "Essence", gearbox: "Automatique", power: 585, accel: 4.4, vmax: 220, seats: 5, luggage: 640,
      consumption: "15,9 L/100 km", price: 690, deposit: 8000, kmPerDay: 200, minAge: 27, licenseYears: 5,
      featured: true, rating: 4.8,
      tagline: "Une icône, trois blocages de différentiel.",
      description: "V8 biturbo, trois blocages de différentiel et une présence que rien n'égale en ville. Livré avec chauffeur sur demande pour vos événements.",
      colors: [{ n: "Noir Magno", h: "#1b1c1e" }, { n: "Vert Olive", h: "#4b5136" }, { n: "Blanc Polaire", h: "#ecece8" }, { n: "Sable Désert", h: "#b49e7c" }],
      caliper: "#c8102e"
    },
    {
      id: "alpine-a110s", brand: "Alpine", model: "A110 S", category: "Sportive", shape: "coupe",
      energy: "Essence", gearbox: "Automatique", power: 300, accel: 4.2, vmax: 260, seats: 2, luggage: 196,
      consumption: "6,9 L/100 km", price: 290, deposit: 3000, kmPerDay: 250, minAge: 23, licenseYears: 3,
      featured: false, rating: 4.9,
      tagline: "1 109 kg de pure agilité.",
      description: "Moteur central arrière, structure aluminium et à peine plus d'une tonne : l'Alpine se savoure sur les petites routes. Notre meilleur rapport plaisir/prix.",
      colors: [{ n: "Bleu Alpine", h: "#1d4fa0" }, { n: "Blanc Glacier", h: "#ebeae5" }, { n: "Orange Feu", h: "#d6561f" }, { n: "Noir Profond", h: "#141518" }],
      caliper: "#2468c6"
    }
  ];

  const OPTIONS = [
    { id: "serenite", name: "Assurance Sérénité", detail: "Franchise réduite à 500 € en cas de dommage", price: 69, per: "jour" },
    { id: "conducteur", name: "Conducteur additionnel", detail: "Mêmes conditions d'âge et de permis", price: 25, per: "jour" },
    { id: "km", name: "Kilométrage illimité", detail: "Sinon 1,20 € par km au-delà du forfait", price: 89, per: "jour" },
    { id: "livraison", name: "Livraison et reprise", detail: "À domicile, à l'hôtel ou en gare, dans un rayon de 30 km", price: 120, per: "forfait" },
    { id: "plein", name: "Plein ou recharge offerts au retour", detail: "Rendez le véhicule sans passer à la pompe", price: 90, per: "forfait" },
    { id: "siege", name: "Siège enfant", detail: "Groupe 1/2/3, installé avant la remise", price: 15, per: "jour" }
  ];

  const AGENCIES = [
    { id: "paris", city: "Paris", area: "8e arrondissement", address: "Avenue Hoche, 75008 Paris", hours: "Lun–Sam · 8h00–20h00", phone: "01 84 60 00 00" },
    { id: "cdg", city: "Paris CDG", area: "Aéroport, terminal 2", address: "Parking P Premium, 95700 Roissy", hours: "7j/7 · 6h00–23h00", phone: "01 84 60 00 01" },
    { id: "lyon", city: "Lyon", area: "Les Brotteaux", address: "Boulevard des Belges, 69006 Lyon", hours: "Lun–Sam · 8h30–19h30", phone: "04 28 70 00 00" },
    { id: "nice", city: "Nice", area: "Aéroport Côte d'Azur", address: "Terminal 2, 06200 Nice", hours: "7j/7 · 7h00–22h00", phone: "04 22 80 00 00" },
    { id: "bordeaux", city: "Bordeaux", area: "Chartrons", address: "Quai des Chartrons, 33000 Bordeaux", hours: "Lun–Sam · 9h00–19h00", phone: "05 35 90 00 00" }
  ];

  /* Avis d'exemple : à remplacer par de vrais avis clients avant mise en ligne. */
  const REVIEWS = [
    { name: "Camille R.", city: "Lyon", vehicle: "porsche-911", stars: 5, date: "Septembre 2026", text: "Véhicule impeccable, remise des clés en dix minutes avec une vraie explication des modes de conduite. Route des Grandes Alpes inoubliable." },
    { name: "Mehdi B.", city: "Paris", vehicle: "amg-g63", stars: 5, date: "Août 2026", text: "Livré devant l'hôtel pour notre mariage, plein fait, intérieur parfait. L'équipe a répondu au téléphone même un dimanche." },
    { name: "Sophie L.", city: "Bordeaux", vehicle: "taycan-4s", stars: 4, date: "Juillet 2026", text: "Première voiture électrique pour moi : le badge de recharge et l'itinéraire préparé avec les bornes ont tout simplifié." },
    { name: "Thomas G.", city: "Nice", vehicle: "huracan-evo", stars: 5, date: "Juin 2026", text: "Le briefing avant le départ rassure, et la caution a été libérée deux jours après le retour. Sérieux du début à la fin." },
    { name: "Inès K.", city: "Paris", vehicle: "audi-rs6", stars: 5, date: "Mai 2026", text: "Parfaite pour partir à quatre avec les bagages. Prix clair dès la réservation, rien de plus au retour." },
    { name: "Julien M.", city: "Lyon", vehicle: "alpine-a110s", stars: 5, date: "Avril 2026", text: "Petite, légère, joueuse. Le kilométrage inclus suffit largement pour un week-end dans le Beaujolais." }
  ];

  /* ---------- Utilitaires ---------- */
  const eur = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  const num = new Intl.NumberFormat("fr-FR");
  const dec = new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  function getVehicle(id) { return VEHICLES.find(v => v.id === id) || null; }
  function getAgency(id) { return AGENCIES.find(a => a.id === id) || null; }

  function shade(hex, amt) { // amt de -1 (noir) à 1 (blanc)
    const n = parseInt(hex.slice(1), 16);
    let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
    r = Math.round((t - r) * p + r); g = Math.round((t - g) * p + g); b = Math.round((t - b) * p + b);
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  function luminance(hex) {
    const n = parseInt(hex.slice(1), 16);
    return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  }

  /* Catmull-Rom → courbes de Bézier cubiques */
  function smoothPath(pts, tension) {
    if (tension <= 0) return pts.map((p, i) => (i ? "L" : "M") + p[0] + " " + p[1]).join(" ");
    let d = "M" + pts[0][0] + " " + pts[0][1];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      const k = tension / 6;
      const c1 = [p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k];
      const c2 = [p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k];
      d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`;
    }
    return d;
  }
  /* Échantillonne la même courbe en polyligne (utilisé par le moteur 3D) */
  function samplePoints(pts, tension, steps) {
    if (tension <= 0) return pts.map(p => p.slice());
    const out = [];
    const k = tension / 6;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k];
      const c2 = [p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k];
      for (let s = 0; s < steps; s++) {
        const t = s / steps, u = 1 - t;
        out.push([
          u * u * u * p1[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p2[0],
          u * u * u * p1[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p2[1]
        ]);
      }
    }
    out.push(pts[pts.length - 1].slice());
    return out;
  }

  const GROUND = 132;
  function wheelCenterY(s) { return GROUND - s.r; }

  function bodyPath(s) {
    const top = s.top, first = top[0], last = top[top.length - 1];
    const cy = wheelCenterY(s), ar = s.r + 5;
    const dy = s.sill - cy, hw = Math.sqrt(Math.max(ar * ar - dy * dy, 1));
    const [wr, wf] = s.wheels;
    let d = smoothPath(top, s.tension);
    d += ` L${last[0]} ${s.sill}`;
    d += ` L${(wf + hw).toFixed(1)} ${s.sill} A${ar} ${ar} 0 1 0 ${(wf - hw).toFixed(1)} ${s.sill}`;
    d += ` L${(wr + hw).toFixed(1)} ${s.sill} A${ar} ${ar} 0 1 0 ${(wr - hw).toFixed(1)} ${s.sill}`;
    d += ` L${first[0]} ${s.sill} Z`;
    return d;
  }

  let uid = 0;
  function wheelSVG(x, cy, r, caliper, id) {
    const rim = r * 0.64;
    let spokes = "";
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      spokes += `<line x1="${x}" y1="${cy}" x2="${(x + Math.cos(a) * rim * 0.95).toFixed(1)}" y2="${(cy + Math.sin(a) * rim * 0.95).toFixed(1)}" stroke="url(#rim${id})" stroke-width="${(r * 0.17).toFixed(1)}" stroke-linecap="round"/>`;
    }
    return `<g class="wheel">
      <circle cx="${x}" cy="${cy}" r="${r}" fill="#0c0d10"/>
      <circle cx="${x}" cy="${cy}" r="${(r - 2).toFixed(1)}" fill="none" stroke="#24272d" stroke-width="1.2"/>
      <circle cx="${x}" cy="${cy}" r="${rim.toFixed(1)}" fill="#1a1d22"/>
      <path d="M${(x + rim * 0.55).toFixed(1)} ${(cy - rim * 0.62).toFixed(1)} A${(rim * 0.82).toFixed(1)} ${(rim * 0.82).toFixed(1)} 0 0 1 ${(x + rim * 0.8).toFixed(1)} ${(cy + rim * 0.2).toFixed(1)}" stroke="${caliper}" stroke-width="${(r * 0.16).toFixed(1)}" fill="none" stroke-linecap="round"/>
      ${spokes}
      <circle cx="${x}" cy="${cy}" r="${(rim).toFixed(1)}" fill="none" stroke="url(#rim${id})" stroke-width="1.6"/>
      <circle cx="${x}" cy="${cy}" r="${(r * 0.14).toFixed(1)}" fill="#c9ced6"/>
    </g>`;
  }

  /* Rendu SVG d'un véhicule.
     opts.color : teinte de carrosserie ; opts.view : "side" | "rear" | "wheel" | "night" */
  function carSVG(v, opts) {
    opts = opts || {};
    const s = SHAPES[v.shape];
    const color = opts.color || v.colors[0].h;
    const view = opts.view || "side";
    const id = "c" + (++uid);
    const cy = wheelCenterY(s);
    const light = luminance(color) > 0.6;
    const hi = shade(color, light ? 0.5 : 0.35);
    const lo = shade(color, -0.55);
    const [wr, wf] = s.wheels;
    const front = s.top[s.top.length - 1][0];
    const rear = s.top[0][0];
    const vb = view === "wheel" ? `${wf - 46} ${cy - 46} 92 92` : "0 18 400 128";
    const flip = view === "rear" ? ` transform="translate(400 0) scale(-1 1)"` : "";
    const night = view === "night";
    const glassD = smoothPath(s.glass.concat([s.glass[0]]), 0.6) + " Z";
    const beam = night
      ? `<path d="M${s.lamp[0]} ${s.lamp[1]} L520 ${s.lamp[1] - 26} L520 ${s.lamp[1] + 40} Z" fill="url(#beam${id})"/>`
      : "";
    const label = `${v.brand} ${v.model}, ${opts.colorName || v.colors[0].n}`;

    return `<svg class="car ${opts.className || ""}" viewBox="${vb}" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="body${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${hi}"/><stop offset=".42" stop-color="${color}"/><stop offset="1" stop-color="${lo}"/>
    </linearGradient>
    <linearGradient id="glass${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#3a4558"/><stop offset=".55" stop-color="#121822"/><stop offset="1" stop-color="#0a0d12"/>
    </linearGradient>
    <linearGradient id="rim${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#e3e7ec"/><stop offset="1" stop-color="#6c727c"/>
    </linearGradient>
    <radialGradient id="shadow${id}" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="beam${id}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#fff6d8" stop-opacity=".55"/><stop offset="1" stop-color="#fff6d8" stop-opacity="0"/>
    </linearGradient>
    <clipPath id="clip${id}"><path d="${bodyPath(s)}"/></clipPath>
  </defs>
  <g${flip}>
    <ellipse cx="${(rear + front) / 2}" cy="${GROUND + 1}" rx="${(front - rear) / 2 + 14}" ry="7" fill="url(#shadow${id})"/>
    ${beam}
    <path d="${bodyPath(s)}" fill="url(#body${id})"/>
    <g clip-path="url(#clip${id})">
      <path d="M0 ${s.sill - 9} H400 V${s.sill + 2} H0 Z" fill="${lo}" opacity=".55"/>
      <path d="M${rear + 10} ${s.shoulder} Q ${(rear + front) / 2} ${s.shoulder - 3} ${front - 16} ${s.shoulder + 4}" stroke="${hi}" stroke-opacity=".7" stroke-width="1.4" fill="none"/>
      <path d="M${rear} ${s.shoulder + 14} H${front}" stroke="#000" stroke-opacity=".18" stroke-width="1"/>
    </g>
    <path d="${glassD}" fill="url(#glass${id})" stroke="${shade(color, -0.7)}" stroke-width="1.6"/>
    <path d="M${s.glass[0][0] + 10} ${s.glass[0][1] + 2} L ${s.glass[1][0]} ${s.glass[1][1] + 3}" stroke="#fff" stroke-opacity=".18" stroke-width="2" stroke-linecap="round"/>
    <ellipse cx="${s.lamp[0]}" cy="${s.lamp[1]}" rx="9" ry="3.2" fill="${night ? "#fffbe8" : "#e9eef5"}" ${night ? 'filter="drop-shadow(0 0 6px #fff3c4)"' : ""}/>
    <rect x="${s.tail[0] - 3}" y="${s.tail[1] - 2.5}" width="12" height="5" rx="2" fill="#b3121f" ${night ? 'filter="drop-shadow(0 0 5px #ff2a2a)"' : ""}/>
    ${wheelSVG(wr, cy, s.r, v.caliper, id)}
    ${wheelSVG(wf, cy, s.r, v.caliper, id)}
  </g>
</svg>`;
  }

  /* ---------- Tarification ----------
     Durée arrondie au jour supérieur ; remise de 5 % dès 3 jours, 12 % dès 7 jours ;
     aller simple entre deux agences : 150 €. Prix TTC (TVA 20 %). */
  const ONE_WAY_FEE = 150;
  function rentalDays(start, end) {
    const ms = end - start;
    if (!(ms > 0)) return 0;
    return Math.max(1, Math.ceil(ms / 86400000 - 1e-9));
  }
  function quote(v, start, end, optionIds, oneWay) {
    const days = rentalDays(start, end);
    const base = v.price * days;
    const rate = days >= 7 ? 0.12 : days >= 3 ? 0.05 : 0;
    const discount = Math.round(base * rate);
    const lines = (optionIds || []).map(id => OPTIONS.find(o => o.id === id)).filter(Boolean).map(o => ({
      id: o.id, name: o.name, amount: o.per === "jour" ? o.price * days : o.price
    }));
    const optTotal = lines.reduce((a, l) => a + l.amount, 0);
    const fee = oneWay ? ONE_WAY_FEE : 0;
    const total = base - discount + optTotal + fee;
    return {
      days, base, rate, discount, lines, oneWay: fee, total,
      vat: Math.round(total - total / 1.2),
      km: (optionIds || []).includes("km") ? null : v.kmPerDay * days,
      deposit: (optionIds || []).includes("serenite") ? Math.round(v.deposit / 2) : v.deposit
    };
  }

  window.Apex = {
    VEHICLES, OPTIONS, AGENCIES, REVIEWS, SHAPES, GROUND, ONE_WAY_FEE,
    getVehicle, getAgency, carSVG, samplePoints, shade, wheelCenterY, rentalDays, quote,
    fmt: { eur: n => eur.format(n), num: n => num.format(n), dec: n => dec.format(n) }
  };
})();
