---
name: skill-creator
description: Crée de nouveaux skills, modifie et améliore des skills existants, et mesure leurs performances. À utiliser lorsque l'utilisateur veut créer un skill de zéro, modifier ou optimiser un skill existant, lancer des évaluations (evals) pour tester un skill, mesurer les performances d'un skill avec une analyse de variance, ou optimiser la description d'un skill pour qu'il se déclenche plus précisément.
---

# Créateur de skills

Un skill pour créer de nouveaux skills et les améliorer de manière itérative.

Dans les grandes lignes, la création d'un skill se déroule ainsi :

- Décider ce que le skill doit faire et, à peu près, comment il doit le faire
- Rédiger un brouillon du skill
- Créer quelques prompts de test et lancer dessus un Claude ayant accès au skill
- Aider l'utilisateur à évaluer les résultats, qualitativement et quantitativement
  - Pendant que les exécutions tournent en arrière-plan, rédigez quelques évaluations quantitatives s'il n'y en a pas (s'il y en a, vous pouvez les utiliser telles quelles ou les modifier si quelque chose doit changer). Expliquez-les ensuite à l'utilisateur (ou, si elles existaient déjà, expliquez celles qui existent)
  - Utilisez le script `eval-viewer/generate_review.py` pour montrer les résultats à l'utilisateur et lui permettre aussi de consulter les métriques quantitatives
- Réécrire le skill en fonction de l'évaluation des résultats par l'utilisateur (et des défauts flagrants qui ressortent des benchmarks quantitatifs)
- Recommencer jusqu'à satisfaction
- Élargir le jeu de tests et réessayer à plus grande échelle

Votre rôle en utilisant ce skill est de déterminer où en est l'utilisateur dans ce processus, puis d'intervenir pour l'aider à progresser à travers ces étapes. Par exemple, il dit peut-être « Je veux créer un skill pour X ». Vous pouvez l'aider à préciser ce qu'il veut dire, rédiger un brouillon, écrire les cas de test, déterminer comment il veut évaluer, lancer tous les prompts et recommencer.

À l'inverse, il a peut-être déjà un brouillon du skill. Dans ce cas, vous pouvez passer directement à la partie évaluation/itération de la boucle.

Bien sûr, restez toujours flexible : si l'utilisateur dit « Pas besoin de lancer plein d'évaluations, on y va au feeling », vous pouvez faire ça à la place.

Ensuite, une fois le skill terminé (mais là encore, l'ordre est flexible), vous pouvez aussi lancer l'optimiseur de description, pour lequel il existe un script dédié, afin d'optimiser le déclenchement du skill.

Ça vous va ? Parfait.

## Communiquer avec l'utilisateur

Le créateur de skills est susceptible d'être utilisé par des personnes très inégalement familières avec le jargon informatique. Au cas où vous ne l'auriez pas remarqué (et comment le pourriez-vous, c'est très récent), il y a une tendance actuelle où la puissance de Claude pousse des plombiers à ouvrir leur terminal, des parents et grands-parents à chercher sur Google « comment installer npm ». Cela dit, la majorité des utilisateurs sont probablement assez à l'aise avec l'informatique.

Soyez donc attentif aux indices du contexte pour savoir comment formuler vos messages ! Par défaut, pour vous donner une idée :

- « évaluation » et « benchmark » sont limites, mais acceptables
- pour « JSON » et « assertion », attendez des indices sérieux que l'utilisateur sait de quoi il s'agit avant de les utiliser sans les expliquer

Il est tout à fait acceptable d'expliquer brièvement un terme en cas de doute, et n'hésitez pas à en donner une courte définition si vous n'êtes pas sûr que l'utilisateur le comprendra.

---

## Créer un skill

### Cerner l'intention

Commencez par comprendre l'intention de l'utilisateur. La conversation en cours contient peut-être déjà un workflow que l'utilisateur veut capturer (par ex. il dit « transforme ça en skill »). Si c'est le cas, extrayez d'abord les réponses de l'historique de la conversation : les outils utilisés, la séquence des étapes, les corrections apportées par l'utilisateur, les formats d'entrée/sortie observés. L'utilisateur devra peut-être combler les lacunes et doit confirmer avant de passer à l'étape suivante.

1. Que doit permettre ce skill à Claude ?
2. Quand ce skill doit-il se déclencher ? (quelles formulations/contextes de l'utilisateur)
3. Quel est le format de sortie attendu ?
4. Faut-il mettre en place des cas de test pour vérifier que le skill fonctionne ? Les skills dont les sorties sont objectivement vérifiables (transformations de fichiers, extraction de données, génération de code, étapes de workflow fixes) gagnent à avoir des cas de test. Ceux dont les sorties sont subjectives (style d'écriture, art) n'en ont souvent pas besoin. Proposez le choix par défaut adapté au type de skill, mais laissez l'utilisateur décider.

### Entretien et recherche

Posez de manière proactive des questions sur les cas limites, les formats d'entrée/sortie, les fichiers d'exemple, les critères de réussite et les dépendances. Attendez d'avoir clarifié ces points avant d'écrire les prompts de test.

Vérifiez les MCP disponibles : s'ils sont utiles pour la recherche (consulter de la documentation, trouver des skills similaires, chercher des bonnes pratiques), faites la recherche en parallèle via des sous-agents si possible, sinon directement. Arrivez avec du contexte pour alléger la charge de l'utilisateur.

### Rédiger le SKILL.md

À partir de l'entretien avec l'utilisateur, remplissez ces éléments :

- **name** : identifiant du skill
- **description** : quand le déclencher et ce qu'il fait. C'est le principal mécanisme de déclenchement : incluez à la fois ce que fait le skill ET les contextes précis où l'utiliser. Toutes les informations « quand l'utiliser » vont ici, pas dans le corps. Remarque : actuellement, Claude a tendance à « sous-déclencher » les skills, c'est-à-dire à ne pas les utiliser alors qu'ils seraient utiles. Pour contrer cela, rendez les descriptions un peu « insistantes ». Par exemple, au lieu de « Comment construire un tableau de bord simple et rapide pour afficher des données internes d'Anthropic. », vous pourriez écrire « Comment construire un tableau de bord simple et rapide pour afficher des données internes d'Anthropic. Utilisez impérativement ce skill dès que l'utilisateur mentionne des tableaux de bord, de la visualisation de données, des métriques internes, ou veut afficher n'importe quel type de données de l'entreprise, même s'il ne demande pas explicitement un "tableau de bord". »
- **compatibility** : outils requis, dépendances (facultatif, rarement nécessaire)
- **le reste du skill :)**

### Guide de rédaction des skills

#### Anatomie d'un skill

```
skill-name/
├── SKILL.md (obligatoire)
│   ├── Frontmatter YAML (name, description obligatoires)
│   └── Instructions en Markdown
└── Ressources fournies (facultatif)
    ├── scripts/    - Code exécutable pour les tâches déterministes/répétitives
    ├── references/ - Documentation chargée dans le contexte au besoin
    └── assets/     - Fichiers utilisés dans la sortie (modèles, icônes, polices)
```

#### Divulgation progressive

Les skills utilisent un système de chargement à trois niveaux :
1. **Métadonnées** (name + description) - Toujours dans le contexte (~100 mots)
2. **Corps du SKILL.md** - Dans le contexte dès que le skill se déclenche (idéalement < 500 lignes)
3. **Ressources fournies** - Au besoin (illimité, les scripts peuvent s'exécuter sans être chargés)

Ces nombres de mots sont approximatifs ; n'hésitez pas à aller plus loin si nécessaire.

**Schémas clés :**
- Gardez le SKILL.md sous les 500 lignes ; si vous approchez de cette limite, ajoutez un niveau de hiérarchie supplémentaire avec des indications claires sur l'endroit où le modèle utilisant le skill doit aller ensuite.
- Référencez clairement les fichiers depuis le SKILL.md en indiquant quand les lire
- Pour les gros fichiers de référence (> 300 lignes), incluez une table des matières

**Organisation par domaine** : lorsqu'un skill prend en charge plusieurs domaines/frameworks, organisez par variante :
```
cloud-deploy/
├── SKILL.md (workflow + sélection)
└── references/
    ├── aws.md
    ├── gcp.md
    └── azure.md
```
Claude ne lit que le fichier de référence pertinent.

#### Principe d'absence de surprise

Cela va sans dire, mais les skills ne doivent contenir ni malware, ni code d'exploitation, ni aucun contenu pouvant compromettre la sécurité du système. Le contenu d'un skill ne doit pas surprendre l'utilisateur quant à son intention s'il était décrit. N'acceptez pas les demandes de création de skills trompeurs ou conçus pour faciliter un accès non autorisé, l'exfiltration de données ou d'autres activités malveillantes. En revanche, des choses comme « joue le rôle d'un XYZ » sont acceptables.

#### Schémas de rédaction

Privilégiez l'impératif dans les instructions.

**Définir les formats de sortie** - Vous pouvez procéder ainsi :
```markdown
## Structure du rapport
Utilisez TOUJOURS exactement ce modèle :
# [Titre]
## Synthèse
## Principaux constats
## Recommandations
```

**Schéma d'exemples** - Il est utile d'inclure des exemples. Vous pouvez les formater ainsi (mais si « Entrée » et « Sortie » figurent dans les exemples, vous voudrez peut-être vous en écarter un peu) :
```markdown
## Format des messages de commit
**Exemple 1 :**
Entrée : Ajout de l'authentification utilisateur avec des jetons JWT
Sortie : feat(auth): implement JWT-based authentication
```

### Style d'écriture

Essayez d'expliquer au modèle pourquoi les choses sont importantes plutôt que d'aligner des « DOIT » lourds et poussiéreux. Utilisez la théorie de l'esprit et essayez de rendre le skill général plutôt que limité à des exemples précis. Commencez par écrire un brouillon, puis relisez-le avec un regard neuf et améliorez-le.

### Cas de test

Après avoir rédigé le brouillon du skill, proposez 2 ou 3 prompts de test réalistes, du genre de ce qu'un vrai utilisateur dirait. Partagez-les avec l'utilisateur : [pas besoin d'utiliser exactement ces mots] « Voici quelques cas de test que j'aimerais essayer. Vous semblent-ils pertinents, ou voulez-vous en ajouter ? » Puis lancez-les.

Enregistrez les cas de test dans `evals/evals.json`. N'écrivez pas encore d'assertions, seulement les prompts. Vous rédigerez les assertions à l'étape suivante, pendant que les exécutions tournent.

```json
{
  "skill_name": "example-skill",
  "evals": [
    {
      "id": 1,
      "prompt": "User's task prompt",
      "expected_output": "Description of expected result",
      "files": []
    }
  ]
}
```

Consultez `references/schemas.md` pour le schéma complet (y compris le champ `assertions`, que vous ajouterez plus tard).

## Exécuter et évaluer les cas de test

Cette section est une séquence continue : ne vous arrêtez pas en cours de route. N'utilisez PAS `/skill-test` ni aucun autre skill de test.

Placez les résultats dans `<skill-name>-workspace/`, à côté du répertoire du skill. Dans cet espace de travail, organisez les résultats par itération (`iteration-1/`, `iteration-2/`, etc.) et, à l'intérieur, chaque cas de test a son répertoire (`eval-0/`, `eval-1/`, etc.). Ne créez pas tout cela à l'avance : créez les répertoires au fur et à mesure.

### Étape 1 : lancer toutes les exécutions (avec skill ET référence) dans le même tour

Pour chaque cas de test, lancez deux sous-agents dans le même tour : l'un avec le skill, l'autre sans. C'est important : ne lancez pas d'abord les exécutions avec skill pour revenir plus tard aux références. Lancez tout en même temps pour que tout se termine à peu près au même moment.

**Exécution avec skill :**

```
Execute this task:
- Skill path: <path-to-skill>
- Task: <eval prompt>
- Input files: <eval files if any, or "none">
- Save outputs to: <workspace>/iteration-<N>/eval-<ID>/with_skill/outputs/
- Outputs to save: <what the user cares about — e.g., "the .docx file", "the final CSV">
```

**Exécution de référence** (même prompt, mais la référence dépend du contexte) :
- **Création d'un nouveau skill** : aucun skill. Même prompt, sans chemin de skill, enregistrement dans `without_skill/outputs/`.
- **Amélioration d'un skill existant** : l'ancienne version. Avant de modifier, faites un instantané du skill (`cp -r <skill-path> <workspace>/skill-snapshot/`), puis faites pointer le sous-agent de référence vers cet instantané. Enregistrement dans `old_skill/outputs/`.

Écrivez un `eval_metadata.json` pour chaque cas de test (les assertions peuvent être vides pour l'instant). Donnez à chaque évaluation un nom descriptif fondé sur ce qu'elle teste, pas simplement « eval-0 ». Utilisez aussi ce nom pour le répertoire. Si cette itération utilise des prompts d'évaluation nouveaux ou modifiés, créez ces fichiers pour chaque nouveau répertoire d'évaluation : ne supposez pas qu'ils sont repris des itérations précédentes.

```json
{
  "eval_id": 0,
  "eval_name": "descriptive-name-here",
  "prompt": "The user's task prompt",
  "assertions": []
}
```

### Étape 2 : pendant les exécutions, rédiger les assertions

N'attendez pas simplement la fin des exécutions : vous pouvez utiliser ce temps de manière productive. Rédigez des assertions quantitatives pour chaque cas de test et expliquez-les à l'utilisateur. Si des assertions existent déjà dans `evals/evals.json`, relisez-les et expliquez ce qu'elles vérifient.

De bonnes assertions sont objectivement vérifiables et ont des noms descriptifs : elles doivent se lire clairement dans le visualiseur de benchmark, de sorte que quiconque jette un œil aux résultats comprenne immédiatement ce que chacune vérifie. Les skills subjectifs (style d'écriture, qualité du design) s'évaluent mieux qualitativement : ne forcez pas des assertions sur ce qui relève du jugement humain.

Mettez à jour les fichiers `eval_metadata.json` et `evals/evals.json` avec les assertions une fois rédigées. Expliquez aussi à l'utilisateur ce qu'il verra dans le visualiseur : les sorties qualitatives et le benchmark quantitatif.

### Étape 3 : à la fin de chaque exécution, enregistrer les données de durée

Lorsque chaque tâche de sous-agent se termine, vous recevez une notification contenant `total_tokens` et `duration_ms`. Enregistrez immédiatement ces données dans `timing.json`, dans le répertoire de l'exécution :

```json
{
  "total_tokens": 84852,
  "duration_ms": 23332,
  "total_duration_seconds": 23.3
}
```

C'est la seule occasion de capturer ces données : elles arrivent par la notification de tâche et ne sont conservées nulle part ailleurs. Traitez chaque notification dès son arrivée plutôt que d'essayer de les regrouper.

### Étape 4 : noter, agréger et lancer le visualiseur

Une fois toutes les exécutions terminées :

1. **Notez chaque exécution** : lancez un sous-agent évaluateur (ou évaluez directement) qui lit `agents/grader.md` et évalue chaque assertion par rapport aux sorties. Enregistrez les résultats dans `grading.json` dans chaque répertoire d'exécution. Le tableau `expectations` de grading.json doit utiliser les champs `text`, `passed` et `evidence` (pas `name`/`met`/`details` ni d'autres variantes) : le visualiseur dépend exactement de ces noms de champs. Pour les assertions vérifiables par programme, écrivez et lancez un script plutôt que de vérifier à l'œil : les scripts sont plus rapides, plus fiables et réutilisables d'une itération à l'autre.

2. **Agrégez dans un benchmark** : lancez le script d'agrégation depuis le répertoire skill-creator :
   ```bash
   python -m scripts.aggregate_benchmark <workspace>/iteration-N --skill-name <name>
   ```
   Cela produit `benchmark.json` et `benchmark.md` avec le taux de réussite, la durée et les tokens pour chaque configuration, avec moyenne ± écart-type et l'écart entre configurations. Si vous générez benchmark.json manuellement, consultez `references/schemas.md` pour le schéma exact attendu par le visualiseur.
Placez chaque version with_skill avant sa référence correspondante.

3. **Faites une passe d'analyse** : lisez les données du benchmark et faites ressortir les tendances que les statistiques agrégées pourraient masquer. Consultez `agents/analyzer.md` (section « Analyzing Benchmark Results ») pour savoir quoi chercher : par exemple des assertions qui réussissent toujours, avec ou sans skill (non discriminantes), des évaluations à forte variance (peut-être instables) et les compromis durée/tokens.

4. **Lancez le visualiseur** avec à la fois les sorties qualitatives et les données quantitatives :
   ```bash
   nohup python <skill-creator-path>/eval-viewer/generate_review.py \
     <workspace>/iteration-N \
     --skill-name "my-skill" \
     --benchmark <workspace>/iteration-N/benchmark.json \
     > /dev/null 2>&1 &
   VIEWER_PID=$!
   ```
   À partir de l'itération 2, passez aussi `--previous-workspace <workspace>/iteration-<N-1>`.

   **Environnements Cowork / sans affichage :** si `webbrowser.open()` n'est pas disponible ou que l'environnement n'a pas d'affichage, utilisez `--static <output_path>` pour écrire un fichier HTML autonome au lieu de démarrer un serveur. Le feedback sera téléchargé sous forme de fichier `feedback.json` lorsque l'utilisateur cliquera sur « Submit All Reviews ». Après le téléchargement, copiez `feedback.json` dans l'espace de travail pour que l'itération suivante le récupère.

Remarque : utilisez generate_review.py pour créer le visualiseur ; inutile d'écrire du HTML personnalisé.

5. **Prévenez l'utilisateur**, par exemple : « J'ai ouvert les résultats dans votre navigateur. Il y a deux onglets : "Outputs" vous permet de parcourir chaque cas de test et de laisser un commentaire, "Benchmark" montre la comparaison quantitative. Quand vous avez terminé, revenez ici et dites-le-moi. »

### Ce que l'utilisateur voit dans le visualiseur

L'onglet « Outputs » affiche un cas de test à la fois :
- **Prompt** : la tâche qui a été donnée
- **Output** : les fichiers produits par le skill, rendus en ligne lorsque c'est possible
- **Previous Output** (itération 2+) : section repliée montrant la sortie de l'itération précédente
- **Formal Grades** (si la notation a été lancée) : section repliée montrant la réussite/l'échec des assertions
- **Feedback** : une zone de texte qui s'enregistre automatiquement pendant la saisie
- **Previous Feedback** (itération 2+) : ses commentaires de la fois précédente, affichés sous la zone de texte

L'onglet « Benchmark » affiche le résumé statistique : taux de réussite, durée et consommation de tokens pour chaque configuration, avec le détail par évaluation et les observations de l'analyse.

La navigation se fait avec les boutons précédent/suivant ou les flèches du clavier. Une fois terminé, l'utilisateur clique sur « Submit All Reviews », ce qui enregistre tout le feedback dans `feedback.json`.

### Étape 5 : lire le feedback

Lorsque l'utilisateur vous dit qu'il a terminé, lisez `feedback.json` :

```json
{
  "reviews": [
    {"run_id": "eval-0-with_skill", "feedback": "the chart is missing axis labels", "timestamp": "..."},
    {"run_id": "eval-1-with_skill", "feedback": "", "timestamp": "..."},
    {"run_id": "eval-2-with_skill", "feedback": "perfect, love this", "timestamp": "..."}
  ],
  "status": "complete"
}
```

Un feedback vide signifie que l'utilisateur a trouvé le résultat correct. Concentrez vos améliorations sur les cas de test où l'utilisateur a formulé des critiques précises.

Arrêtez le serveur du visualiseur quand vous n'en avez plus besoin :

```bash
kill $VIEWER_PID 2>/dev/null
```

---

## Améliorer le skill

C'est le cœur de la boucle. Vous avez lancé les cas de test, l'utilisateur a examiné les résultats, et vous devez maintenant améliorer le skill en fonction de son feedback.

### Comment penser les améliorations

1. **Généralisez à partir du feedback.** L'enjeu global, c'est que nous essayons de créer des skills qui pourront être utilisés un million de fois (peut-être littéralement, peut-être davantage, qui sait) sur de très nombreux prompts différents. Ici, vous et l'utilisateur itérez encore et encore sur seulement quelques exemples, parce que cela permet d'avancer plus vite. L'utilisateur connaît ces exemples par cœur et peut évaluer rapidement les nouvelles sorties. Mais si le skill que vous co-développez ne fonctionne que pour ces exemples, il est inutile. Plutôt que d'ajouter des modifications pointilleuses qui surajustent, ou des « DOIT » oppressants, si un problème persiste, essayez d'élargir le champ en utilisant d'autres métaphores ou en recommandant d'autres façons de travailler. C'est relativement peu coûteux à essayer, et vous tomberez peut-être sur quelque chose d'excellent.

2. **Gardez le prompt léger.** Supprimez ce qui n'apporte rien. Lisez bien les transcriptions, pas seulement les sorties finales : s'il semble que le skill fait perdre beaucoup de temps au modèle sur des choses improductives, essayez de retirer les parties du skill qui l'y poussent et voyez ce qui se passe.

3. **Expliquez le pourquoi.** Efforcez-vous d'expliquer le **pourquoi** de tout ce que vous demandez au modèle. Les LLM d'aujourd'hui sont *intelligents*. Ils ont une bonne théorie de l'esprit et, avec un bon cadre, peuvent aller au-delà des instructions mécaniques et vraiment faire avancer les choses. Même si le feedback de l'utilisateur est laconique ou agacé, essayez de vraiment comprendre la tâche, pourquoi l'utilisateur écrit ce qu'il écrit et ce qu'il a réellement écrit, puis transmettez cette compréhension dans les instructions. Si vous vous surprenez à écrire TOUJOURS ou JAMAIS en majuscules, ou à utiliser des structures très rigides, c'est un signal d'alerte : si possible, reformulez et expliquez le raisonnement pour que le modèle comprenne pourquoi ce que vous demandez est important. C'est une approche plus humaine, plus puissante et plus efficace.

4. **Repérez le travail répété d'un cas de test à l'autre.** Lisez les transcriptions des exécutions de test et remarquez si les sous-agents ont tous écrit indépendamment des scripts d'aide similaires ou suivi la même approche en plusieurs étapes. Si les 3 cas de test ont amené le sous-agent à écrire un `create_docx.py` ou un `build_chart.py`, c'est un signal fort que le skill devrait fournir ce script. Écrivez-le une fois, placez-le dans `scripts/` et dites au skill de l'utiliser. Cela évite à chaque future invocation de réinventer la roue.

Cette tâche est assez importante (nous essayons de créer des milliards de valeur économique par an ici !) et votre temps de réflexion n'est pas le facteur limitant ; prenez votre temps et réfléchissez vraiment. Je suggère de rédiger une révision, puis de la relire avec un regard neuf et de l'améliorer. Faites vraiment de votre mieux pour vous mettre à la place de l'utilisateur et comprendre ce qu'il veut et ce dont il a besoin.

### La boucle d'itération

Après avoir amélioré le skill :

1. Appliquez vos améliorations au skill
2. Relancez tous les cas de test dans un nouveau répertoire `iteration-<N+1>/`, y compris les exécutions de référence. Si vous créez un nouveau skill, la référence est toujours `without_skill` (sans skill), et cela reste identique d'une itération à l'autre. Si vous améliorez un skill existant, jugez de la référence la plus pertinente : la version d'origine apportée par l'utilisateur, ou l'itération précédente.
3. Lancez le visualiseur avec `--previous-workspace` pointant vers l'itération précédente
4. Attendez que l'utilisateur examine les résultats et vous dise qu'il a terminé
5. Lisez le nouveau feedback, améliorez encore, recommencez

Continuez jusqu'à ce que :
- L'utilisateur se dise satisfait
- Le feedback soit entièrement vide (tout semble correct)
- Vous ne fassiez plus de progrès significatifs

---

## Avancé : comparaison à l'aveugle

Lorsque vous voulez une comparaison plus rigoureuse entre deux versions d'un skill (par ex. l'utilisateur demande « la nouvelle version est-elle vraiment meilleure ? »), il existe un système de comparaison à l'aveugle. Lisez `agents/comparator.md` et `agents/analyzer.md` pour les détails. L'idée de base : donner deux sorties à un agent indépendant sans lui dire laquelle est laquelle, et le laisser juger la qualité. Puis analyser pourquoi la gagnante a gagné.

C'est facultatif, nécessite des sous-agents, et la plupart des utilisateurs n'en auront pas besoin. La boucle de revue humaine suffit généralement.

---

## Optimisation de la description

Le champ description du frontmatter du SKILL.md est le principal mécanisme qui détermine si Claude invoque un skill. Après avoir créé ou amélioré un skill, proposez d'optimiser la description pour un déclenchement plus précis.

### Étape 1 : générer des requêtes d'évaluation du déclenchement

Créez 20 requêtes d'évaluation, un mélange de requêtes qui doivent déclencher le skill et de requêtes qui ne doivent pas le déclencher. Enregistrez-les en JSON :

```json
[
  {"query": "the user prompt", "should_trigger": true},
  {"query": "another prompt", "should_trigger": false}
]
```

Les requêtes doivent être réalistes, du genre de ce qu'un utilisateur de Claude Code ou de Claude.ai taperait vraiment. Pas des demandes abstraites, mais des demandes concrètes, précises et suffisamment détaillées. Par exemple des chemins de fichiers, du contexte personnel sur le travail ou la situation de l'utilisateur, des noms et valeurs de colonnes, des noms d'entreprises, des URL. Un peu d'histoire de fond. Certaines peuvent être en minuscules ou contenir des abréviations, des fautes de frappe ou un langage familier. Variez les longueurs et concentrez-vous sur les cas limites plutôt que sur des cas évidents (l'utilisateur pourra les valider).

Mauvais : `"Formate ces données"`, `"Extrais le texte du PDF"`, `"Crée un graphique"`

Bon : `"ok donc mon chef vient de m'envoyer ce fichier xlsx (il est dans mes téléchargements, un truc comme 'ventes T4 final FINAL v2.xlsx') et elle veut que j'ajoute une colonne qui montre la marge bénéficiaire en pourcentage. Le chiffre d'affaires est dans la colonne C et les coûts dans la colonne D je crois"`

Pour les requêtes **qui doivent déclencher** (8 à 10), pensez à la couverture. Il vous faut différentes formulations de la même intention, certaines formelles, d'autres familières. Incluez des cas où l'utilisateur ne nomme pas explicitement le skill ou le type de fichier, mais en a clairement besoin. Ajoutez des cas d'usage peu courants et des cas où ce skill est en concurrence avec un autre mais devrait l'emporter.

Pour les requêtes **qui ne doivent pas déclencher** (8 à 10), les plus précieuses sont les quasi-correspondances : des requêtes qui partagent des mots-clés ou des concepts avec le skill mais qui demandent en réalité autre chose. Pensez aux domaines voisins, aux formulations ambiguës où une simple correspondance de mots-clés déclencherait à tort, et aux cas où la requête touche à quelque chose que fait le skill mais dans un contexte où un autre outil est plus approprié.

L'essentiel à éviter : ne rendez pas les requêtes négatives manifestement hors sujet. « Écris une fonction fibonacci » comme test négatif pour un skill PDF est trop facile : cela ne teste rien. Les cas négatifs doivent être réellement délicats.

### Étape 2 : revue avec l'utilisateur

Présentez le jeu d'évaluation à l'utilisateur pour qu'il le relise, à l'aide du modèle HTML :

1. Lisez le modèle `assets/eval_review.html`
2. Remplacez les marqueurs :
   - `__EVAL_DATA_PLACEHOLDER__` → le tableau JSON des éléments d'évaluation (sans guillemets autour : c'est une affectation de variable JS)
   - `__SKILL_NAME_PLACEHOLDER__` → le nom du skill
   - `__SKILL_DESCRIPTION_PLACEHOLDER__` → la description actuelle du skill
3. Écrivez dans un fichier temporaire (par ex. `/tmp/eval_review_<skill-name>.html`) et ouvrez-le : `open /tmp/eval_review_<skill-name>.html`
4. L'utilisateur peut modifier les requêtes, basculer should-trigger, ajouter/supprimer des entrées, puis cliquer sur « Export Eval Set »
5. Le fichier est téléchargé dans `~/Downloads/eval_set.json` ; vérifiez le dossier Téléchargements pour la version la plus récente au cas où il y en aurait plusieurs (par ex. `eval_set (1).json`)

Cette étape compte : de mauvaises requêtes d'évaluation mènent à de mauvaises descriptions.

### Étape 3 : lancer la boucle d'optimisation

Dites à l'utilisateur : « Cela va prendre un peu de temps. Je lance la boucle d'optimisation en arrière-plan et je vérifierai régulièrement où elle en est. »

Enregistrez le jeu d'évaluation dans l'espace de travail, puis lancez en arrière-plan :

```bash
python -m scripts.run_loop \
  --eval-set <path-to-trigger-eval.json> \
  --skill-path <path-to-skill> \
  --model <model-id-powering-this-session> \
  --max-iterations 5 \
  --verbose
```

Utilisez l'identifiant du modèle indiqué dans votre prompt système (celui qui fait tourner la session en cours) pour que le test de déclenchement corresponde à ce que l'utilisateur vit réellement.

Pendant l'exécution, consultez régulièrement la fin de la sortie pour informer l'utilisateur de l'itération en cours et des scores obtenus.

Cela gère automatiquement toute la boucle d'optimisation. Le script divise le jeu d'évaluation en 60 % d'entraînement et 40 % de test réservé, évalue la description actuelle (en lançant chaque requête 3 fois pour obtenir un taux de déclenchement fiable), puis appelle Claude pour proposer des améliorations à partir des échecs. Il réévalue chaque nouvelle description sur l'entraînement et le test, en itérant jusqu'à 5 fois. À la fin, il ouvre un rapport HTML dans le navigateur montrant les résultats par itération et renvoie un JSON avec `best_description`, sélectionnée selon le score de test plutôt que celui d'entraînement pour éviter le surajustement.

### Comment fonctionne le déclenchement des skills

Comprendre le mécanisme de déclenchement aide à concevoir de meilleures requêtes d'évaluation. Les skills apparaissent dans la liste `available_skills` de Claude avec leur nom et leur description, et Claude décide de consulter un skill en fonction de cette description. Il faut savoir que Claude ne consulte les skills que pour les tâches qu'il ne peut pas facilement accomplir seul : des requêtes simples en une étape comme « lis ce PDF » peuvent ne pas déclencher de skill même si la description correspond parfaitement, parce que Claude peut les traiter directement avec ses outils de base. Les requêtes complexes, en plusieurs étapes ou spécialisées déclenchent les skills de manière fiable lorsque la description correspond.

Vos requêtes d'évaluation doivent donc être assez substantielles pour que Claude ait réellement intérêt à consulter un skill. Les requêtes simples comme « lis le fichier X » sont de mauvais cas de test : elles ne déclencheront pas de skill, quelle que soit la qualité de la description.

### Étape 4 : appliquer le résultat

Prenez `best_description` dans la sortie JSON et mettez à jour le frontmatter du SKILL.md. Montrez l'avant/après à l'utilisateur et communiquez les scores.

---

### Empaqueter et présenter (uniquement si l'outil `present_files` est disponible)

Vérifiez si vous avez accès à l'outil `present_files`. Sinon, ignorez cette étape. Si oui, empaquetez le skill et présentez le fichier .skill à l'utilisateur :

```bash
python -m scripts.package_skill <path/to/skill-folder>
```

Après l'empaquetage, indiquez à l'utilisateur le chemin du fichier `.skill` obtenu pour qu'il puisse l'installer.

---

## Instructions propres à Claude.ai

Dans Claude.ai, le workflow de base est le même (brouillon → test → revue → amélioration → recommencer), mais comme Claude.ai n'a pas de sous-agents, certains mécanismes changent. Voici ce qu'il faut adapter :

**Exécution des cas de test** : sans sous-agents, pas d'exécution parallèle. Pour chaque cas de test, lisez le SKILL.md du skill, puis suivez ses instructions pour accomplir vous-même le prompt de test. Faites-les un par un. C'est moins rigoureux que des sous-agents indépendants (vous avez écrit le skill et vous l'exécutez aussi, donc vous avez tout le contexte), mais c'est une vérification utile, et l'étape de revue humaine compense. Ignorez les exécutions de référence : utilisez simplement le skill pour accomplir la tâche demandée.

**Revue des résultats** : si vous ne pouvez pas ouvrir de navigateur (par ex. la VM de Claude.ai n'a pas d'affichage, ou vous êtes sur un serveur distant), ignorez entièrement le visualiseur. Présentez plutôt les résultats directement dans la conversation. Pour chaque cas de test, montrez le prompt et la sortie. Si la sortie est un fichier que l'utilisateur doit voir (comme un .docx ou un .xlsx), enregistrez-le sur le système de fichiers et indiquez-lui où il se trouve pour qu'il puisse le télécharger et l'examiner. Demandez un retour directement : « Qu'en pensez-vous ? Quelque chose à changer ? »

**Benchmark** : ignorez le benchmark quantitatif : il repose sur des comparaisons avec une référence qui n'ont pas de sens sans sous-agents. Concentrez-vous sur le feedback qualitatif de l'utilisateur.

**La boucle d'itération** : identique : améliorez le skill, relancez les cas de test, demandez un retour, simplement sans le visualiseur au milieu. Vous pouvez toujours organiser les résultats en répertoires d'itération si vous avez un système de fichiers.

**Optimisation de la description** : cette section nécessite l'outil CLI `claude` (plus précisément `claude -p`), disponible uniquement dans Claude Code. Ignorez-la si vous êtes sur Claude.ai.

**Comparaison à l'aveugle** : nécessite des sous-agents. Ignorez-la.

**Empaquetage** : le script `package_skill.py` fonctionne partout où il y a Python et un système de fichiers. Sur Claude.ai, vous pouvez le lancer et l'utilisateur peut télécharger le fichier `.skill` obtenu.

**Mise à jour d'un skill existant** : l'utilisateur vous demande peut-être de mettre à jour un skill existant plutôt d'en créer un nouveau. Dans ce cas :
- **Conservez le nom d'origine.** Notez le nom du répertoire du skill et le champ `name` du frontmatter, et utilisez-les sans les modifier. Par ex., si le skill installé est `research-helper`, produisez `research-helper.skill` (et non `research-helper-v2`).
- **Copiez dans un emplacement accessible en écriture avant de modifier.** Le chemin du skill installé peut être en lecture seule. Copiez dans `/tmp/skill-name/`, modifiez là, et empaquetez depuis la copie.
- **Si vous empaquetez manuellement, préparez d'abord dans `/tmp/`**, puis copiez dans le répertoire de sortie : les écritures directes peuvent échouer pour des raisons de permissions.

---

## Instructions propres à Cowork

Si vous êtes dans Cowork, voici l'essentiel à savoir :

- Vous avez des sous-agents, donc le workflow principal (lancer les cas de test en parallèle, exécuter les références, noter, etc.) fonctionne. (Cependant, si vous rencontrez de gros problèmes de délais d'expiration, vous pouvez lancer les prompts de test en série plutôt qu'en parallèle.)
- Vous n'avez ni navigateur ni affichage : lors de la génération du visualiseur d'évaluation, utilisez `--static <output_path>` pour écrire un fichier HTML autonome au lieu de démarrer un serveur. Proposez ensuite un lien sur lequel l'utilisateur peut cliquer pour ouvrir le HTML dans son navigateur.
- Pour une raison quelconque, l'environnement Cowork semble dissuader Claude de générer le visualiseur d'évaluation après les tests, alors je le répète : que vous soyez dans Cowork ou dans Claude Code, après avoir lancé les tests, générez toujours le visualiseur d'évaluation pour que l'humain examine les exemples avant que vous ne révisiez vous-même le skill et tentiez des corrections, avec `generate_review.py` (et non en écrivant votre propre HTML sur mesure). Désolé d'avance, mais je passe en majuscules : GÉNÉREZ LE VISUALISEUR D'ÉVALUATION *AVANT* D'ÉVALUER VOUS-MÊME LES ENTRÉES. Il faut les mettre sous les yeux de l'humain le plus tôt possible !
- Le feedback fonctionne différemment : comme aucun serveur ne tourne, le bouton « Submit All Reviews » du visualiseur téléchargera `feedback.json` sous forme de fichier. Vous pourrez ensuite le lire depuis cet emplacement (vous devrez peut-être d'abord demander l'accès).
- L'empaquetage fonctionne : `package_skill.py` a seulement besoin de Python et d'un système de fichiers.
- L'optimisation de la description (`run_loop.py` / `run_eval.py`) devrait très bien fonctionner dans Cowork puisqu'elle utilise `claude -p` via un sous-processus, et non un navigateur, mais gardez-la pour la fin, une fois le skill complètement terminé et l'utilisateur d'accord sur sa qualité.
- **Mise à jour d'un skill existant** : l'utilisateur vous demande peut-être de mettre à jour un skill existant plutôt d'en créer un nouveau. Suivez les consignes de mise à jour de la section Claude.ai ci-dessus.

---

## Fichiers de référence

Le répertoire agents/ contient les instructions pour des sous-agents spécialisés. Lisez-les lorsque vous devez lancer le sous-agent correspondant.

- `agents/grader.md` — Comment évaluer les assertions par rapport aux sorties
- `agents/comparator.md` — Comment faire une comparaison A/B à l'aveugle entre deux sorties
- `agents/analyzer.md` — Comment analyser pourquoi une version l'a emporté sur une autre

Le répertoire references/ contient de la documentation supplémentaire :
- `references/schemas.md` — Structures JSON pour evals.json, grading.json, etc.

---

Je répète une dernière fois la boucle principale pour bien insister :

- Déterminer le sujet du skill
- Rédiger ou modifier le skill
- Lancer un Claude ayant accès au skill sur des prompts de test
- Avec l'utilisateur, évaluer les sorties :
  - Créer benchmark.json et lancer `eval-viewer/generate_review.py` pour aider l'utilisateur à les examiner
  - Lancer les évaluations quantitatives
- Recommencer jusqu'à ce que vous et l'utilisateur soyez satisfaits
- Empaqueter le skill final et le remettre à l'utilisateur.

Ajoutez ces étapes à votre TodoList si vous en avez une, pour être sûr de ne rien oublier. Si vous êtes dans Cowork, ajoutez spécifiquement « Créer le JSON des évaluations et lancer `eval-viewer/generate_review.py` pour que l'humain puisse examiner les cas de test » dans votre TodoList pour être sûr que ce soit fait.

Bonne chance !
