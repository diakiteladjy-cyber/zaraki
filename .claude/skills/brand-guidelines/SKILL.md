---
name: brand-guidelines
description: Applique les couleurs et la typographie officielles de la marque Anthropic à tout type d'artefact qui gagnerait à adopter l'identité visuelle d'Anthropic. À utiliser lorsque des couleurs de marque, une charte graphique, une mise en forme visuelle ou des standards de design d'entreprise s'appliquent.
license: Conditions complètes dans LICENSE.txt
---

# Charte graphique Anthropic

## Vue d'ensemble

Utilisez ce skill pour accéder aux ressources officielles d'identité visuelle et de style d'Anthropic.

**Mots-clés** : image de marque, identité d'entreprise, identité visuelle, post-traitement, stylisation, couleurs de marque, typographie, marque Anthropic, mise en forme visuelle, design visuel

## Charte graphique

### Couleurs

**Couleurs principales :**

- Foncé : `#141413` - Texte principal et fonds sombres
- Clair : `#faf9f5` - Fonds clairs et texte sur fond sombre
- Gris moyen : `#b0aea5` - Éléments secondaires
- Gris clair : `#e8e6dc` - Fonds discrets

**Couleurs d'accent :**

- Orange : `#d97757` - Accent principal
- Bleu : `#6a9bcc` - Accent secondaire
- Vert : `#788c5d` - Accent tertiaire

### Typographie

- **Titres** : Poppins (avec Arial en secours)
- **Corps de texte** : Lora (avec Georgia en secours)
- **Remarque** : pour de meilleurs résultats, les polices doivent être préinstallées dans votre environnement

## Fonctionnalités

### Application intelligente des polices

- Applique la police Poppins aux titres (24 pt et plus)
- Applique la police Lora au corps de texte
- Bascule automatiquement sur Arial/Georgia si les polices personnalisées ne sont pas disponibles
- Préserve la lisibilité sur tous les systèmes

### Stylisation du texte

- Titres (24 pt et plus) : police Poppins
- Corps de texte : police Lora
- Choix intelligent de la couleur selon le fond
- Préserve la hiérarchie et la mise en forme du texte

### Formes et couleurs d'accent

- Les formes non textuelles utilisent les couleurs d'accent
- Alterne entre les accents orange, bleu et vert
- Maintient l'intérêt visuel tout en respectant la marque

## Détails techniques

### Gestion des polices

- Utilise les polices Poppins et Lora installées sur le système lorsqu'elles sont disponibles
- Bascule automatiquement sur Arial (titres) et Georgia (corps)
- Aucune installation de police requise : fonctionne avec les polices système existantes
- Pour de meilleurs résultats, préinstallez Poppins et Lora dans votre environnement

### Application des couleurs

- Utilise des valeurs RGB pour une correspondance précise avec la marque
- Appliquées via la classe RGBColor de python-pptx
- Maintient la fidélité des couleurs sur les différents systèmes
