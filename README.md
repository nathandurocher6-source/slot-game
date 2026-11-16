# Stake Engine 5x5 Slot Game - Universal Boilerplate

Boilerplate universel ("Greybox" sans thème) pour le développement de machines à sous **5x5 en cascade (Cluster & Tumble avec multiplicateurs de position)** sur l'écosystème officiel **Stake Engine**.

Ce dépôt combine :
- **`/math-sdk`** : Le moteur mathématique officiel Stake Engine en Python 3.12 avec son optimiseur haute performance en Rust (Cargo).
- **`/web-sdk`** : Le framework frontend officiel Stake Engine en TypeScript, propulsé par Turbo, Svelte 5 (Runes), PixiJS 8 et XState.

---

## 📋 Prérequis Système

| Outil | Version Minimale | Rôle |
|---|---|---|
| **Python** | `>= 3.12` | Moteur mathématique, simulation de probabilités et génération de books |
| **Rust & Cargo** | Stable (`>= 1.80`) | Programme d'optimisation mathématique (fences, scaling, recuit simulé) |
| **Node.js** | `>= 22.16.0` (testé avec v26) | Environnement d'exécution JavaScript / TypeScript pour le frontend |
| **pnpm** | `>= 10.5.0` (testé avec v12) | Gestionnaire de paquets monorepo pour `/web-sdk` |

---

## 🚀 Initialisation Rapide du Projet

### 1. Cloner le Projet
```bash
git clone https://github.com/nathandurocher6-source/slot-game.git
cd slot-game
```

### 2. Initialiser le Math SDK (Python 3.12 + Rust)

```bash
cd math-sdk

# 1. Créer un environnement virtuel Python 3.12
python3.12 -m venv env

# 2. Activer l'environnement virtuel
source env/bin/activate

# 3. Installer les dépendances et le package stakeengine en mode éditable
pip install --upgrade pip
pip install -r requirements.txt
pip install -e .

# 4. S'assurer que Cargo est disponible dans votre terminal
cargo --version
```

### 3. Initialiser le Web SDK (TypeScript, Svelte 5, PixiJS 8)

```bash
cd ../web-sdk

# 1. Installer toutes les dépendances du monorepo
pnpm install

# 2. Compiler tous les packages partagés et l'application skeleton-5x5
pnpm turbo run build --filter=skeleton-5x5...
```

---

## 🕹️ Utilisation & Développement

### Lancer la Simulation Mathématique (5x5 Skeleton)

Pour simuler des rounds, calculer le RTP, générer les fichiers `books` JSONL/zstd, les tables LUTs et exécuter les vérifications de conformité Stake Engine :

```bash
cd math-sdk
source env/bin/activate
python games/0_0_skeleton_5x5/run.py
```

> **Résultats générés :**
> - Fichiers de livres d'événements : `math-sdk/games/0_0_skeleton_5x5/library/books/`
> - Tables de lookup (LUT) : `math-sdk/games/0_0_skeleton_5x5/library/luts/`
> - Fichiers de vérification RGS : `math-sdk/games/0_0_skeleton_5x5/library/configs/`

### Lancer le Serveur Frontend (Skeleton 5x5)

Pour lancer le serveur de développement local avec rechargement à chaud :

```bash
cd web-sdk
pnpm --filter skeleton-5x5 dev
```
L'application est accessible sur : `http://localhost:3005`

### Lancer le Storybook

Pour prototyper ou inspecter les composants PixiJS & Svelte en isolation :

```bash
cd web-sdk
pnpm --filter skeleton-5x5 storybook
```
Le Storybook est accessible sur : `http://localhost:6005`

---

## 📐 Spécifications du Squelette 5x5 (`0_0_skeleton_5x5`)

- **Dimensions de grille** : 5 rouleaux x 5 rangées (25 symboles par tableau).
- **Mécanique** : Cascades / Tumbles après chaque cluster gagnant.
- **Système de gain** : Clusters de 5 symboles ou plus connectés orthogonalement.
- **Multiplicateurs de position** : Chaque gain sur une cellule incrémente son multiplicateur pour les cascades suivantes.
- **Symboles** : 4 High Pays (`H1`-`H4`), 4 Low Pays (`L1`-`L4`), Wild (`W`), Scatter (`S`).
- **Free Spins** : 3 Scatters = 10 FS, 4 Scatters = 12 FS, 5 Scatters = 15 FS avec multiplicateurs persistants.
- **Modes de mise supportés** :
  - `base` (1.0x, 96.70% RTP, Wincap 5000x)
  - `bonus` / Bonus Buy (200x, 96.70% RTP, Wincap 5000x)

Consultez [ARCHITECTURE.md](file:///Users/nathan/Documents/slot-game/ARCHITECTURE.md) pour le contrat complet d'interface et le format exact des événements JSON du Book.
