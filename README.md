# 🚀 VC Deal Screener - Écosystème Startups Marocaines

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/react-18.2.0-61dafb.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**Plateforme interactive de screening et d'analyse de startups marocaines avec scoring sectoriel intelligent.**

[🌐 Demo Live](#) · [📚 Documentation](./guide-deploiement-publication.md) · [🐛 Report Bug](#) · [✨ Request Feature](#)

---

## 📸 Aperçu

![VC Deal Screener Screenshot](screenshot.png)

---

## ✨ Fonctionnalités

### 🎯 Core Features
- ✅ **30 Startups Marocaines** pré-chargées dans 12 secteurs
- ✅ **Scoring Sectoriel Différencié** - Chaque secteur a ses propres critères
- ✅ **Filtres Dynamiques en Temps Réel** - Secteur, phase, localisation, score minimum
- ✅ **Vue Détaillée Interactive** - Profil complet, métriques, contacts
- ✅ **Dashboard Analytique** - Statistiques agrégées en temps réel
- ✅ **Design Moderne & Responsive** - Optimisé mobile et desktop

### 🏢 Secteurs Couverts
- 💰 Fintech (4 startups)
- 🤖 Intelligence Artificielle (3 startups)
- 🧬 Biotechnologie (2 startups)
- 💼 SaaS (4 startups)
- 🛒 E-commerce (3 startups)
- ♻️ CleanTech (3 startups)
- 🎓 EdTech (3 startups)
- 🏠 PropTech (3 startups)
- 📦 Logistique (2 startups)
- ✈️ TravelTech (2 startups)
- 🌾 AgriTech (2 startups)
- 🏥 HealthTech (2 startups)

### 🗺️ Couverture Géographique
Casablanca · Rabat · Marrakech · Tanger · Fès · Agadir · Meknès · Oujda · Tétouan

---

## 🚀 Installation Rapide

### Prérequis
```bash
Node.js >= 14.0.0
npm >= 6.0.0
```

### Installation

```bash
# 1. Cloner le repository
git clone https://github.com/votre-username/vc-deal-screener.git
cd vc-deal-screener

# 2. Installer les dépendances
npm install

# 3. Lancer en développement
npm start

# 4. Ouvrir dans le navigateur
# http://localhost:3000
```

### Build Production

```bash
# Créer le build optimisé
npm run build

# Le dossier /build contient les fichiers prêts pour déploiement
```

---

## 📦 Dépendances

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.294.0"
  }
}
```

**Taille du bundle:** ~350 KB (gzipped)

---

## 🎨 Personnalisation

### Modifier les Couleurs

```jsx
// Dans App.jsx, rechercher et remplacer:
#3b82f6  →  Votre couleur primaire
#8b5cf6  →  Votre couleur secondaire
#10b981  →  Votre couleur de succès
```

### Ajouter Vos Startups

```jsx
// Ligne ~120 - MOROCCAN_STARTUPS array
const MOROCCAN_STARTUPS = [
  {
    id: 31,
    name: 'Votre Startup',
    sector: 'fintech',
    stage: 'Seed',
    location: 'Casablanca',
    fundingRaised: 1500000,
    revenue: 250000,
    employees: 20,
    // ... autres champs
  }
];
```

### Créer un Nouveau Secteur

```jsx
// Ligne ~10 - SECTOR_SCORING_CRITERIA
nouveausecteur: {
  name: 'Nouveau Secteur',
  weights: {
    critere1: 0.30,
    critere2: 0.25,
    critere3: 0.20,
    critere4: 0.15,
    critere5: 0.10
  }
}
```

[📖 Guide complet de personnalisation](./guide-deploiement-publication.md)

---

## 🌐 Déploiement

### Vercel (Recommandé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Production
vercel --prod
```

### Netlify

```bash
# Build
npm run build

# Déployer avec Netlify CLI
netlify deploy --prod --dir=build
```

### GitHub Pages

```bash
# Ajouter dans package.json
"homepage": "https://username.github.io/vc-screener"

# Déployer
npm run deploy
```

[📖 Guide complet de déploiement](./guide-deploiement-publication.md)

---

## 📊 Structure du Projet

```
vc-deal-screener/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── App.jsx              # Composant principal
│   ├── index.js
│   └── index.css
├── package.json
├── README.md
├── guide-implementation.md   # Guide technique backend
└── guide-deploiement-publication.md  # Guide déploiement
```

---

## 🧮 Système de Scoring

Chaque startup reçoit un score sur 100 basé sur des critères spécifiques à son secteur.

### Exemple: Fintech
- **Conformité Réglementaire**: 25%
- **Traction Financière**: 30%
- **Infrastructure Sécurité**: 20%
- **Expérience Équipe**: 15%
- **Taille du Marché**: 10%

### Exemple: AI
- **Équipe Technique**: 30%
- **Qualité des Données**: 25%
- **Niveau d'Innovation**: 25%
- **Scalabilité**: 15%
- **Partenariats**: 5%

[📖 Voir tous les critères](./guide-implementation.md#système-de-scoring-sectoriel-intelligent)

---

## 🎯 Cas d'Usage

### Pour Venture Capitalists
- **Deal Flow Management**: Centraliser et scorer les opportunités
- **Due Diligence**: Vue détaillée avec métriques sectorielles
- **Benchmarking**: Comparer startups dans même secteur

### Pour Incubateurs/Accélérateurs
- **Portfolio Tracking**: Suivre progression startups
- **Sélection**: Identifier les meilleures candidatures
- **Reporting**: Présenter statistiques aux partenaires

### Pour Institutions
- **Cartographie Écosystème**: Visualiser startups par secteur/ville
- **Analyse Macro**: Tendances sectorielles
- **Support Décision**: Identifier secteurs à soutenir

---

## 🔮 Roadmap

### Version 2.0 (Q2 2025)
- [ ] Backend Node.js + PostgreSQL
- [ ] Authentification utilisateurs
- [ ] Export Excel/PDF
- [ ] Comparaison multi-startups
- [ ] Graphiques évolution temporelle

### Version 3.0 (Q3 2025)
- [ ] Collecte automatique données (Crunchbase API)
- [ ] Alertes email personnalisées
- [ ] Mobile app (React Native)
- [ ] API publique
- [ ] Intégration CRM

### Version 4.0 (Q4 2025)
- [ ] ML pour prédiction succès
- [ ] Analyse sentiment actualités
- [ ] Recommandations IA
- [ ] Dashboard personnalisable
- [ ] White-label solution

---

## 💼 Modèles Business

### 1. Freemium
- **Gratuit**: 10 startups, filtres basiques
- **Premium** (29€/mois): Illimité, export, alertes

### 2. Lead Generation
- Facturer VCs pour leads qualifiés
- 50-100€ par contact startup

### 3. White Label
- Vendre solution personnalisée
- 500-2000€ par client

### 4. Data as a Service
- API access pour developers
- 99€/mois (1000 calls)

[📖 Guide monétisation complet](./guide-deploiement-publication.md#monétisation)

---

## 🤝 Contribution

Les contributions sont les bienvenues!

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📄 License

Ce projet est sous licence MIT. Voir [LICENSE](LICENSE) pour plus d'informations.

---

## 👥 Auteurs

**Votre Nom**
- GitHub: [@votre-username](https://github.com/votre-username)
- LinkedIn: [Votre Profile](https://linkedin.com/in/votre-profile)
- Email: contact@votredomaine.com

---

## 🙏 Remerciements

- [React](https://reactjs.org/) - Framework UI
- [Lucide Icons](https://lucide.dev/) - Icônes
- [Vercel](https://vercel.com) - Hébergement
- Écosystème startup marocain 🇲🇦

---

## 📞 Support

- 📧 Email: support@votredomaine.com
- 💬 Discord: [Lien serveur](#)
- 📖 Documentation: [Lien docs](#)
- 🐛 Issues: [GitHub Issues](#)

---

## 📈 Stats

![GitHub stars](https://img.shields.io/github/stars/votre-username/vc-deal-screener?style=social)
![GitHub forks](https://img.shields.io/github/forks/votre-username/vc-deal-screener?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/votre-username/vc-deal-screener?style=social)

---

<div align="center">

**Construit avec ❤️ pour l'écosystème startup marocain**

[⭐ Star ce projet](https://github.com/votre-username/vc-deal-screener) · [🐛 Report Bug](#) · [✨ Request Feature](#)

</div>
