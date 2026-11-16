# Architecture & Interface Contract: Stake Engine 5x5 Skeleton

Ce document constitue la référence technique officielle définissant l'architecture globale et le contrat d'interface strict entre le moteur mathématique (**Math SDK**) et le client de rendu web (**Web SDK**) pour le boilerplate universel **5x5 Greybox** sur **Stake Engine**.

---

## 1. Vue d'Ensemble de l'Écosystème Stake Engine

L'écosystème Stake Engine sépare rigoureusement la logique probabiliste déterministe (Backend Math) de la présentation multimédia (Frontend Web) :

```mermaid
flowchart LR
    subgraph Math_SDK["Python Math SDK (/math-sdk)"]
        GC["GameConfig (5x5)"] --> GS["GameState (Cluster & Tumble)"]
        GS --> BM["BetModes & Distributions"]
        BM --> CB["create_books()"]
        CB --> Rust["Rust Optimizer (Cargo)"]
        Rust --> Artifacts["Books (.jsonl / .zst) & LUTs (.csv)"]
    end

    subgraph Web_SDK["Web SDK (/web-sdk)"]
        RGS["RGS Fetcher / Mock Book"] --> BEH["bookEventHandlerMap"]
        BEH --> XS["XState Machine"]
        XS --> SG["Svelte 5 Reactive State"]
        SG --> Pixi["PixiJS 8 Canvas (Board 5x5)"]
    end

    Artifacts -.->|"RGS Event Streaming"| RGS
```

1. **Math SDK (`/math-sdk`)** : Moteur Python (>= 3.12) et optimiseur Rust (Cargo) générant :
   - Les **Books** (fichiers JSONL compressés en Zstandard `.zst` ou bruts `.jsonl`) contenant l'intégralité des événements d'un round (chaque ligne = un tour complet).
   - Les **Lookup Tables (LUTs)** au format CSV pour l'échantillonnage instantané côté RGS (Remote Gaming Server).
   - Les sidecars de vérification cryptographique (SHA-256, hash de distribution et PAR sheets).
2. **Web SDK (`/web-sdk`)** : Monorepo TypeScript propulsé par **Turbo**, **Svelte 5** (Runes), **PixiJS 8** et **XState**. Il consomme le flux d'événements du Book pour orchestrer fidèlement les cascades, animations de clusters, multiplicateurs de grille et transitions de bonus.

---

## 2. Contrat d'Interface du Book (Book Event Contract)

Chaque partie de jeu correspond à un tableau ordonné d'événements JSON (`events: BookEvent[]`). Le frontend lit ce tableau séquentiellement via `bookEventHandlerMap`.

### 2.1 Événements du Cycle de Jeu

| Événement (`type`) | Description | Propriétés Clés |
|---|---|---|
| `reveal` | Affiche la grille initiale issue des bandes de rouleaux (avec padding haut/bas). | `board`, `paddingPositions`, `anticipation`, `gameType` |
| `winInfo` | Détaille les clusters gagnants et le calcul des gains. | `totalWin`, `wins: [{ symbol, win, positions, meta }]` |
| `updateGrid` | Met à jour la matrice 5x5 des multiplicateurs de position. | `gridMultipliers: number[][]` |
| `updateGlobalMult` | Met à jour le multiplicateur global du spin/cascade. | `globalMult: number` |
| `updateTumbleWin` | Met à jour le compteur de gain accumulé lors des tumbles successifs. | `amount: number` (en centimes) |
| `tumbleBoard` | Supprime les symboles gagnants et fait chuter les nouveaux symboles. | `explodingSymbols: Position[]`, `newSymbols: RawSymbol[][]` |
| `setTotalWin` | Actualise le gain cumulé total pour la mise courante. | `amount: number` (en centimes) |
| `freeSpinTrigger` | Déclenche l'entrée dans le jeu bonus suite aux Scatters. | `totalFs: number`, `positions: Position[]` |
| `updateFreeSpin` | Notifie le compteur de Free Spins du tour en cours. | `amount: number` (spin courant), `total: number` |
| `freeSpinRetrigger`| Rallonge le bonus lors de nouveaux Scatters durant le Free Game. | `totalFs: number`, `positions: Position[]` |
| `freeSpinEnd` | Clôture la séquence de Free Spins avec son palier de gain. | `amount: number`, `winLevel: number` |
| `wincap` | Indique l'atteinte du plafond maximum de gain (ex. 5000x). | `amount: number` |
| `setWin` | Déclenche le bandeau/popup de gain final avec son niveau d'animation. | `amount: number`, `winLevel: number` |
| `finalWin` | Clôture définitivement le tour et réinitialise les états visuels. | `amount: number` |

### 2.2 Schéma JSON Détaillé des Événements Clés

#### `reveal`
```json
{
  "index": 0,
  "type": "reveal",
  "board": [
    [{"name": "L1"}, {"name": "H1"}, {"name": "L2"}, {"name": "H3"}, {"name": "L4"}, {"name": "H2"}, {"name": "L1"}],
    [{"name": "L2"}, {"name": "H2"}, {"name": "W"}, {"name": "L3"}, {"name": "L1"}, {"name": "H4"}, {"name": "L2"}],
    [{"name": "H3"}, {"name": "L3"}, {"name": "S"}, {"name": "H1"}, {"name": "H2"}, {"name": "L3"}, {"name": "H3"}],
    [{"name": "L4"}, {"name": "H4"}, {"name": "L1"}, {"name": "L2"}, {"name": "W"}, {"name": "H1"}, {"name": "L4"}],
    [{"name": "H1"}, {"name": "L1"}, {"name": "H3"}, {"name": "S"}, {"name": "L2"}, {"name": "L4"}, {"name": "H1"}]
  ],
  "paddingPositions": [14, 28, 5, 19, 42],
  "gameType": "basegame",
  "anticipation": [0, 0, 1, 0, 1]
}
```
*Note : Chaque rouleau contient 7 symboles : index 0 = padding haut, index 1..5 = symboles visibles 5x5, index 6 = padding bas.*

#### `winInfo`
```json
{
  "index": 1,
  "type": "winInfo",
  "totalWin": 500,
  "wins": [
    {
      "symbol": "H1",
      "clusterSize": 5,
      "win": 500,
      "positions": [
        {"reel": 0, "row": 1},
        {"reel": 1, "row": 1},
        {"reel": 1, "row": 2},
        {"reel": 2, "row": 1},
        {"reel": 2, "row": 2}
      ],
      "meta": {
        "globalMult": 1,
        "clusterMult": 2,
        "winWithoutMult": 250,
        "overlay": {"reel": 1, "row": 1}
      }
    }
  ]
}
```

#### `updateGrid`
```json
{
  "index": 2,
  "type": "updateGrid",
  "gridMultipliers": [
    [1, 0, 0, 0, 0],
    [2, 2, 0, 0, 0],
    [1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0]
  ]
}
```

#### `tumbleBoard`
```json
{
  "index": 3,
  "type": "tumbleBoard",
  "explodingSymbols": [
    {"reel": 0, "row": 1},
    {"reel": 1, "row": 1},
    {"reel": 1, "row": 2},
    {"reel": 2, "row": 1},
    {"reel": 2, "row": 2}
  ],
  "newSymbols": [
    [{"name": "L3"}],
    [{"name": "H2"}, {"name": "L4"}],
    [{"name": "W"}, {"name": "L1"}],
    [],
    []
  ]
}
```

---

## 3. Configuration Mathématique (`0_0_skeleton_5x5`)

### 3.1 Dimensions, Symboles et Multiplicateurs
- **Grille** : 5 rouleaux x 5 rangées (`num_reels = 5`, `num_rows = [5, 5, 5, 5, 5]`).
- **Plafond de Gain (`wincap`)** : `100 000.0x` la mise de base.
- **RTP Cible** : `96.0%` (`0.96`).
- **Symboles Réguliers (Sans Thème)** :
  - **High Pays** : `H1`, `H2`, `H3`, `H4`
  - **Low Pays** : `L1`, `L2`, `L3`, `L4`, `L5`
- **Symboles Spéciaux** :
  - `W` (Wild) : Se substitue aux symboles payants dans les clusters (hors `S` et `M`).
  - `S` (Scatter) : Déclenche les Free Spins (3 Scatters = 10 FS, 4 = 12 FS, 5+ = 15 FS en base ; 3 = 5 FS, 4 = 8 FS, 5+ = 10 FS en retrigger).
  - `M` (Symbole Multiplicateur) : Atterrit avec des valeurs tirées parmi `[2, 3, 4, 5, 10, 15, 25, 50, 100, 250, 500, 1000]`.
- **Mécanique de Paiement & Cascades** :
  - Paiement par **Clusters** (groupes d'au moins 5 symboles identiques connectés horizontalement ou verticalement).
  - **Tumble / Cascade** : Les symboles gagnants explosent (`explode = True`), les symboles restants tombent par gravité, et de nouveaux symboles chutent depuis le haut de la grille. Les symboles spéciaux (`S` et `M`) ne payant pas en cluster ne sont pas détruits et tombent naturellement.
  - **Multiplicateurs en Base Game** : À la fin d'une séquence de cascades gagnantes, la somme de tous les multiplicateurs `M` présents sur la grille multiplie le gain total du tumble.
  - **Multiplicateur Global en Free Spins** : Multiplicateur cumulatif progressif démarrant à x1 qui **ne se réinitialise pas** entre les tours gratuits. Lorsqu'un tour est gagnant et contient un ou plusieurs symboles `M`, leur somme s'ajoute au multiplicateur global qui s'applique au gain du spin.
  - **Plafond Wincap Immédiat** : Dès que le gain cumulé du round atteint ou dépasse `100 000.0x`, le round s'arrête instantanément, émettant l'événement `wincap`.

### 3.2 Les 3 BetModes Standards
1. **Mode `base`** :
   - Coût : `1.0x`
   - RTP Cible : `96.0%`
   - Wincap : `100 000.0x`
   - Distributions : `0` (perte), `basegame` (gains standards), `freegame` (accès naturel bonus), `wincap` (plafond x100 000).
2. **Mode `bonus_booster` (Feature Spin)** :
   - Coût : `3.0x`
   - RTP Cible : `96.0%`
   - Wincap : `100 000.0x`
   - Mécanique : Probabilité fortement augmentée d'obtenir des Scatters `S` au spin initial.
3. **Mode `bonus_buy` (Achat Bonus Direct)** :
   - Coût : `100.0x` (`is_buybonus = True`)
   - RTP Cible : `96.0%`
   - Wincap : `100 000.0x`
   - Mécanique : Garantie d'apparition d'au moins 3 Scatters `S` dès le premier spin pour accéder directement au mode Free Spins.

---

## 4. Frontend Web (`skeleton-5x5`)

### 4.1 Pile Technologique
- **Svelte 5** : Réactivité granulaire via Runes (`$state`, `$derived`, `$props`).
- **PixiJS 8** : Moteur de rendu WebGL / WebGPU haute performance (60 FPS garanti).
- **Rendu Procédural "Greybox Studio Debug Pro"** : Rendu vectoriel natif PixiJS (`Container`, `Rectangle`, `Text`) évitant toute dépendance à des assets Spine ou sprites externes manquants, facilitant le prototypage et le skinning futur.
- **XState** : Gestion de machine à états pour le cycle de vie du spin, les interruptions et le jeu auto.
- **Turbo** : Orchestrateur de build monorepo garantissant la compilation ordonnée des packages partagés.

### 4.2 Organisation du Code Frontend
```
web-sdk/apps/skeleton-5x5/
├── src/
│   ├── components/
│   │   ├── Board.svelte             # Conteneur des rouleaux 5x5
│   │   ├── BoardFrame.svelte        # Cadre visuel 5x5 Greybox Studio
│   │   ├── Symbol.svelte            # Pont vers le composant de symbole
│   │   ├── SymbolGreybox.svelte     # Rendu procédural des tuiles L1..L5, H1..H4, W, S, M
│   │   ├── GlobalMultiplier.svelte  # Gauge HUD du Multiplicateur Global (Free Spins & Tumbles)
│   │   ├── FreeSpinCounter.svelte   # Compteur de Free Spins responsive (Desktop & Mobile)
│   │   ├── WinCelebration.svelte    # Overlay de célébration par paliers (Big, Mega, Epic, Sensational, Max Win)
│   │   ├── Win.svelte               # Adaptateur d'événement pour WinCelebration
│   │   ├── FreeSpinIntro.svelte     # Modal d'entrée Free Spins procédural
│   │   ├── FreeSpinOutro.svelte     # Modal de récapitulatif Free Spins procédural
│   │   ├── LoadingScreen.svelte     # Écran de chargement Greybox Studio avec barre de progression
│   │   ├── PressToContinue.svelte   # Invite interactive "Click / Space to continue"
│   │   ├── TumbleBoard.svelte       # Animation de cascade et chute des nouveaux symboles
│   │   └── ClusterWinAmount.svelte  # Affichage dynamique des montants de gains par cluster
│   ├── game/
│   │   ├── bookEventHandlerMap.ts   # Routeur séquentiel des événements du Book (wincap inclus)
│   │   ├── config.ts                # Configuration alignée sur le GameConfig Python (RTP 96%, 3 BetModes, wincap 100k)
│   │   ├── context.ts               # Initialisation des BetModes (base, booster, buy) et contextes partagés
│   │   ├── constants.ts             # INITIAL_BOARD (5x5), SYMBOL_SIZE, timings
│   │   ├── stateGame.svelte.ts      # État réactif Svelte 5 du plateau
│   │   └── typesBookEvent.ts        # Définitions TypeScript strictes des événements
│   └── stories/
│       ├── Skeleton5x5Scenarios.stories.svelte # Replay de scénarios (perte, cascades, FS, célébrations)
│       ├── Celebrations.stories.svelte         # Test unitaire de chaque palier de célébration
│       └── ComponentsSymbol.stories.svelte     # Galerie de tous les symboles et états
```

### 4.3 Paliers de Célébration (Win Tiers)
Le composant `WinCelebration.svelte` calcule dynamiquement le ratio `Gain / Mise` :
- `< 15x` : Gain standard (animation de cluster sans popup intrusive).
- `15x - 29x` : **BIG WIN** (Ambre néon, durée 2.4s).
- `30x - 59x` : **MEGA WIN** (Bleu électrique / Cyan, durée 2.8s).
- `60x - 99x` : **EPIC WIN** (Rouge rubis / Braise, durée 3.2s).
- `100x - 99 999x` : **SENSATIONAL WIN** (Violet néon / Or, durée 3.8s).
- `100 000x` ou événement `wincap` : **MAX WIN** (Écran exclusif or/cyan avec bannière *"PLAFOND ATTEINT : x100 000"*).
- **Interaction Skip** : Un clic n'importe où ou la touche **Espace / Entrée** passe immédiatement le compteur à sa valeur finale ; une deuxième pression ferme l'overlay.

---

## 5. Guide des Commandes Terminal

### 5.1 Math SDK (Python & Rust)
Depuis le dossier `/math-sdk` (avec l'environnement activé) :

```bash
# Activation de l'environnement virtuel Python 3.12
source env/bin/activate

# Lancer la génération des books, configs et l'optimiseur Rust pour 0_0_skeleton_5x5
python games/0_0_skeleton_5x5/run.py

# Exécuter les tests unitaires et de conformité Stake Engine
pytest tests/
```

### 5.2 Web SDK (Svelte 5, PixiJS 8 & Storybook)
Depuis le dossier `/web-sdk` :

```bash
# Compilation de tous les packages partagés et de l'app skeleton-5x5
pnpm turbo run build --filter=skeleton-5x5...

# Lancer le serveur de développement local (Port 3005)
pnpm --filter skeleton-5x5 dev

# Lancer le Storybook pour tester et prototyper les composants visuels (Port 6005)
pnpm --filter skeleton-5x5 storybook
```
