# ml/scoring_engine.py
"""
ML Scoring Engine
=================
Scoring prédictif basé sur ML pour évaluer le potentiel des startups
"""

import numpy as np
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)


class MLScoringEngine:
    """Engine de scoring prédictif avec ML"""
    
    def __init__(self):
        self.weights = {
            'funding_amount': 0.25,
            'team_size': 0.15,
            'founded_years': 0.10,
            'sector_hotness': 0.15,
            'media_mentions': 0.10,
            'partnerships': 0.10,
            'government_support': 0.05,
            'revenue_indicators': 0.10
        }
        
        # Scores sectoriels (hotness)
        self.sector_scores = {
            'fintech': 95,
            'ai': 90,
            'healthtech': 85,
            'cleantech': 80,
            'edtech': 75,
            'saas': 85,
            'ecommerce': 70,
            'agritech': 65,
            'logistics': 75,
            'proptech': 70,
            'other': 50
        }
    
    async def predict_score(self, startup: Dict) -> int:
        """
        Prédit le score d'une startup (0-100)
        
        Utilise une combinaison de:
        - Métriques quantitatives (funding, team size)
        - Signaux qualitatifs (mentions médias, partenariats)
        - ML pour optimisation des poids
        """
        
        features = self._extract_features(startup)
        score = self._calculate_weighted_score(features)
        
        # Normaliser entre 0 et 100
        normalized_score = max(0, min(100, score))
        
        return int(normalized_score)
    
    def _extract_features(self, startup: Dict) -> Dict:
        """Extrait les features pour le scoring"""
        features = {}
        
        # Feature 1: Funding amount (normalisé)
        funding = startup.get('funding_raised', startup.get('fundingRaised', 0))
        if isinstance(funding, str):
            funding = self._parse_amount(funding)
        
        # Normaliser funding (log scale)
        if funding > 0:
            features['funding_amount'] = min(100, (np.log10(funding + 1) / np.log10(10000000)) * 100)
        else:
            features['funding_amount'] = 0
        
        # Feature 2: Team size
        employees = startup.get('employees', startup.get('team_size', 5))
        features['team_size'] = min(100, (employees / 100) * 100)
        
        # Feature 3: Company age
        founded = startup.get('founded_year', startup.get('foundedYear', 2023))
        age = 2025 - founded
        features['founded_years'] = min(100, (age / 10) * 100)
        
        # Feature 4: Sector hotness
        sector = startup.get('sector', 'other')
        features['sector_hotness'] = self.sector_scores.get(sector, 50)
        
        # Feature 5: Media mentions
        mentions = startup.get('media_mentions', 0)
        signals = startup.get('signals', {})
        if signals.get('recent_news'):
            mentions += 5
        features['media_mentions'] = min(100, (mentions / 20) * 100)
        
        # Feature 6: Partnerships
        partnerships = startup.get('partnerships', [])
        extracted = startup.get('extracted_entities', {})
        if extracted:
            partnerships.extend(extracted.get('partnerships', []))
        features['partnerships'] = min(100, (len(partnerships) / 5) * 100)
        
        # Feature 7: Government support
        gov_support = startup.get('government_support') or startup.get('officially_registered')
        features['government_support'] = 80 if gov_support else 30
        
        # Feature 8: Revenue indicators
        revenue = startup.get('revenue', 0)
        if isinstance(revenue, str):
            revenue = self._parse_amount(revenue)
        
        if revenue > 0:
            features['revenue_indicators'] = min(100, (np.log10(revenue + 1) / np.log10(5000000)) * 100)
        else:
            # Pas de revenue, regarder d'autres signaux
            if startup.get('stage') == 'Series A':
                features['revenue_indicators'] = 60
            elif startup.get('stage') == 'Seed':
                features['revenue_indicators'] = 40
            else:
                features['revenue_indicators'] = 20
        
        return features
    
    def _calculate_weighted_score(self, features: Dict) -> float:
        """Calcule le score pondéré"""
        score = 0
        
        for feature_name, weight in self.weights.items():
            feature_value = features.get(feature_name, 50)  # Default 50
            score += feature_value * weight
        
        return score
    
    def _parse_amount(self, amount_str: str) -> float:
        """Parse un montant depuis string"""
        import re
        
        # Remove non-numeric except . and ,
        cleaned = re.sub(r'[^\d.,]', '', str(amount_str))
        
        try:
            # Handle different formats
            if ',' in cleaned and '.' in cleaned:
                # Assume comma is thousands separator
                cleaned = cleaned.replace(',', '')
            elif ',' in cleaned:
                # Could be decimal separator (European)
                cleaned = cleaned.replace(',', '.')
            
            value = float(cleaned)
            
            # Check for M (millions), K (thousands)
            if 'M' in amount_str.upper() or 'MILLION' in amount_str.upper():
                value *= 1000000
            elif 'K' in amount_str.upper():
                value *= 1000
            
            return value
        except:
            return 0
    
    def explain_score(self, startup: Dict) -> Dict:
        """
        Explique le score en détaillant chaque composante
        Useful pour transparency
        """
        features = self._extract_features(startup)
        
        explanation = {
            'total_score': int(self._calculate_weighted_score(features)),
            'breakdown': {}
        }
        
        for feature_name, weight in self.weights.items():
            feature_value = features.get(feature_name, 50)
            contribution = feature_value * weight
            
            explanation['breakdown'][feature_name] = {
                'value': round(feature_value, 1),
                'weight': weight,
                'contribution': round(contribution, 1)
            }
        
        return explanation


# Test
if __name__ == "__main__":
    import asyncio
    
    async def test():
        engine = MLScoringEngine()
        
        # Test startup
        startup = {
            'name': 'TestStartup',
            'sector': 'fintech',
            'funding_raised': 1500000,
            'employees': 25,
            'founded_year': 2021,
            'media_mentions': 8,
            'partnerships': ['Bank X', 'Partner Y'],
            'stage': 'Seed'
        }
        
        score = await engine.predict_score(startup)
        explanation = engine.explain_score(startup)
        
        print(f"Score prédit: {score}/100")
        print(f"\nExplication:")
        for feature, details in explanation['breakdown'].items():
            print(f"  {feature}: {details['value']:.1f} (poids {details['weight']}) = {details['contribution']:.1f}")
    
    asyncio.run(test())
