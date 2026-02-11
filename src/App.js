import React, { useState, useMemo } from 'react';
import { Search, Filter, TrendingUp, Users, DollarSign, MapPin, Star, ChevronRight, X, Award, Briefcase, Calendar, Mail, Phone, Linkedin, Globe, ExternalLink } from 'lucide-react';

// Système de scoring sectoriel différencié
const SECTOR_SCORING_CRITERIA = {
  fintech: {
    name: 'Fintech',
    weights: {
      regulatoryCompliance: 0.25,
      financialTraction: 0.30,
      securityInfra: 0.20,
      teamExperience: 0.15,
      marketSize: 0.10
    }
  },
  ai: {
    name: 'Intelligence Artificielle',
    weights: {
      technicalTeam: 0.30,
      dataQuality: 0.25,
      innovationLevel: 0.25,
      scalability: 0.15,
      partnerships: 0.05
    }
  },
  biotech: {
    name: 'Biotechnologie',
    weights: {
      rdPipeline: 0.35,
      patents: 0.25,
      clinicalProgress: 0.20,
      scientificTeam: 0.15,
      fundingRunway: 0.05
    }
  },
  saas: {
    name: 'SaaS',
    weights: {
      arr: 0.30,
      growthRate: 0.25,
      churnRate: 0.20,
      ltv_cac: 0.15,
      productMarketFit: 0.10
    }
  },
  ecommerce: {
    name: 'E-commerce',
    weights: {
      gmv: 0.30,
      customerAcquisition: 0.25,
      marginStructure: 0.20,
      logistics: 0.15,
      brandStrength: 0.10
    }
  },
  cleantech: {
    name: 'CleanTech',
    weights: {
      environmentalImpact: 0.30,
      techViability: 0.25,
      regulatorySupport: 0.20,
      scalability: 0.15,
      teamExpertise: 0.10
    }
  },
  healthtech: {
    name: 'HealthTech',
    weights: {
      clinicalValidation: 0.30,
      userAdoption: 0.25,
      dataPrivacy: 0.20,
      partnerships: 0.15,
      regulatoryApproval: 0.10
    }
  },
  edtech: {
    name: 'EdTech',
    weights: {
      learningOutcomes: 0.30,
      userEngagement: 0.25,
      contentQuality: 0.20,
      scalability: 0.15,
      monetization: 0.10
    }
  },
  agritech: {
    name: 'AgriTech',
    weights: {
      yieldImprovement: 0.30,
      farmerAdoption: 0.25,
      techReliability: 0.20,
      costEfficiency: 0.15,
      sustainabilityImpact: 0.10
    }
  },
  proptech: {
    name: 'PropTech',
    weights: {
      transactionVolume: 0.30,
      platformEfficiency: 0.25,
      userTrust: 0.20,
      marketCoverage: 0.15,
      regulatoryCompliance: 0.10
    }
  },
  logistics: {
    name: 'Logistique & Livraison',
    weights: {
      deliverySpeed: 0.30,
      networkCoverage: 0.25,
      costStructure: 0.20,
      customerSatisfaction: 0.15,
      techStack: 0.10
    }
  },
  traveltech: {
    name: 'TravelTech',
    weights: {
      bookingVolume: 0.30,
      userExperience: 0.25,
      partnerships: 0.20,
      marketDifferentiation: 0.15,
      profitability: 0.10
    }
  }
};

// Fonction de calcul de score sectoriel
const calculateSectorScore = (startup) => {
  const criteria = SECTOR_SCORING_CRITERIA[startup.sector];
  if (!criteria) return 0;
  
  let totalScore = 0;
  Object.entries(criteria.weights).forEach(([key, weight]) => {
    const metricValue = startup.metrics[key] || 0;
    totalScore += metricValue * weight;
  });
  
  return Math.round(totalScore);
};

// Base de données enrichie de 30 startups marocaines
const MOROCCAN_STARTUPS = [
  // FINTECH
  {
    id: 1,
    name: 'PayMorocco',
    sector: 'fintech',
    stage: 'Series A',
    location: 'Casablanca',
    fundingRaised: 2500000,
    revenue: 450000,
    employees: 25,
    foundedYear: 2021,
    description: 'Solution de paiement mobile pour les PME marocaines',
    founders: ['Youssef Bennani', 'Salma El Fassi'],
    website: 'www.paymorocco.ma',
    contact: {
      email: 'contact@paymorocco.ma',
      phone: '+212 5 22 XX XX XX',
      linkedin: 'paymorocco'
    },
    metrics: {
      regulatoryCompliance: 90,
      financialTraction: 75,
      securityInfra: 85,
      teamExperience: 70,
      marketSize: 80
    },
    highlights: ['Licence BANK AL-MAGHRIB obtenue', '15K+ marchands actifs', 'Croissance 300% YoY']
  },
  {
    id: 2,
    name: 'WalletDZ',
    sector: 'fintech',
    stage: 'Seed',
    location: 'Rabat',
    fundingRaised: 950000,
    revenue: 180000,
    employees: 18,
    foundedYear: 2022,
    description: 'Portefeuille numérique pour remittances et paiements',
    founders: ['Karim Alami', 'Nadia Benchekroun'],
    website: 'www.walletdz.ma',
    contact: {
      email: 'hello@walletdz.ma',
      phone: '+212 5 37 XX XX XX',
      linkedin: 'walletdz'
    },
    metrics: {
      regulatoryCompliance: 75,
      financialTraction: 80,
      securityInfra: 90,
      teamExperience: 65,
      marketSize: 85
    },
    highlights: ['50K utilisateurs actifs', 'Partenariat Western Union', '2M MAD transférés/mois']
  },
  
  // AI
  {
    id: 3,
    name: 'AgriTech Maroc',
    sector: 'agritech',
    stage: 'Seed',
    location: 'Rabat',
    fundingRaised: 800000,
    revenue: 120000,
    employees: 12,
    foundedYear: 2022,
    description: 'IA pour optimisation agricole et prédiction des rendements',
    founders: ['Karim Alaoui', 'Fatima Zahra Idrissi'],
    website: 'www.agritech.ma',
    contact: {
      email: 'hello@agritech.ma',
      phone: '+212 5 37 XX XX XX',
      linkedin: 'agritech-maroc'
    },
    metrics: {
      yieldImprovement: 85,
      farmerAdoption: 75,
      techReliability: 80,
      costEfficiency: 70,
      sustainabilityImpact: 90
    },
    highlights: ['Partenariat avec INRA', '5000 hectares couverts', 'Précision 92%']
  },
  {
    id: 4,
    name: 'DataVision AI',
    sector: 'ai',
    stage: 'Series A',
    location: 'Casablanca',
    fundingRaised: 3200000,
    revenue: 680000,
    employees: 32,
    foundedYear: 2020,
    description: 'Computer vision pour contrôle qualité industriel',
    founders: ['Mehdi Tazi', 'Sara Benjelloun'],
    website: 'www.datavision.ma',
    contact: {
      email: 'contact@datavision.ma',
      phone: '+212 5 22 XX XX XX',
      linkedin: 'datavision-ai'
    },
    metrics: {
      technicalTeam: 90,
      dataQuality: 85,
      innovationLevel: 88,
      scalability: 80,
      partnerships: 75
    },
    highlights: ['3 brevets déposés', '12 clients industriels', 'Réduction défauts 45%']
  },
  
  // BIOTECH & HEALTHTECH
  {
    id: 5,
    name: 'MedConnect',
    sector: 'healthtech',
    stage: 'Pre-Seed',
    location: 'Casablanca',
    fundingRaised: 300000,
    revenue: 35000,
    employees: 8,
    foundedYear: 2023,
    description: 'Plateforme de télémédecine et diagnostic IA',
    founders: ['Dr. Mehdi Bensouda'],
    website: 'www.medconnect.ma',
    contact: {
      email: 'contact@medconnect.ma',
      phone: '+212 6 XX XX XX XX',
      linkedin: 'medconnect-morocco'
    },
    metrics: {
      clinicalValidation: 75,
      userAdoption: 70,
      dataPrivacy: 90,
      partnerships: 65,
      regulatoryApproval: 60
    },
    highlights: ['1500 consultations', 'Partenariat 5 cliniques', 'Temps attente -60%']
  },
  {
    id: 6,
    name: 'BioMed Innovations',
    sector: 'biotech',
    stage: 'Seed',
    location: 'Rabat',
    fundingRaised: 1500000,
    revenue: 95000,
    employees: 15,
    foundedYear: 2021,
    description: 'Développement de diagnostics moléculaires rapides',
    founders: ['Dr. Amina Tazi', 'Prof. Hassan Idrissi'],
    website: 'www.biomed.ma',
    contact: {
      email: 'info@biomed.ma',
      phone: '+212 5 37 XX XX XX',
      linkedin: 'biomed-innovations'
    },
    metrics: {
      rdPipeline: 80,
      patents: 85,
      clinicalProgress: 70,
      scientificTeam: 90,
      fundingRunway: 75
    },
    highlights: ['2 brevets internationaux', 'Essais cliniques phase II', 'Précision 95%']
  },
  {
    id: 7,
    name: 'HealthTrack',
    sector: 'healthtech',
    stage: 'Seed',
    location: 'Marrakech',
    fundingRaised: 720000,
    revenue: 140000,
    employees: 14,
    foundedYear: 2022,
    description: 'Application de suivi santé et prévention personnalisée',
    founders: ['Laila Bennani', 'Youssef Amrani'],
    website: 'www.healthtrack.ma',
    contact: {
      email: 'hello@healthtrack.ma',
      phone: '+212 5 24 XX XX XX',
      linkedin: 'healthtrack-morocco'
    },
    metrics: {
      clinicalValidation: 70,
      userAdoption: 85,
      dataPrivacy: 88,
      partnerships: 75,
      regulatoryApproval: 65
    },
    highlights: ['25K utilisateurs actifs', 'Intégration assurances', 'NPS Score: 72']
  },
  
  // SAAS
  {
    id: 8,
    name: 'CloudWork',
    sector: 'saas',
    stage: 'Series A',
    location: 'Marrakech',
    fundingRaised: 1800000,
    revenue: 380000,
    employees: 18,
    foundedYear: 2020,
    description: 'Plateforme de gestion RH pour entreprises marocaines',
    founders: ['Amine Tazi', 'Nadia Lahlou'],
    website: 'www.cloudwork.ma',
    contact: {
      email: 'sales@cloudwork.ma',
      phone: '+212 5 24 XX XX XX',
      linkedin: 'cloudwork-morocco'
    },
    metrics: {
      arr: 85,
      growthRate: 90,
      churnRate: 80,
      ltv_cac: 75,
      productMarketFit: 85
    },
    highlights: ['ARR: 380K MAD', 'MRR Growth: 15%', '200+ clients']
  },
  {
    id: 9,
    name: 'LogiChain',
    sector: 'saas',
    stage: 'Pre-Seed',
    location: 'Casablanca',
    fundingRaised: 450000,
    revenue: 75000,
    employees: 10,
    foundedYear: 2023,
    description: 'Gestion de chaîne logistique pour PME',
    founders: ['Samir Benjelloun'],
    website: 'www.logichain.ma',
    contact: {
      email: 'contact@logichain.ma',
      phone: '+212 6 XX XX XX XX',
      linkedin: 'logichain'
    },
    metrics: {
      arr: 70,
      growthRate: 85,
      churnRate: 75,
      ltv_cac: 65,
      productMarketFit: 70
    },
    highlights: ['60+ PME clients', 'Intégration multi-transporteurs', 'ROI: 30%']
  },
  {
    id: 10,
    name: 'InvoiceFlow',
    sector: 'saas',
    stage: 'Seed',
    location: 'Tanger',
    fundingRaised: 890000,
    revenue: 195000,
    employees: 16,
    foundedYear: 2021,
    description: 'Automatisation facturation et comptabilité',
    founders: ['Omar Chakir', 'Samira El Fassi'],
    website: 'www.invoiceflow.ma',
    contact: {
      email: 'info@invoiceflow.ma',
      phone: '+212 5 39 XX XX XX',
      linkedin: 'invoiceflow'
    },
    metrics: {
      arr: 78,
      growthRate: 82,
      churnRate: 85,
      ltv_cac: 70,
      productMarketFit: 80
    },
    highlights: ['150+ entreprises', 'Conformité fiscale automatique', 'Temps gagné: 80%']
  },
  
  // E-COMMERCE
  {
    id: 11,
    name: 'ShopMaroc',
    sector: 'ecommerce',
    stage: 'Seed',
    location: 'Casablanca',
    fundingRaised: 1200000,
    revenue: 850000,
    employees: 35,
    foundedYear: 2021,
    description: 'Marketplace pour artisans et producteurs locaux',
    founders: ['Yasmine El Amrani', 'Omar Bekkali'],
    website: 'www.shopmaroc.ma',
    contact: {
      email: 'info@shopmaroc.ma',
      phone: '+212 5 22 XX XX XX',
      linkedin: 'shopmaroc'
    },
    metrics: {
      gmv: 80,
      customerAcquisition: 75,
      marginStructure: 70,
      logistics: 85,
      brandStrength: 80
    },
    highlights: ['GMV: 8.5M MAD', '500+ artisans', 'Livraison nationale']
  },
  {
    id: 12,
    name: 'FreshDirect MA',
    sector: 'ecommerce',
    stage: 'Series A',
    location: 'Rabat',
    fundingRaised: 2800000,
    revenue: 1200000,
    employees: 48,
    foundedYear: 2020,
    description: 'Livraison produits frais en 2h',
    founders: ['Rachid Alami', 'Fatima Benkirane'],
    website: 'www.freshdirect.ma',
    contact: {
      email: 'contact@freshdirect.ma',
      phone: '+212 5 37 XX XX XX',
      linkedin: 'freshdirect-ma'
    },
    metrics: {
      gmv: 85,
      customerAcquisition: 80,
      marginStructure: 75,
      logistics: 90,
      brandStrength: 85
    },
    highlights: ['GMV: 12M MAD', '8000 commandes/mois', 'Taux rétention 65%']
  },
  
  // CLEANTECH
  {
    id: 13,
    name: 'SolarTech',
    sector: 'cleantech',
    stage: 'Series A',
    location: 'Tanger',
    fundingRaised: 3200000,
    revenue: 520000,
    employees: 28,
    foundedYear: 2020,
    description: 'Solutions solaires intelligentes pour industriels',
    founders: ['Hassan Chakir', 'Leila Bennani'],
    website: 'www.solartech.ma',
    contact: {
      email: 'contact@solartech.ma',
      phone: '+212 5 39 XX XX XX',
      linkedin: 'solartech-morocco'
    },
    metrics: {
      environmentalImpact: 95,
      techViability: 85,
      regulatorySupport: 90,
      scalability: 80,
      teamExpertise: 85
    },
    highlights: ['50 MW installés', 'Subventions gouvernementales', 'Export vers 3 pays']
  },
  {
    id: 14,
    name: 'GreenWaste Solutions',
    sector: 'cleantech',
    stage: 'Seed',
    location: 'Agadir',
    fundingRaised: 680000,
    revenue: 150000,
    employees: 12,
    foundedYear: 2022,
    description: 'Valorisation déchets organiques en biogaz',
    founders: ['Khalid Rami', 'Nora Idrissi'],
    website: 'www.greenwaste.ma',
    contact: {
      email: 'info@greenwaste.ma',
      phone: '+212 5 28 XX XX XX',
      linkedin: 'greenwaste-solutions'
    },
    metrics: {
      environmentalImpact: 88,
      techViability: 75,
      regulatorySupport: 80,
      scalability: 70,
      teamExpertise: 78
    },
    highlights: ['500 tonnes/mois traitées', '3 municipalités partenaires', 'CO2 évité: 2000T']
  },
  
  // EDTECH
  {
    id: 15,
    name: 'EduTech Maroc',
    sector: 'edtech',
    stage: 'Seed',
    location: 'Fès',
    fundingRaised: 650000,
    revenue: 95000,
    employees: 15,
    foundedYear: 2022,
    description: 'Plateforme d\'apprentissage adaptatif par IA',
    founders: ['Imane Berrada', 'Rachid Alami'],
    website: 'www.edutech.ma',
    contact: {
      email: 'hello@edutech.ma',
      phone: '+212 5 35 XX XX XX',
      linkedin: 'edutech-maroc'
    },
    metrics: {
      learningOutcomes: 85,
      userEngagement: 88,
      contentQuality: 80,
      scalability: 75,
      monetization: 70
    },
    highlights: ['10K+ étudiants', 'Partenariat universités', 'Taux de réussite +40%']
  },
  {
    id: 16,
    name: 'SkillBoost',
    sector: 'edtech',
    stage: 'Pre-Seed',
    location: 'Casablanca',
    fundingRaised: 380000,
    revenue: 48000,
    employees: 9,
    foundedYear: 2023,
    description: 'Formation professionnelle continue en ligne',
    founders: ['Amine Senhaji', 'Dounia El Mansouri'],
    website: 'www.skillboost.ma',
    contact: {
      email: 'contact@skillboost.ma',
      phone: '+212 6 XX XX XX XX',
      linkedin: 'skillboost-morocco'
    },
    metrics: {
      learningOutcomes: 75,
      userEngagement: 80,
      contentQuality: 85,
      scalability: 70,
      monetization: 65
    },
    highlights: ['3500 apprenants', '120+ cours', 'Partenariat entreprises']
  },
  {
    id: 17,
    name: 'CodeCamp MA',
    sector: 'edtech',
    stage: 'Seed',
    location: 'Rabat',
    fundingRaised: 920000,
    revenue: 210000,
    employees: 22,
    foundedYear: 2021,
    description: 'Bootcamps coding et placement professionnel',
    founders: ['Youssef Tazi', 'Kenza Bennani'],
    website: 'www.codecamp.ma',
    contact: {
      email: 'hello@codecamp.ma',
      phone: '+212 5 37 XX XX XX',
      linkedin: 'codecamp-ma'
    },
    metrics: {
      learningOutcomes: 90,
      userEngagement: 85,
      contentQuality: 88,
      scalability: 78,
      monetization: 80
    },
    highlights: ['800+ diplômés', 'Taux placement 85%', '50+ entreprises partenaires']
  },
  
  // PROPTECH
  {
    id: 18,
    name: 'RealEstate Pro',
    sector: 'proptech',
    stage: 'Series A',
    location: 'Casablanca',
    fundingRaised: 2100000,
    revenue: 480000,
    employees: 26,
    foundedYear: 2020,
    description: 'Plateforme digitale de transactions immobilières',
    founders: ['Mehdi Azoulay', 'Salma Chraibi'],
    website: 'www.realestatepro.ma',
    contact: {
      email: 'contact@realestatepro.ma',
      phone: '+212 5 22 XX XX XX',
      linkedin: 'realestate-pro'
    },
    metrics: {
      transactionVolume: 82,
      platformEfficiency: 85,
      userTrust: 80,
      marketCoverage: 75,
      regulatoryCompliance: 88
    },
    highlights: ['2500 transactions/an', '150M MAD volume', '5000+ annonces actives']
  },
  {
    id: 19,
    name: 'SmartRent',
    sector: 'proptech',
    stage: 'Seed',
    location: 'Marrakech',
    fundingRaised: 750000,
    revenue: 125000,
    employees: 14,
    foundedYear: 2022,
    description: 'Gestion intelligente locations courte durée',
    founders: ['Karim Tahiri', 'Leila Mansouri'],
    website: 'www.smartrent.ma',
    contact: {
      email: 'info@smartrent.ma',
      phone: '+212 5 24 XX XX XX',
      linkedin: 'smartrent-morocco'
    },
    metrics: {
      transactionVolume: 75,
      platformEfficiency: 80,
      userTrust: 85,
      marketCoverage: 70,
      regulatoryCompliance: 75
    },
    highlights: ['800+ propriétés', 'Taux occupation 78%', 'Revenus +35% vs traditionnel']
  },
  
  // LOGISTICS
  {
    id: 20,
    name: 'FastDeliver',
    sector: 'logistics',
    stage: 'Series A',
    location: 'Casablanca',
    fundingRaised: 2900000,
    revenue: 920000,
    employees: 85,
    foundedYear: 2020,
    description: 'Livraison express et logistique last-mile',
    founders: ['Omar Benali', 'Zineb Alaoui'],
    website: 'www.fastdeliver.ma',
    contact: {
      email: 'contact@fastdeliver.ma',
      phone: '+212 5 22 XX XX XX',
      linkedin: 'fastdeliver-morocco'
    },
    metrics: {
      deliverySpeed: 90,
      networkCoverage: 85,
      costStructure: 75,
      customerSatisfaction: 88,
      techStack: 80
    },
    highlights: ['50K livraisons/mois', 'Couverture 25 villes', 'Délai moyen 24h']
  },
  {
    id: 21,
    name: 'CargoLink',
    sector: 'logistics',
    stage: 'Seed',
    location: 'Tanger',
    fundingRaised: 1100000,
    revenue: 280000,
    employees: 24,
    foundedYear: 2021,
    description: 'Marketplace fret routier et transport B2B',
    founders: ['Hassan Tazi', 'Nadia Berrada'],
    website: 'www.cargolink.ma',
    contact: {
      email: 'hello@cargolink.ma',
      phone: '+212 5 39 XX XX XX',
      linkedin: 'cargolink-morocco'
    },
    metrics: {
      deliverySpeed: 75,
      networkCoverage: 80,
      costStructure: 85,
      customerSatisfaction: 78,
      techStack: 75
    },
    highlights: ['500+ transporteurs', '200+ expéditeurs', 'Coûts réduits 25%']
  },
  
  // TRAVELTECH
  {
    id: 22,
    name: 'TravelEasy',
    sector: 'traveltech',
    stage: 'Seed',
    location: 'Marrakech',
    fundingRaised: 980000,
    revenue: 240000,
    employees: 18,
    foundedYear: 2021,
    description: 'Plateforme réservation expériences touristiques',
    founders: ['Aicha Bennis', 'Youssef Alami'],
    website: 'www.traveleasy.ma',
    contact: {
      email: 'contact@traveleasy.ma',
      phone: '+212 5 24 XX XX XX',
      linkedin: 'traveleasy-morocco'
    },
    metrics: {
      bookingVolume: 80,
      userExperience: 85,
      partnerships: 78,
      marketDifferentiation: 82,
      profitability: 70
    },
    highlights: ['15K réservations/an', '200+ partenaires', 'NPS: 68']
  },
  {
    id: 23,
    name: 'MoroccoGuide AI',
    sector: 'traveltech',
    stage: 'Pre-Seed',
    location: 'Agadir',
    fundingRaised: 320000,
    revenue: 42000,
    employees: 7,
    foundedYear: 2023,
    description: 'Guide touristique personnalisé par IA',
    founders: ['Mehdi Chraibi'],
    website: 'www.moroccoguide.ai',
    contact: {
      email: 'hello@moroccoguide.ai',
      phone: '+212 6 XX XX XX XX',
      linkedin: 'moroccoguide-ai'
    },
    metrics: {
      bookingVolume: 65,
      userExperience: 88,
      partnerships: 70,
      marketDifferentiation: 90,
      profitability: 60
    },
    highlights: ['8K utilisateurs', 'IA multilingue', 'Partenariat offices tourisme']
  },
  
  // ADDITIONAL STARTUPS
  {
    id: 24,
    name: 'InsurTech Maroc',
    sector: 'fintech',
    stage: 'Seed',
    location: 'Casablanca',
    fundingRaised: 1300000,
    revenue: 195000,
    employees: 21,
    foundedYear: 2021,
    description: 'Assurance digitale et souscription instantanée',
    founders: ['Karim Benjelloun', 'Samira Tazi'],
    website: 'www.insurtech.ma',
    contact: {
      email: 'contact@insurtech.ma',
      phone: '+212 5 22 XX XX XX',
      linkedin: 'insurtech-maroc'
    },
    metrics: {
      regulatoryCompliance: 85,
      financialTraction: 78,
      securityInfra: 82,
      teamExperience: 75,
      marketSize: 88
    },
    highlights: ['5K polices actives', 'Souscription en 3min', 'Partenariat 8 assureurs']
  },
  {
    id: 25,
    name: 'FoodTech Solutions',
    sector: 'ecommerce',
    stage: 'Pre-Seed',
    location: 'Meknès',
    fundingRaised: 420000,
    revenue: 68000,
    employees: 11,
    foundedYear: 2023,
    description: 'Marketplace produits alimentaires locaux et bio',
    founders: ['Yasmine Alami', 'Omar Idrissi'],
    website: 'www.foodtech.ma',
    contact: {
      email: 'hello@foodtech.ma',
      phone: '+212 5 35 XX XX XX',
      linkedin: 'foodtech-solutions'
    },
    metrics: {
      gmv: 68,
      customerAcquisition: 72,
      marginStructure: 65,
      logistics: 70,
      brandStrength: 75
    },
    highlights: ['150+ producteurs', '2K clients', 'Bio certifié 90%']
  },
  {
    id: 26,
    name: 'CyberSecure MA',
    sector: 'saas',
    stage: 'Seed',
    location: 'Rabat',
    fundingRaised: 1450000,
    revenue: 320000,
    employees: 28,
    foundedYear: 2021,
    description: 'Solutions cybersécurité pour PME',
    founders: ['Mehdi Benkirane', 'Fatima Senhaji'],
    website: 'www.cybersecure.ma',
    contact: {
      email: 'info@cybersecure.ma',
      phone: '+212 5 37 XX XX XX',
      linkedin: 'cybersecure-ma'
    },
    metrics: {
      arr: 82,
      growthRate: 88,
      churnRate: 82,
      ltv_cac: 78,
      productMarketFit: 85
    },
    highlights: ['85 entreprises protégées', '0 incidents clients', 'Conformité RGPD']
  },
  {
    id: 27,
    name: 'WorkSpace+',
    sector: 'proptech',
    stage: 'Seed',
    location: 'Casablanca',
    fundingRaised: 880000,
    revenue: 175000,
    employees: 16,
    foundedYear: 2022,
    description: 'Coworking flexible et espaces partagés',
    founders: ['Amine Bennani', 'Leila Chraibi'],
    website: 'www.workspaceplus.ma',
    contact: {
      email: 'contact@workspaceplus.ma',
      phone: '+212 5 22 XX XX XX',
      linkedin: 'workspace-plus'
    },
    metrics: {
      transactionVolume: 78,
      platformEfficiency: 82,
      userTrust: 80,
      marketCoverage: 68,
      regulatoryCompliance: 85
    },
    highlights: ['6 espaces actifs', '500+ membres', 'Taux occupation 85%']
  },
  {
    id: 28,
    name: 'RecycleChain',
    sector: 'cleantech',
    stage: 'Pre-Seed',
    location: 'Oujda',
    fundingRaised: 480000,
    revenue: 52000,
    employees: 10,
    foundedYear: 2023,
    description: 'Traçabilité et valorisation déchets plastiques',
    founders: ['Hassan Rami', 'Nora Alaoui'],
    website: 'www.recyclechain.ma',
    contact: {
      email: 'hello@recyclechain.ma',
      phone: '+212 5 36 XX XX XX',
      linkedin: 'recyclechain'
    },
    metrics: {
      environmentalImpact: 82,
      techViability: 70,
      regulatorySupport: 75,
      scalability: 68,
      teamExpertise: 72
    },
    highlights: ['200 tonnes recyclées', 'Blockchain tracking', '15 collecteurs partenaires']
  },
  {
    id: 29,
    name: 'VoiceAI Maroc',
    sector: 'ai',
    stage: 'Seed',
    location: 'Tétouan',
    fundingRaised: 780000,
    revenue: 115000,
    employees: 13,
    foundedYear: 2022,
    description: 'Assistant vocal IA pour service client',
    founders: ['Youssef Tazi', 'Samira Idrissi'],
    website: 'www.voiceai.ma',
    contact: {
      email: 'contact@voiceai.ma',
      phone: '+212 5 39 XX XX XX',
      linkedin: 'voiceai-maroc'
    },
    metrics: {
      technicalTeam: 82,
      dataQuality: 78,
      innovationLevel: 85,
      scalability: 75,
      partnerships: 70
    },
    highlights: ['Support arabe/français', '20 clients actifs', 'Résolution 75% auto']
  },
  {
    id: 30,
    name: 'FarmConnect',
    sector: 'agritech',
    stage: 'Seed',
    location: 'Meknès',
    fundingRaised: 950000,
    revenue: 165000,
    employees: 17,
    foundedYear: 2021,
    description: 'Plateforme B2B agriculteurs-distributeurs',
    founders: ['Rachid Bennani', 'Kenza Alami'],
    website: 'www.farmconnect.ma',
    contact: {
      email: 'info@farmconnect.ma',
      phone: '+212 5 35 XX XX XX',
      linkedin: 'farmconnect-morocco'
    },
    metrics: {
      yieldImprovement: 70,
      farmerAdoption: 82,
      techReliability: 85,
      costEfficiency: 80,
      sustainabilityImpact: 75
    },
    highlights: ['300+ agriculteurs', '50+ distributeurs', 'Prix +15% pour farmers']
  }
];

// Calculer les scores pour toutes les startups
const startupsWithScores = MOROCCAN_STARTUPS.map(startup => ({
  ...startup,
  score: calculateSectorScore(startup)
}));

const VCDealScreener = () => {
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [filters, setFilters] = useState({
    sector: 'all',
    stage: 'all',
    location: 'all',
    minScore: 0,
    searchQuery: ''
  });

  // Filtrage dynamique
  const filteredStartups = useMemo(() => {
    return startupsWithScores.filter(startup => {
      if (filters.sector !== 'all' && startup.sector !== filters.sector) return false;
      if (filters.stage !== 'all' && startup.stage !== filters.stage) return false;
      if (filters.location !== 'all' && startup.location !== filters.location) return false;
      if (startup.score < filters.minScore) return false;
      if (filters.searchQuery && !startup.name.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [filters]);

  // Statistiques
  const stats = useMemo(() => {
    return {
      total: filteredStartups.length,
      avgScore: Math.round(filteredStartups.reduce((acc, s) => acc + s.score, 0) / filteredStartups.length) || 0,
      totalFunding: filteredStartups.reduce((acc, s) => acc + s.fundingRaised, 0),
      avgRevenue: Math.round(filteredStartups.reduce((acc, s) => acc + s.revenue, 0) / filteredStartups.length) || 0
    };
  }, [filteredStartups]);

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreBadge = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Bon';
    return 'Moyen';
  };

  const formatCurrency = (amount) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M MAD`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K MAD`;
    return `${amount} MAD`;
  };

  return (
    <div style={{
      fontFamily: '"Instrument Sans", -apple-system, BlinkMacSystemFont, sans-serif',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      minHeight: '100vh',
      color: '#f1f5f9',
      padding: '2rem'
    }}>
      {/* Header */}
      <header style={{
        marginBottom: '2.5rem',
        borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
        paddingBottom: '2rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '0.75rem'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)'
          }}>
            <TrendingUp size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: '700',
              margin: 0,
              background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em'
            }}>
              VC Deal Screener
            </h1>
            <p style={{
              fontSize: '0.875rem',
              color: '#94a3b8',
              margin: '0.25rem 0 0 0'
            }}>
              Écosystème Startups Marocaines · 30 Entreprises · Scoring Sectoriel Intelligent
            </p>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {[
          { label: 'Startups', value: stats.total, icon: Briefcase, color: '#3b82f6' },
          { label: 'Score Moyen', value: stats.avgScore + '/100', icon: Star, color: '#f59e0b' },
          { label: 'Fonds Levés', value: formatCurrency(stats.totalFunding), icon: DollarSign, color: '#10b981' },
          { label: 'CA Moyen', value: formatCurrency(stats.avgRevenue), icon: TrendingUp, color: '#8b5cf6' }
        ].map((stat, i) => (
          <div key={i} style={{
            background: 'rgba(30, 41, 59, 0.5)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            borderRadius: '16px',
            padding: '1.25rem',
            transition: 'all 0.3s ease',
            cursor: 'default'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = `0 8px 24px ${stat.color}33`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: `${stat.color}22`,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <stat.icon size={18} color={stat.color} />
              </div>
              <span style={{ fontSize: '0.875rem', color: '#94a3b8', fontWeight: '500' }}>
                {stat.label}
              </span>
            </div>
            <div style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              color: '#f1f5f9',
              letterSpacing: '-0.02em'
            }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.5)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1.25rem'
        }}>
          <Filter size={20} color="#60a5fa" />
          <h2 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            margin: 0,
            color: '#f1f5f9'
          }}>
            Filtres Dynamiques
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          {/* Search */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              color: '#94a3b8',
              marginBottom: '0.5rem',
              fontWeight: '500'
            }}>
              Recherche
            </label>
            <div style={{ position: 'relative' }}>
              <Search size={18} color="#64748b" style={{
                position: 'absolute',
                left: '0.875rem',
                top: '50%',
                transform: 'translateY(-50%)'
              }} />
              <input
                type="text"
                placeholder="Nom de startup..."
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.75rem',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '10px',
                  color: '#f1f5f9',
                  fontSize: '0.9375rem',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(148, 163, 184, 0.2)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Sector */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              color: '#94a3b8',
              marginBottom: '0.5rem',
              fontWeight: '500'
            }}>
              Secteur
            </label>
            <select
              value={filters.sector}
              onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '10px',
                color: '#f1f5f9',
                fontSize: '0.9375rem',
                outline: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <option value="all">Tous les secteurs</option>
              {Object.entries(SECTOR_SCORING_CRITERIA).map(([key, value]) => (
                <option key={key} value={key}>{value.name}</option>
              ))}
            </select>
          </div>

          {/* Stage */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              color: '#94a3b8',
              marginBottom: '0.5rem',
              fontWeight: '500'
            }}>
              Phase
            </label>
            <select
              value={filters.stage}
              onChange={(e) => setFilters({ ...filters, stage: e.target.value })}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '10px',
                color: '#f1f5f9',
                fontSize: '0.9375rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">Toutes les phases</option>
              <option value="Pre-Seed">Pre-Seed</option>
              <option value="Seed">Seed</option>
              <option value="Series A">Series A</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              color: '#94a3b8',
              marginBottom: '0.5rem',
              fontWeight: '500'
            }}>
              Ville
            </label>
            <select
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '10px',
                color: '#f1f5f9',
                fontSize: '0.9375rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">Toutes les villes</option>
              <option value="Casablanca">Casablanca</option>
              <option value="Rabat">Rabat</option>
              <option value="Marrakech">Marrakech</option>
              <option value="Tanger">Tanger</option>
              <option value="Fès">Fès</option>
              <option value="Agadir">Agadir</option>
              <option value="Meknès">Meknès</option>
              <option value="Oujda">Oujda</option>
              <option value="Tétouan">Tétouan</option>
            </select>
          </div>

          {/* Score Min */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              color: '#94a3b8',
              marginBottom: '0.5rem',
              fontWeight: '500'
            }}>
              Score Minimum: {filters.minScore}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={filters.minScore}
              onChange={(e) => setFilters({ ...filters, minScore: parseInt(e.target.value) })}
              style={{
                width: '100%',
                height: '6px',
                borderRadius: '3px',
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${filters.minScore}%, rgba(148, 163, 184, 0.2) ${filters.minScore}%, rgba(148, 163, 184, 0.2) 100%)`,
                outline: 'none',
                cursor: 'pointer'
              }}
            />
          </div>
        </div>
      </div>

      {/* Startups Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {filteredStartups.map((startup) => (
          <div
            key={startup.id}
            onClick={() => setSelectedStartup(startup)}
            style={{
              background: 'rgba(30, 41, 59, 0.5)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              borderRadius: '16px',
              padding: '1.5rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(59, 130, 246, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.1)';
            }}
          >
            {/* Score Badge */}
            <div style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: getScoreColor(startup.score),
              color: '#fff',
              padding: '0.5rem 0.875rem',
              borderRadius: '12px',
              fontSize: '0.875rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              boxShadow: `0 4px 12px ${getScoreColor(startup.score)}44`
            }}>
              <Star size={14} fill="#fff" />
              {startup.score}
            </div>

            {/* Startup Info */}
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#f1f5f9',
                margin: '0 0 0.5rem 0',
                paddingRight: '4rem'
              }}>
                {startup.name}
              </h3>
              <p style={{
                fontSize: '0.875rem',
                color: '#94a3b8',
                margin: '0 0 0.75rem 0',
                lineHeight: '1.5'
              }}>
                {startup.description}
              </p>
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap'
              }}>
                <span style={{
                  background: 'rgba(59, 130, 246, 0.15)',
                  color: '#60a5fa',
                  padding: '0.375rem 0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.8125rem',
                  fontWeight: '600'
                }}>
                  {SECTOR_SCORING_CRITERIA[startup.sector].name}
                </span>
                <span style={{
                  background: 'rgba(139, 92, 246, 0.15)',
                  color: '#a78bfa',
                  padding: '0.375rem 0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.8125rem',
                  fontWeight: '600'
                }}>
                  {startup.stage}
                </span>
                <span style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  padding: '0.375rem 0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.8125rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  <MapPin size={12} />
                  {startup.location}
                </span>
              </div>
            </div>

            {/* Metrics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(148, 163, 184, 0.1)'
            }}>
              <div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#64748b',
                  marginBottom: '0.25rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontWeight: '600'
                }}>
                  Fonds levés
                </div>
                <div style={{
                  fontSize: '1rem',
                  fontWeight: '700',
                  color: '#f1f5f9'
                }}>
                  {formatCurrency(startup.fundingRaised)}
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#64748b',
                  marginBottom: '0.25rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontWeight: '600'
                }}>
                  CA Annuel
                </div>
                <div style={{
                  fontSize: '1rem',
                  fontWeight: '700',
                  color: '#f1f5f9'
                }}>
                  {formatCurrency(startup.revenue)}
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#64748b',
                  marginBottom: '0.25rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontWeight: '600'
                }}>
                  Équipe
                </div>
                <div style={{
                  fontSize: '1rem',
                  fontWeight: '700',
                  color: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem'
                }}>
                  <Users size={16} color="#60a5fa" />
                  {startup.employees}
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#64748b',
                  marginBottom: '0.25rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontWeight: '600'
                }}>
                  Fondée
                </div>
                <div style={{
                  fontSize: '1rem',
                  fontWeight: '700',
                  color: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem'
                }}>
                  <Calendar size={16} color="#60a5fa" />
                  {startup.foundedYear}
                </div>
              </div>
            </div>

            {/* View Details */}
            <div style={{
              marginTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(148, 163, 184, 0.1)'
            }}>
              <span style={{
                fontSize: '0.875rem',
                color: '#60a5fa',
                fontWeight: '600'
              }}>
                Voir les détails
              </span>
              <ChevronRight size={18} color="#60a5fa" />
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredStartups.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'rgba(30, 41, 59, 0.3)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          borderRadius: '16px'
        }}>
          <Search size={48} color="#475569" style={{ marginBottom: '1rem' }} />
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#cbd5e1',
            marginBottom: '0.5rem'
          }}>
            Aucune startup trouvée
          </h3>
          <p style={{
            fontSize: '0.9375rem',
            color: '#64748b'
          }}>
            Essayez d'ajuster vos filtres pour voir plus de résultats
          </p>
        </div>
      )}

      {/* Detailed View Modal */}
      {selectedStartup && (
        <div
          onClick={() => setSelectedStartup(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            zIndex: 1000,
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              borderRadius: '20px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              animation: 'slideUp 0.3s ease'
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '2rem',
              borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
              position: 'sticky',
              top: 0,
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              zIndex: 10
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '1rem'
              }}>
                <div style={{ flex: 1 }}>
                  <h2 style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#f1f5f9',
                    margin: '0 0 0.5rem 0'
                  }}>
                    {selectedStartup.name}
                  </h2>
                  <p style={{
                    fontSize: '1rem',
                    color: '#94a3b8',
                    margin: 0,
                    lineHeight: '1.6'
                  }}>
                    {selectedStartup.description}
                  </p>
                  <a 
                    href={`https://${selectedStartup.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      color: '#60a5fa',
                      fontSize: '0.875rem',
                      marginTop: '0.5rem',
                      textDecoration: 'none'
                    }}
                  >
                    <Globe size={14} />
                    {selectedStartup.website}
                    <ExternalLink size={12} />
                  </a>
                </div>
                <button
                  onClick={() => setSelectedStartup(null)}
                  style={{
                    background: 'rgba(148, 163, 184, 0.1)',
                    border: 'none',
                    borderRadius: '10px',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    marginLeft: '1rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(148, 163, 184, 0.1)';
                  }}
                >
                  <X size={20} color="#94a3b8" />
                </button>
              </div>

              {/* Score & Tags */}
              <div style={{
                display: 'flex',
                gap: '0.75rem',
                flexWrap: 'wrap',
                alignItems: 'center'
              }}>
                <div style={{
                  background: getScoreColor(selectedStartup.score),
                  color: '#fff',
                  padding: '0.625rem 1rem',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: `0 4px 16px ${getScoreColor(selectedStartup.score)}44`
                }}>
                  <Award size={18} fill="#fff" />
                  Score: {selectedStartup.score}/100 · {getScoreBadge(selectedStartup.score)}
                </div>
                <span style={{
                  background: 'rgba(59, 130, 246, 0.15)',
                  color: '#60a5fa',
                  padding: '0.5rem 1rem',
                  borderRadius: '10px',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}>
                  {SECTOR_SCORING_CRITERIA[selectedStartup.sector].name}
                </span>
                <span style={{
                  background: 'rgba(139, 92, 246, 0.15)',
                  color: '#a78bfa',
                  padding: '0.5rem 1rem',
                  borderRadius: '10px',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}>
                  {selectedStartup.stage}
                </span>
              </div>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '2rem' }}>
              {/* Key Metrics */}
              <div style={{
                marginBottom: '2rem'
              }}>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#f1f5f9',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <TrendingUp size={20} color="#60a5fa" />
                  Métriques Clés
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem'
                }}>
                  {[
                    { label: 'Fonds Levés', value: formatCurrency(selectedStartup.fundingRaised), icon: DollarSign },
                    { label: 'Chiffre d\'Affaires', value: formatCurrency(selectedStartup.revenue), icon: TrendingUp },
                    { label: 'Employés', value: selectedStartup.employees, icon: Users },
                    { label: 'Année de Création', value: selectedStartup.foundedYear, icon: Calendar },
                    { label: 'Localisation', value: selectedStartup.location, icon: MapPin }
                  ].map((metric, i) => (
                    <div key={i} style={{
                      background: 'rgba(30, 41, 59, 0.5)',
                      border: '1px solid rgba(148, 163, 184, 0.1)',
                      borderRadius: '12px',
                      padding: '1.25rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.5rem'
                      }}>
                        <metric.icon size={16} color="#60a5fa" />
                        <span style={{
                          fontSize: '0.8125rem',
                          color: '#94a3b8',
                          fontWeight: '500'
                        }}>
                          {metric.label}
                        </span>
                      </div>
                      <div style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: '#f1f5f9'
                      }}>
                        {metric.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sector-Specific Metrics */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#f1f5f9',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Star size={20} color="#f59e0b" />
                  Critères de Scoring {SECTOR_SCORING_CRITERIA[selectedStartup.sector].name}
                </h3>
                <div style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                  borderRadius: '12px',
                  padding: '1.5rem'
                }}>
                  {Object.entries(SECTOR_SCORING_CRITERIA[selectedStartup.sector].weights).map(([key, weight]) => {
                    const value = selectedStartup.metrics[key] || 0;
                    return (
                      <div key={key} style={{ marginBottom: '1rem' }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '0.5rem'
                        }}>
                          <span style={{
                            fontSize: '0.875rem',
                            color: '#cbd5e1',
                            fontWeight: '500'
                          }}>
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span style={{
                            fontSize: '0.875rem',
                            color: '#f1f5f9',
                            fontWeight: '700'
                          }}>
                            {value}/100 · Poids: {(weight * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div style={{
                          width: '100%',
                          height: '8px',
                          background: 'rgba(15, 23, 42, 0.8)',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${value}%`,
                            height: '100%',
                            background: `linear-gradient(90deg, ${getScoreColor(value)}, ${getScoreColor(value)}dd)`,
                            transition: 'width 0.6s ease',
                            borderRadius: '4px'
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Highlights */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#f1f5f9',
                  marginBottom: '1rem'
                }}>
                  Points Forts
                </h3>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  {selectedStartup.highlights.map((highlight, i) => (
                    <div key={i} style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      borderRadius: '10px',
                      padding: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        background: '#10b981',
                        borderRadius: '50%',
                        flexShrink: 0
                      }} />
                      <span style={{
                        fontSize: '0.9375rem',
                        color: '#cbd5e1',
                        lineHeight: '1.5'
                      }}>
                        {highlight}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Founders */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#f1f5f9',
                  marginBottom: '1rem'
                }}>
                  Fondateurs
                </h3>
                <div style={{
                  display: 'flex',
                  gap: '0.75rem',
                  flexWrap: 'wrap'
                }}>
                  {selectedStartup.founders.map((founder, i) => (
                    <div key={i} style={{
                      background: 'rgba(139, 92, 246, 0.15)',
                      border: '1px solid rgba(139, 92, 246, 0.2)',
                      borderRadius: '10px',
                      padding: '0.75rem 1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.875rem',
                        fontWeight: '700',
                        color: '#fff'
                      }}>
                        {founder.charAt(0)}
                      </div>
                      <span style={{
                        fontSize: '0.9375rem',
                        color: '#e2e8f0',
                        fontWeight: '500'
                      }}>
                        {founder}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#f1f5f9',
                  marginBottom: '1rem'
                }}>
                  Contact
                </h3>
                <div style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <Mail size={18} color="#60a5fa" />
                    <a href={`mailto:${selectedStartup.contact.email}`} style={{
                      color: '#60a5fa',
                      textDecoration: 'none',
                      fontSize: '0.9375rem',
                      fontWeight: '500'
                    }}>
                      {selectedStartup.contact.email}
                    </a>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <Phone size={18} color="#60a5fa" />
                    <span style={{
                      color: '#cbd5e1',
                      fontSize: '0.9375rem',
                      fontWeight: '500'
                    }}>
                      {selectedStartup.contact.phone}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <Linkedin size={18} color="#60a5fa" />
                    <a href={`https://linkedin.com/company/${selectedStartup.contact.linkedin}`} target="_blank" rel="noopener noreferrer" style={{
                      color: '#60a5fa',
                      textDecoration: 'none',
                      fontSize: '0.9375rem',
                      fontWeight: '500'
                    }}>
                      linkedin.com/company/{selectedStartup.contact.linkedin}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap');
      `}</style>
    </div>
  );
};

export default VCDealScreener;
