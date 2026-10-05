---
name: mcp-builder
description: Guide pour créer des serveurs MCP (Model Context Protocol) de haute qualité qui permettent aux LLM d'interagir avec des services externes grâce à des outils bien conçus. À utiliser lors de la création de serveurs MCP pour intégrer des API ou services externes, en Python (FastMCP) ou en Node/TypeScript (MCP SDK).
license: Conditions complètes dans LICENSE.txt
---

# Guide de développement de serveurs MCP

## Vue d'ensemble

Créez des serveurs MCP (Model Context Protocol) qui permettent aux LLM d'interagir avec des services externes grâce à des outils bien conçus. La qualité d'un serveur MCP se mesure à sa capacité à permettre aux LLM d'accomplir des tâches concrètes.

---

# Processus

## 🚀 Workflow général

La création d'un serveur MCP de haute qualité comporte quatre phases principales :

### Phase 1 : recherche approfondie et planification

#### 1.1 Comprendre la conception MCP moderne

**Couverture de l'API vs outils de workflow :**
Équilibrez une couverture complète des endpoints de l'API avec des outils de workflow spécialisés. Les outils de workflow peuvent être plus pratiques pour des tâches précises, tandis qu'une couverture complète donne aux agents la souplesse de composer des opérations. Les performances varient selon le client : certains clients tirent profit de l'exécution de code combinant des outils de base, d'autres fonctionnent mieux avec des workflows de plus haut niveau. En cas de doute, privilégiez une couverture complète de l'API.

**Nommage et découvrabilité des outils :**
Des noms d'outils clairs et descriptifs aident les agents à trouver rapidement les bons outils. Utilisez des préfixes cohérents (par ex. `github_create_issue`, `github_list_repos`) et des noms orientés action.

**Gestion du contexte :**
Les agents bénéficient de descriptions d'outils concises et de la possibilité de filtrer/paginer les résultats. Concevez des outils qui renvoient des données ciblées et pertinentes. Certains clients prennent en charge l'exécution de code, ce qui peut aider les agents à filtrer et traiter les données efficacement.

**Messages d'erreur exploitables :**
Les messages d'erreur doivent orienter les agents vers des solutions, avec des suggestions précises et les prochaines étapes.

#### 1.2 Étudier la documentation du protocole MCP

**Parcourir la spécification MCP :**

Commencez par le plan du site pour trouver les pages pertinentes : `https://modelcontextprotocol.io/sitemap.xml`

Récupérez ensuite des pages précises avec le suffixe `.md` pour obtenir le format markdown (par ex. `https://modelcontextprotocol.io/specification/draft.md`).

Pages clés à consulter :
- Vue d'ensemble et architecture de la spécification
- Mécanismes de transport (HTTP streamable, stdio)
- Définitions des outils, ressources et prompts

#### 1.3 Étudier la documentation du framework

**Stack recommandée :**
- **Langage** : TypeScript (SDK de grande qualité et bonne compatibilité avec de nombreux environnements d'exécution, par ex. MCPB. De plus, les modèles d'IA génèrent bien du code TypeScript, grâce à sa large diffusion, son typage statique et ses bons outils de lint)
- **Transport** : HTTP streamable pour les serveurs distants, avec du JSON sans état (plus simple à faire évoluer et à maintenir que des sessions avec état et des réponses en streaming). stdio pour les serveurs locaux.

**Charger la documentation du framework :**

- **Bonnes pratiques MCP** : [📋 Voir les bonnes pratiques](./reference/mcp_best_practices.md) - Consignes fondamentales

**Pour TypeScript (recommandé) :**
- **SDK TypeScript** : utilisez WebFetch pour charger `https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/main/README.md`
- [⚡ Guide TypeScript](./reference/node_mcp_server.md) - Schémas et exemples TypeScript

**Pour Python :**
- **SDK Python** : utilisez WebFetch pour charger `https://raw.githubusercontent.com/modelcontextprotocol/python-sdk/main/README.md`
- [🐍 Guide Python](./reference/python_mcp_server.md) - Schémas et exemples Python

#### 1.4 Planifier l'implémentation

**Comprendre l'API :**
Consultez la documentation de l'API du service pour identifier les endpoints clés, les exigences d'authentification et les modèles de données. Utilisez la recherche web et WebFetch au besoin.

**Sélection des outils :**
Privilégiez une couverture complète de l'API. Listez les endpoints à implémenter, en commençant par les opérations les plus courantes.

---

### Phase 2 : implémentation

#### 2.1 Mettre en place la structure du projet

Consultez les guides propres à chaque langage pour la mise en place du projet :
- [⚡ Guide TypeScript](./reference/node_mcp_server.md) - Structure du projet, package.json, tsconfig.json
- [🐍 Guide Python](./reference/python_mcp_server.md) - Organisation des modules, dépendances

#### 2.2 Implémenter l'infrastructure de base

Créez des utilitaires partagés :
- Client API avec authentification
- Fonctions d'aide à la gestion des erreurs
- Formatage des réponses (JSON/Markdown)
- Prise en charge de la pagination

#### 2.3 Implémenter les outils

Pour chaque outil :

**Schéma d'entrée :**
- Utilisez Zod (TypeScript) ou Pydantic (Python)
- Incluez des contraintes et des descriptions claires
- Ajoutez des exemples dans les descriptions des champs

**Schéma de sortie :**
- Définissez un `outputSchema` lorsque c'est possible pour les données structurées
- Utilisez `structuredContent` dans les réponses des outils (fonctionnalité du SDK TypeScript)
- Aide les clients à comprendre et traiter les sorties des outils

**Description de l'outil :**
- Résumé concis de la fonctionnalité
- Descriptions des paramètres
- Schéma du type de retour

**Implémentation :**
- Async/await pour les opérations d'E/S
- Gestion correcte des erreurs avec des messages exploitables
- Prise en charge de la pagination lorsque c'est pertinent
- Renvoyer à la fois du contenu texte et des données structurées avec les SDK modernes

**Annotations :**
- `readOnlyHint` : true/false
- `destructiveHint` : true/false
- `idempotentHint` : true/false
- `openWorldHint` : true/false

---

### Phase 3 : revue et tests

#### 3.1 Qualité du code

Vérifiez :
- L'absence de code dupliqué (principe DRY)
- Une gestion des erreurs cohérente
- Un typage complet
- Des descriptions d'outils claires

#### 3.2 Compiler et tester

**TypeScript :**
- Lancez `npm run build` pour vérifier la compilation
- Testez avec MCP Inspector : `npx @modelcontextprotocol/inspector`

**Python :**
- Vérifiez la syntaxe : `python -m py_compile your_server.py`
- Testez avec MCP Inspector

Consultez les guides propres à chaque langage pour des approches de test détaillées et des listes de contrôle qualité.

---

### Phase 4 : créer des évaluations

Après avoir implémenté votre serveur MCP, créez des évaluations complètes pour tester son efficacité.

**Chargez le [✅ Guide d'évaluation](./reference/evaluation.md) pour les consignes complètes.**

#### 4.1 Comprendre le but des évaluations

Utilisez les évaluations pour vérifier si des LLM peuvent utiliser efficacement votre serveur MCP pour répondre à des questions réalistes et complexes.

#### 4.2 Créer 10 questions d'évaluation

Pour créer des évaluations efficaces, suivez le processus décrit dans le guide d'évaluation :

1. **Inspection des outils** : listez les outils disponibles et comprenez leurs capacités
2. **Exploration du contenu** : utilisez des opérations EN LECTURE SEULE pour explorer les données disponibles
3. **Génération des questions** : créez 10 questions complexes et réalistes
4. **Vérification des réponses** : résolvez vous-même chaque question pour vérifier les réponses

#### 4.3 Exigences des évaluations

Assurez-vous que chaque question est :
- **Indépendante** : ne dépend pas des autres questions
- **En lecture seule** : seules des opérations non destructives sont nécessaires
- **Complexe** : nécessite plusieurs appels d'outils et une exploration approfondie
- **Réaliste** : fondée sur de vrais cas d'usage qui intéressent des humains
- **Vérifiable** : une seule réponse claire, vérifiable par comparaison de chaînes
- **Stable** : la réponse ne changera pas avec le temps

#### 4.4 Format de sortie

Créez un fichier XML avec cette structure :

```xml
<evaluation>
  <qa_pair>
    <question>Trouvez les discussions sur des lancements de modèles d'IA portant des noms de code d'animaux. Un modèle nécessitait une désignation de sécurité au format ASL-X. Quel nombre X était en cours de détermination pour le modèle nommé d'après un félin sauvage tacheté ?</question>
    <answer>3</answer>
  </qa_pair>
<!-- Autres qa_pairs... -->
</evaluation>
```

---

# Fichiers de référence

## 📚 Bibliothèque de documentation

Chargez ces ressources au besoin pendant le développement :

### Documentation MCP de base (à charger en premier)
- **Protocole MCP** : commencez par le plan du site `https://modelcontextprotocol.io/sitemap.xml`, puis récupérez des pages précises avec le suffixe `.md`
- [📋 Bonnes pratiques MCP](./reference/mcp_best_practices.md) - Consignes MCP universelles, notamment :
  - Conventions de nommage des serveurs et des outils
  - Consignes de format des réponses (JSON vs Markdown)
  - Bonnes pratiques de pagination
  - Choix du transport (HTTP streamable vs stdio)
  - Standards de sécurité et de gestion des erreurs

### Documentation des SDK (à charger en phase 1/2)
- **SDK Python** : à récupérer depuis `https://raw.githubusercontent.com/modelcontextprotocol/python-sdk/main/README.md`
- **SDK TypeScript** : à récupérer depuis `https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/main/README.md`

### Guides d'implémentation par langage (à charger en phase 2)
- [🐍 Guide d'implémentation Python](./reference/python_mcp_server.md) - Guide complet Python/FastMCP avec :
  - Schémas d'initialisation du serveur
  - Exemples de modèles Pydantic
  - Enregistrement des outils avec `@mcp.tool`
  - Exemples complets fonctionnels
  - Liste de contrôle qualité

- [⚡ Guide d'implémentation TypeScript](./reference/node_mcp_server.md) - Guide complet TypeScript avec :
  - Structure du projet
  - Schémas Zod
  - Enregistrement des outils avec `server.registerTool`
  - Exemples complets fonctionnels
  - Liste de contrôle qualité

### Guide d'évaluation (à charger en phase 4)
- [✅ Guide d'évaluation](./reference/evaluation.md) - Guide complet de création d'évaluations avec :
  - Consignes de création des questions
  - Stratégies de vérification des réponses
  - Spécifications du format XML
  - Exemples de questions et réponses
  - Lancement d'une évaluation avec les scripts fournis
