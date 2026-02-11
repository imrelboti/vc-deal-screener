import React, { useState, useMemo } from 'react';
import { Search, Filter, TrendingUp, Users, DollarSign, MapPin, Star, ChevronRight, X, Award, Briefcase, Calendar, Mail, Globe } from 'lucide-react';

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
    name: 'Logistique',
    weights: {
      deliverySpeed: 0.30,
      networkCoverage: 0.25,
      costStructure: 0.20,
      customerSatisfaction: 0.15,
      techStack: 0.10
    }
  }
};

// Fonction de calcul de score sectoriel
const calculateSectorScore = (startup) => {
  const criteria = SECTOR_SCORING_CRITERIA[startup.sector];
  if (!criteria) return 70;
  
  let totalScore = 0;
  Object.entries(criteria.weights).forEach(([key, weight]) => {
    const metricValue = startup.metrics[key] || 70;
    totalScore += metricValue * weight;
  });
  
  return Math.round(totalScore);
};

// Helper pour générer métriques
const generateMetrics = (sector, base = 70) => {
  const criteria = SECTOR_SCORING_CRITERIA[sector];
  if (!criteria) return {};
  
  const metrics = {};
  Object.keys(criteria.weights).forEach(key => {
    metrics[key] = Math.min(95, Math.max(40, base + (Math.random() * 20 - 10)));
  });
  return metrics;
};

// Générateur de startups
const generateStartup = (id, sector, stage, city) => {
  const sectorNames = {
    fintech: ['PayFlow', 'FinHub', 'MoneyTech', 'CashPro', 'BankLink'],
    ai: ['AICore', 'SmartTech', 'DataMind', 'MLHub', 'NeuralNet'],
    saas: ['CloudPro', 'SoftHub', 'AppFlow', 'DataSoft', 'WorkHub'],
    ecommerce: ['ShopHub', 'MarketPro', 'BuyFlow', 'SellTech', 'EcomHub'],
    healthtech: ['HealthPro', 'MedFlow', 'CareHub', 'MediTech', 'HealthHub'],
    edtech: ['EduFlow', 'LearnHub', 'StudyPro', 'TeachTech', 'SkillHub'],
    agritech: ['FarmTech', 'AgroHub', 'CropPro', 'AgriFlow', 'GreenTech'],
    cleantech: ['EcoTech', 'GreenHub', 'CleanPro', 'SolarFlow', 'RenewHub'],
    proptech: ['HomeTech', 'RealHub', 'PropPro', 'EstateFlow', 'HouseHub'],
    logistics: ['LogiPro', 'DeliverHub', 'ShipFlow', 'CargoTech', 'TransHub']
  };

  const names = sectorNames[sector] || ['TechHub'];
  const baseName = names[id % names.length];
  const name = id > names.length ? `${baseName} ${Math.floor(id / names.length)}` : baseName;

  let funding, revenue, employees;
  if (stage === 'Series A') {
    funding = 1500000 + Math.random() * 3000000;
    revenue = 300000 + Math.random() * 700000;
    employees = 20 + Math.floor(Math.random() * 50);
  } else if (stage === 'Seed') {
    funding = 500000 + Math.random() * 1500000;
    revenue = 80000 + Math.random() * 300000;
    employees = 10 + Math.floor(Math.random() * 25);
  } else {
    funding = 200000 + Math.random() * 600000;
    revenue = 20000 + Math.random() * 100000;
    employees = 5 + Math.floor(Math.random() * 15);
  }

  const quality = funding > 2000000 ? 85 : funding > 800000 ? 70 : 60;

  return {
    id,
    name,
    sector,
    stage,
    location: city,
    fundingRaised: Math.round(funding),
    revenue: Math.round(revenue),
    employees,
    foundedYear: 2020 + Math.floor(Math.random() * 4),
    description: `Solution innovante dans le ${SECTOR_SCORING_CRITERIA[sector].name}`,
    founders: [`Fondateur ${id}`],
    website: `www.${name.toLowerCase().replace(/ /g, '')}.ma`,
    contact: {
      email: `contact@${name.toLowerCase().replace(/ /g, '')}.ma`,
      phone: '+212 X XX XX XX XX',
      linkedin: name.toLowerCase().replace(/ /g, '-')
    },
    metrics: generateMetrics(sector, quality),
    highlights: [
      `${Math.floor(Math.random() * 100) + 10}+ clients actifs`,
      `Croissance ${Math.floor(Math.random() * 150) + 50}% YoY`,
      `Expansion ${Math.floor(Math.random() * 5) + 2} villes`
    ]
  };
};

// Génération des 230 startups
const generateAllStartups = () => {
  const cities = ['Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Fès', 'Agadir', 'Meknès', 'Oujda', 'Tétouan', 'Kenitra', 'Salé', 'El Jadida'];
  const stages = ['Pre-Seed', 'Seed', 'Series A'];
  const sectors = Object.keys(SECTOR_SCORING_CRITERIA);
  
  const startups = [];
  
  for (let i = 1; i <= 230; i++) {
    const sector = sectors[i % sectors.length];
    const stage = stages[Math.floor(Math.random() * stages.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    
    startups.push(generateStartup(i, sector, stage, city));
  }
  
  return startups;
};

const ALL_STARTUPS = generateAllStartups();

const startupsWithScores = ALL_STARTUPS.map(startup => ({
  ...startup,
  score: calculateSectorScore(startup)
}));

const VCDealScr = () => {
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [filters, setFilters] = useState({
    sector: 'all',
    stage: 'all',
    location: 'all',
    minScore: 0,
    searchQuery: ''
  });

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
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
              vc-deal-scr
            </h1>
            <p style={{
              fontSize: '0.875rem',
              color: '#94a3b8',
              margin: '0.25rem 0 0 0'
            }}>
              Écosystème Startups Marocaines · {startupsWithScores.length} Entreprises · Scoring Sectoriel
            </p>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {[
          { label: 'Startups', value: stats.total, icon: Briefcase, color: '#3b82f6' },
          { label: 'Score Moyen', value: `${stats.avgScore}/100`, icon: Star, color: '#f59e0b' },
          { label: 'Fonds Levés', value: formatCurrency(stats.totalFunding), icon: DollarSign, color: '#10b981' },
          { label: 'CA Moyen', value: formatCurrency(stats.avgRevenue), icon: TrendingUp, color: '#8b5cf6' }
        ].map((stat, i) => (
          <div key={i} style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            borderRadius: '16px',
            padding: '1.25rem'
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
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#f1f5f9' }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.5)',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Filter size={20} color="#60a5fa" />
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0, color: '#f1f5f9' }}>
            Filtres
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          {/* Search */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
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
                placeholder="Nom..."
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
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Sector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
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
                cursor: 'pointer'
              }}
            >
              <option value="all">Tous</option>
              {Object.entries(SECTOR_SCORING_CRITERIA).map(([key, value]) => (
                <option key={key} value={key}>{value.name}</option>
              ))}
            </select>
          </div>

          {/* Stage */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
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
              <option value="all">Toutes</option>
              <option value="Pre-Seed">Pre-Seed</option>
              <option value="Seed">Seed</option>
              <option value="Series A">Series A</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
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
              <option value="all">Toutes</option>
              {['Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Fès', 'Agadir', 'Meknès', 'Oujda', 'Tétouan', 'Kenitra', 'Salé', 'El Jadida'].map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Score */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
              Score Min: {filters.minScore}
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
                outline: 'none',
                cursor: 'pointer'
              }}
            />
          </div>
        </div>
      </div>

      {/* Grid */}
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
              border: '1px solid rgba(148, 163, 184, 0.1)',
              borderRadius: '16px',
              padding: '1.5rem',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
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
              gap: '0.375rem'
            }}>
              <Star size={14} fill="#fff" />
              {startup.score}
            </div>

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
                margin: '0 0 0.75rem 0'
              }}>
                {startup.description}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(148, 163, 184, 0.1)'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                  Fonds
                </div>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: '#f1f5f9' }}>
                  {formatCurrency(startup.fundingRaised)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                  CA
                </div>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: '#f1f5f9' }}>
                  {formatCurrency(startup.revenue)}
                </div>
              </div>
            </div>

            <div style={{
              marginTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(148, 163, 184, 0.1)'
            }}>
              <span style={{ fontSize: '0.875rem', color: '#60a5fa', fontWeight: '600' }}>
                Voir détails
              </span>
              <ChevronRight size={18} color="#60a5fa" />
            </div>
          </div>
        ))}
      </div>

      {filteredStartups.length > 0 && (
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '12px'
        }}>
          <p style={{ color: '#60a5fa', margin: 0 }}>
            Affichage de {filteredStartups.length} startups
          </p>
        </div>
      )}

      {filteredStartups.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Search size={48} color="#475569" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', color: '#cbd5e1' }}>
            Aucune startup trouvée
          </h3>
        </div>
      )}

      {/* Modal */}
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            zIndex: 1000
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#1e293b',
              borderRadius: '20px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              padding: '2rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '2rem', color: '#f1f5f9', margin: 0 }}>
                {selectedStartup.name}
              </h2>
              <button
                onClick={() => setSelectedStartup(null)}
                style={{
                  background: 'rgba(148, 163, 184, 0.1)',
                  border: 'none',
                  borderRadius: '10px',
                  width: '40px',
                  height: '40px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={20} color="#94a3b8" />
              </button>
            </div>

            <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
              {selectedStartup.description}
            </p>

            <div style={{
              background: getScoreColor(selectedStartup.score),
              color: '#fff',
              padding: '0.75rem 1.25rem',
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '2rem'
            }}>
              <Award size={20} fill="#fff" />
              Score: {selectedStartup.score}/100 · {getScoreBadge(selectedStartup.score)}
            </div>

            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ color: '#f1f5f9', marginBottom: '1rem' }}>Points Forts</h3>
              {selectedStartup.highlights.map((h, i) => (
                <div key={i} style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  marginBottom: '0.5rem',
                  color: '#cbd5e1'
                }}>
                  • {h}
                </div>
              ))}
            </div>

            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ color: '#f1f5f9', marginBottom: '1rem' }}>Contact</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mail size={16} color="#60a5fa" />
                  <a href={`mailto:${selectedStartup.contact.email}`} style={{ color: '#60a5fa', textDecoration: 'none' }}>
                    {selectedStartup.contact.email}
                  </a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Globe size={16} color="#60a5fa" />
                  <span style={{ color: '#cbd5e1' }}>{selectedStartup.website}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VCDealScr;