# Apex Drive

Site vitrine et de réservation pour une agence de location de voitures de prestige.
HTML, CSS et JavaScript sans étape de build.

## Lancer en local

```bash
python -m http.server 5178 --directory apex-drive
```

Puis ouvrir http://localhost:5178/

## Pages

- `index.html` : accueil
- `flotte.html` : flotte avec filtres et tri
- `vehicule.html#<id>` : fiche véhicule, galerie et vue 3D (ex. `vehicule.html#porsche-911`)
- `reservation.html#<id>` : parcours de réservation en 4 étapes
- `legal.html` : mentions légales, conditions, confidentialité (modèle à compléter)

Les véhicules, options, agences et avis se modifient dans `assets/js/data.js`.
Les avis fournis sont des exemples à remplacer.
