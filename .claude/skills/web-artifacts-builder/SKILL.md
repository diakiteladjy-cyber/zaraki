---
name: web-artifacts-builder
description: Suite d'outils pour créer des artefacts HTML claude.ai élaborés et multi-composants avec des technologies web frontend modernes (React, Tailwind CSS, shadcn/ui). À utiliser pour les artefacts complexes nécessitant une gestion d'état, du routage ou des composants shadcn/ui, et non pour de simples artefacts HTML/JSX en un seul fichier.
license: Conditions complètes dans LICENSE.txt
---

# Constructeur d'artefacts web

Pour construire des artefacts frontend claude.ai puissants, suivez ces étapes :
1. Initialisez le dépôt frontend avec `scripts/init-artifact.sh`
2. Développez votre artefact en modifiant le code généré
3. Regroupez tout le code dans un seul fichier HTML avec `scripts/bundle-artifact.sh`
4. Affichez l'artefact à l'utilisateur
5. (Facultatif) Testez l'artefact

**Stack** : React 18 + TypeScript + Vite + Parcel (bundling) + Tailwind CSS + shadcn/ui

## Consignes de design et de style

TRÈS IMPORTANT : pour éviter ce qu'on appelle souvent « AI slop » (le rendu générique typique de l'IA), évitez l'abus de mises en page centrées, les dégradés violets, les coins arrondis uniformes et la police Inter.

## Démarrage rapide

### Étape 1 : initialiser le projet

Lancez le script d'initialisation pour créer un nouveau projet React :
```bash
bash scripts/init-artifact.sh <project-name>
cd <project-name>
```

Cela crée un projet entièrement configuré avec :
- ✅ React + TypeScript (via Vite)
- ✅ Tailwind CSS 3.4.1 avec le système de thèmes shadcn/ui
- ✅ Alias de chemins (`@/`) configurés
- ✅ Plus de 40 composants shadcn/ui préinstallés
- ✅ Toutes les dépendances Radix UI incluses
- ✅ Parcel configuré pour le bundling (via .parcelrc)
- ✅ Compatibilité Node 18+ (détecte automatiquement et fige la version de Vite)

### Étape 2 : développer votre artefact

Pour construire l'artefact, modifiez les fichiers générés. Consultez la section **Tâches de développement courantes** ci-dessous pour vous guider.

### Étape 3 : regrouper en un seul fichier HTML

Pour regrouper l'application React en un seul artefact HTML :
```bash
bash scripts/bundle-artifact.sh
```

Cela crée `bundle.html`, un artefact autonome avec tout le JavaScript, le CSS et les dépendances intégrés. Ce fichier peut être partagé directement comme artefact dans les conversations Claude.

**Prérequis** : votre projet doit avoir un `index.html` à la racine.

**Ce que fait le script** :
- Installe les dépendances de bundling (parcel, @parcel/config-default, parcel-resolver-tspaths, html-inline)
- Crée la configuration `.parcelrc` avec la prise en charge des alias de chemins
- Compile avec Parcel (sans source maps)
- Intègre toutes les ressources dans un seul HTML avec html-inline

### Étape 4 : partager l'artefact avec l'utilisateur

Enfin, partagez le fichier HTML regroupé dans la conversation pour que l'utilisateur puisse le voir comme artefact.

### Étape 5 : tester/visualiser l'artefact (facultatif)

Remarque : cette étape est entièrement facultative. Ne la réalisez que si elle est nécessaire ou demandée.

Pour tester/visualiser l'artefact, utilisez les outils disponibles (y compris d'autres skills ou des outils intégrés comme Playwright ou Puppeteer). En règle générale, évitez de tester l'artefact en amont, car cela ajoute de la latence entre la demande et le moment où l'artefact fini est visible. Testez plus tard, après avoir présenté l'artefact, si c'est demandé ou si des problèmes surviennent.

## Référence

- **Composants shadcn/ui** : https://ui.shadcn.com/docs/components
