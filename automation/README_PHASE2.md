# 🤖 VC Deal Screener - Phase 2: Collecte Automatique de Données

**Système complet d'automatisation avec Machine Learning pour collecter et enrichir automatiquement les données des startups marocaines.**

---

## 📋 Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Utilisation](#utilisation)
6. [Sources de Données](#sources-de-données)
7. [Machine Learning](#machine-learning)
8. [API REST](#api-rest)
9. [Déploiement](#déploiement)
10. [Monitoring](#monitoring)
11. [Coûts](#coûts)

---

## 🎯 Vue d'Ensemble

### Objectif
Collecter **automatiquement** les données de 500+ startups marocaines depuis multiples sources, nettoyer, enrichir avec ML, et stocker dans PostgreSQL.

### Fonctionnalités

✅ **Collecte Multi-Sources**
- Crunchbase API (données officielles)
- Web Scraping intelligent (sites marocains)
- Google Search API (découverte)
- Sources locales (incubateurs, médias)
- LinkedIn (optionnel via Bright Data)

✅ **Machine Learning**
- Classification sectorielle automatique
- Scoring prédictif (0-100)
- Extraction d'entités (founders, tech stack)
- Analyse de sentiment des news

✅ **Automatisation**
- Collecte hebdomadaire complète
- Mise à jour quotidienne
- Actualisation toutes les 6h
- Déduplication intelligente

✅ **Qualité des Données**
- Nettoyage automatique
- Validation
- Détection de doublons (85% similarité)
- Score de qualité par startup

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
│  Fichier: vc-deal-scr-FIXED.jsx                            │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTP/REST
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                  API REST (FastAPI)                          │
│  GET /startups, /startups/{id}, /stats                      │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│              BASE DE DONNÉES (PostgreSQL)                    │
│  Tables: startups, metrics, news, funding_rounds            │
└──────────────────▲──────────────────────────────────────────┘
                   │
                   │ Écrit les données
                   │
┌─────────────────────────────────────────────────────────────┐
│            SCHEDULER (APScheduler)                           │
│  - Collecte hebdomadaire: Dimanche 3h                       │
│  - Mise à jour quotidienne: 2h                              │
│  - Actualisation rapide: Toutes les 6h                      │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│         DATA COLLECTION ORCHESTRATOR                         │
│  Coordonne tous les collecteurs + ML Pipeline               │
└──────┬────────┬────────┬────────┬─────────────────────────┘
       │        │        │        │
       ▼        ▼        ▼        ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│Crunchbase│ │  Google  │ │   Web    │ │  Local   │
│   API    │ │ Search   │ │ Scraper  │ │ Sources  │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │   ML PIPELINE       │
         │ - Classification    │
         │ - Scoring           │
         │ - NER               │
         └─────────────────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │   DATA CLEANER      │
         │ - Normalisation     │
         │ - Déduplication     │
         │ - Validation        │
         └─────────────────────┘
```

---

## 🚀 Installation

### Prérequis

- Python 3.9+
- PostgreSQL 14+
- Redis (optionnel, pour cache)
- Docker & Docker Compose (recommandé)

### Méthode 1: Docker (Recommandé)

```bash
# 1. Cloner le projet
git clone <your-repo>
cd automation

# 2. Copier et configurer .env
cp .env.example .env
# Éditer .env avec vos API keys

# 3. Lancer avec Docker Compose
docker-compose up -d

# 4. Vérifier les logs
docker-compose logs -f collector
```

**C'est tout !** Le système tourne maintenant automatiquement.

### Méthode 2: Installation Manuelle

```bash
# 1. Créer environnement virtuel
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# 2. Installer dépendances
pip install -r requirements.txt

# 3. Télécharger modèle NLP français
python -m spacy download fr_core_news_md

# 4. Configurer PostgreSQL
createdb vc_deal_screener

# 5. Configurer .env
cp .env.example .env
# Éditer avec vos credentials

# 6. Tester la connexion DB
python database/db_manager.py

# 7. Lancer le collecteur
python main_orchestrator.py

# 8. Lancer le scheduler (optionnel)
python scheduler/auto_collector.py
```

---

## ⚙️ Configuration

### Fichier .env

**Minimum requis:**

```bash
# Database
DB_HOST=localhost
DB_NAME=vc_deal_screener
DB_USER=postgres
DB_PASSWORD=your_password

# Au moins UNE API key
CRUNCHBASE_API_KEY=your_key  # Recommandé
# OU
SERPER_API_KEY=your_key  # Alternative
```

**Configuration complète:**

Voir `.env.example` pour toutes les options.

### API Keys - Où les obtenir?

| Service | Prix | Signup | Nécessaire? |
|---------|------|--------|-------------|
| **Crunchbase** | $300/mois | [data.crunchbase.com](https://data.crunchbase.com) | ⭐ Fortement recommandé |
| **Serper** | $50/mois | [serper.dev](https://serper.dev) | ✅ Recommandé |
| **Bright Data** | $50/mois | [brightdata.com](https://brightdata.com) | Optionnel |

**Budget minimal:** $300-350/mois pour fonctionnement optimal.

**Alternative low-cost:** Utiliser uniquement web scraping (gratuit mais moins fiable).

---

## 📖 Utilisation

### Collecte Manuelle (Test)

```bash
# Collecte complète immédiate
python main_orchestrator.py

# Avec un seul collecteur (debug)
python collectors/crunchbase_collector.py
python collectors/google_search_collector.py
python collectors/web_scraper.py
```

### Scheduler Automatique

```bash
# Démarrer le scheduler
python scheduler/auto_collector.py

# Avec collecte immédiate au démarrage
python scheduler/auto_collector.py --run-now
```

**Planning par défaut:**
- ✅ **Dimanche 3h**: Collecte complète (toutes sources)
- ✅ **Tous les jours 2h**: Mise à jour incrémentale
- ✅ **Toutes les 6h**: Actualisation rapide (news)
- ✅ **Samedi 1h**: Nettoyage base de données

### Vérifier les Données

```bash
# Se connecter à PostgreSQL
psql -U postgres -d vc_deal_screener

# Compter les startups
SELECT COUNT(*) FROM startups;

# Voir les dernières ajoutées
SELECT name, sector, score, created_at 
FROM startups 
ORDER BY created_at DESC 
LIMIT 10;

# Statistiques par secteur
SELECT sector, COUNT(*), AVG(score) 
FROM startups 
GROUP BY sector;
```

---

## 📊 Sources de Données

### 1. Crunchbase API ⭐

**Meilleure source** - Données officielles vérifiées.

```python
# Collecte automatique
from collectors.crunchbase_collector import CrunchbaseCollector

collector = CrunchbaseCollector()
startups = await collector.collect()
```

**Données récupérées:**
- Nom, description
- Funding (montant, rounds)
- Équipe (nombre employés)
- Secteur d'activité
- Localisation
- Contact (email, LinkedIn)

### 2. Web Scraper Intelligent

**Sources marocaines:**
- Annuaires de startups
- Médias tech (Médias24, L'Économiste)
- Blogs startup

```python
from collectors.web_scraper import IntelligentWebScraper

scraper = IntelligentWebScraper()
startups = await scraper.collect()
```

### 3. Google Search (Serper)

**Découverte de nouvelles startups** via recherche ciblée.

```python
from collectors.google_search_collector import GoogleSearchCollector

collector = GoogleSearchCollector()
leads = await collector.collect()
```

### 4. Sources Locales

**Données vérifiées:**
- Portfolios incubateurs (DARE Inc, etc.)
- Lauréats compétitions
- Base gouvernementale

```python
from collectors.local_sources_collector import LocalSourcesCollector

collector = LocalSourcesCollector()
startups = await collector.collect()
```

---

## 🧠 Machine Learning

### Classification Sectorielle

**Automatique** - Classifie chaque startup dans un des 16 secteurs.

```python
from ml.classification_pipeline import MLClassificationPipeline

pipeline = MLClassificationPipeline()
await pipeline.load_models()

sector = await pipeline.classify_sector(
    "Plateforme de paiement mobile",
    "PayTech"
)
# Résultat: 'fintech'
```

**Algorithme:**
- Analyse des keywords (primary/secondary)
- Pondération par importance
- Fallback: classification ML (BERT fine-tuned)

### Scoring Prédictif

**Score 0-100** basé sur 8 critères pondérés.

```python
from ml.scoring_engine import MLScoringEngine

engine = MLScoringEngine()
score = await engine.predict_score(startup_data)

# Explication du score
explanation = engine.explain_score(startup_data)
```

**Critères de scoring:**
- Funding amount (25%)
- Traction financière (30%)
- Taille équipe (15%)
- Hotness secteur (15%)
- Mentions médias (10%)
- Partenariats (10%)
- Support gouvernemental (5%)

### Extraction d'Entités (NER)

**Extrait automatiquement:**
- Noms des fondateurs
- Technologies utilisées
- Partenaires
- Montants de financement

```python
entities = await pipeline.extract_entities(description)
# {
#   'founders': ['Ahmed Alami', 'Sara Bennani'],
#   'technologies': ['python', 'react', 'aws'],
#   'partnerships': ['Bank X'],
#   'funding_info': {'amount': '1.5M MAD', 'round': 'seed'}
# }
```

### Analyse de Sentiment

**Sur les actualités** - Score -1 (négatif) à +1 (positif).

```python
sentiment = await pipeline.analyze_sentiment([
    "La startup connaît une croissance exceptionnelle",
    "Levée de fonds record"
])
# Résultat: 0.85 (très positif)
```

---

## 🔌 API REST

### Lancer l'API

```bash
# Développement
uvicorn api.main:app --reload --port 8000

# Production (Docker)
docker-compose up api
```

### Endpoints

**GET /startups**
```bash
curl http://localhost:8000/startups?sector=fintech&min_score=70
```

**GET /startups/{id}**
```bash
curl http://localhost:8000/startups/1
```

**GET /stats**
```bash
curl http://localhost:8000/stats
```

**POST /collect** (Trigger manuel)
```bash
curl -X POST http://localhost:8000/collect
```

### Connecter au Frontend

```javascript
// Dans votre React app
const fetchStartups = async () => {
  const response = await fetch('http://localhost:8000/startups');
  const data = await response.json();
  return data;
};
```

---

## 🚢 Déploiement

### Option 1: Railway (Recommandé)

```bash
# 1. Créer compte Railway
# 2. Installer CLI
npm i -g @railway/cli

# 3. Login
railway login

# 4. Initialiser projet
railway init

# 5. Ajouter PostgreSQL
railway add postgresql

# 6. Déployer
railway up

# 7. Variables d'environnement
railway variables set CRUNCHBASE_API_KEY=your_key
```

**Coût:** ~$20-30/mois

### Option 2: Heroku

```bash
# 1. Créer app
heroku create vc-screener-collector

# 2. Ajouter PostgreSQL
heroku addons:create heroku-postgresql:mini

# 3. Configurer variables
heroku config:set CRUNCHBASE_API_KEY=your_key

# 4. Déployer
git push heroku main

# 5. Scaler worker
heroku ps:scale worker=1
```

### Option 3: VPS (Digital Ocean / AWS)

```bash
# 1. Créer Droplet Ubuntu 22.04
# 2. SSH et installer Docker
apt update && apt install docker.io docker-compose

# 3. Cloner projet
git clone <repo>
cd automation

# 4. Configurer .env
nano .env

# 5. Lancer
docker-compose up -d

# 6. Nginx reverse proxy (optionnel)
```

---

## 📈 Monitoring

### Logs

```bash
# Docker
docker-compose logs -f collector

# Fichiers logs
tail -f logs/collector_*.log
```

### Métriques PostgreSQL

```sql
-- Performances
SELECT 
    schemaname,
    tablename,
    n_live_tup as rows,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Collectes récentes
SELECT 
    collector_name,
    status,
    startups_collected,
    completed_at
FROM collection_logs
ORDER BY completed_at DESC
LIMIT 10;
```

### Alertes (Optionnel)

```python
# Intégration Sentry pour error tracking
import sentry_sdk

sentry_sdk.init(
    dsn=os.getenv('SENTRY_DSN'),
    environment=os.getenv('ENVIRONMENT')
)
```

---

## 💰 Coûts

### Setup Initial

| Item | Coût |
|------|------|
| Développement | Déjà fait ✅ |
| Serveur test | Gratuit (local) |
| **Total** | **0€** |

### Coûts Mensuels

**Configuration Optimale:**

| Service | Prix | Nécessaire? |
|---------|------|-------------|
| Crunchbase Pro API | $300/mois | ⭐ Oui |
| Serper (Google Search) | $50/mois | ✅ Recommandé |
| Bright Data (LinkedIn) | $50/mois | Optionnel |
| Railway/Heroku Hosting | $20-30/mois | ✅ Oui |
| **Total Optimal** | **$370-430/mois** | |

**Configuration Budget:**

| Service | Prix |
|---------|------|
| Web scraping only | Gratuit |
| VPS Digital Ocean | $12/mois |
| **Total Budget** | **$12/mois** |

**ROI Potentiel:**
- Vente base de données: $500-2000
- Abonnement Premium: $29/mois x 50 users = $1450/mois
- Lead generation: $75/lead x 20 = $1500/mois

---

## 🎯 Prochaines Étapes

### Semaine 1
- [x] Configuration environnement
- [ ] Test collecteurs individuellement
- [ ] Première collecte complète
- [ ] Validation données

### Semaine 2
- [ ] Tuning ML models
- [ ] Optimisation performance
- [ ] Mise en place monitoring

### Semaine 3-4
- [ ] Déploiement production
- [ ] Intégration frontend-backend
- [ ] Tests utilisateurs

---

## 📞 Support

**Documentation:**
- README.md (ce fichier)
- Code comments inline
- Docstrings Python

**Troubleshooting:**
- Vérifier les logs
- Tester chaque collecteur séparément
- Valider API keys dans .env

**Performance:**
- Si lent: Augmenter `MAX_CONCURRENT_REQUESTS`
- Si erreurs: Réduire concurrence, augmenter `REQUEST_TIMEOUT`

---

## 📄 Licence

MIT License - Utilisez librement

---

<div align="center">

**🇲🇦 Fait avec ❤️ pour l'écosystème startup marocain**

**Système prêt à collecter 500+ startups automatiquement ! 🚀**

</div>
