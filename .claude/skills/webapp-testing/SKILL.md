---
name: webapp-testing
description: Boîte à outils pour interagir avec des applications web locales et les tester avec Playwright. Permet de vérifier le fonctionnement du frontend, de déboguer le comportement de l'interface, de faire des captures d'écran du navigateur et de consulter les logs du navigateur.
license: Conditions complètes dans LICENSE.txt
---

# Test d'applications web

Pour tester des applications web locales, écrivez des scripts Playwright natifs en Python.

**Scripts d'aide disponibles** :
- `scripts/with_server.py` - Gère le cycle de vie du serveur (prend en charge plusieurs serveurs)

**Lancez toujours les scripts avec `--help` d'abord** pour voir leur utilisation. NE lisez PAS le code source avant d'avoir essayé de lancer le script et constaté qu'une solution personnalisée est absolument nécessaire. Ces scripts peuvent être très volumineux et polluer votre fenêtre de contexte. Ils sont conçus pour être appelés directement comme des boîtes noires, et non chargés dans votre fenêtre de contexte.

## Arbre de décision : choisir votre approche

```
Tâche de l'utilisateur → Est-ce du HTML statique ?
    ├─ Oui → Lire directement le fichier HTML pour identifier les sélecteurs
    │         ├─ Réussite → Écrire un script Playwright avec ces sélecteurs
    │         └─ Échec/Incomplet → Traiter comme dynamique (ci-dessous)
    │
    └─ Non (application web dynamique) → Le serveur tourne-t-il déjà ?
        ├─ Non → Lancer : python scripts/with_server.py --help
        │        Puis utiliser l'aide + écrire un script Playwright simplifié
        │
        └─ Oui → Reconnaissance puis action :
            1. Naviguer et attendre networkidle
            2. Faire une capture d'écran ou inspecter le DOM
            3. Identifier les sélecteurs à partir de l'état affiché
            4. Exécuter les actions avec les sélecteurs trouvés
```

## Exemple : utiliser with_server.py

Pour démarrer un serveur, lancez d'abord `--help`, puis utilisez l'aide :

**Un seul serveur :**
```bash
python scripts/with_server.py --server "npm run dev" --port 5173 -- python your_automation.py
```

**Plusieurs serveurs (par ex. backend + frontend) :**
```bash
python scripts/with_server.py \
  --server "cd backend && python server.py" --port 3000 \
  --server "cd frontend && npm run dev" --port 5173 \
  -- python your_automation.py
```

Pour créer un script d'automatisation, n'incluez que la logique Playwright (les serveurs sont gérés automatiquement) :
```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True) # Toujours lancer chromium en mode headless
    page = browser.new_page()
    page.goto('http://localhost:5173') # Serveur déjà lancé et prêt
    page.wait_for_load_state('networkidle') # CRITIQUE : attendre l'exécution du JS
    # ... votre logique d'automatisation
    browser.close()
```

## Schéma reconnaissance puis action

1. **Inspecter le DOM affiché** :
   ```python
   page.screenshot(path='/tmp/inspect.png', full_page=True)
   content = page.content()
   page.locator('button').all()
   ```

2. **Identifier les sélecteurs** à partir des résultats de l'inspection

3. **Exécuter les actions** avec les sélecteurs trouvés

## Piège courant

❌ **N'inspectez pas** le DOM avant d'avoir attendu `networkidle` sur les applications dynamiques
✅ **Attendez** `page.wait_for_load_state('networkidle')` avant l'inspection

## Bonnes pratiques

- **Utilisez les scripts fournis comme des boîtes noires** - Pour accomplir une tâche, vérifiez si l'un des scripts de `scripts/` peut aider. Ces scripts gèrent de manière fiable des workflows courants et complexes sans encombrer la fenêtre de contexte. Utilisez `--help` pour voir leur utilisation, puis appelez-les directement.
- Utilisez `sync_playwright()` pour les scripts synchrones
- Fermez toujours le navigateur à la fin
- Utilisez des sélecteurs descriptifs : `text=`, `role=`, sélecteurs CSS ou identifiants
- Ajoutez des attentes appropriées : `page.wait_for_selector()` ou `page.wait_for_timeout()`

## Fichiers de référence

- **examples/** - Exemples de schémas courants :
  - `element_discovery.py` - Découvrir les boutons, liens et champs d'une page
  - `static_html_automation.py` - Utiliser des URL file:// pour du HTML local
  - `console_logging.py` - Capturer les logs de la console pendant l'automatisation
