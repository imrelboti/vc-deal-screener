# utils/data_cleaner.py
"""
Data Cleaner & Deduplicator
============================
Nettoie et déduplique les données collectées
"""

import asyncio
from typing import List, Dict
import re
from difflib import SequenceMatcher
import logging

logger = logging.getLogger(__name__)


class DataCleaner:
    """Nettoyeur et déduplicateur de données"""
    
    def __init__(self):
        self.similarity_threshold = 0.85  # 85% de similarité pour considérer comme doublon
    
    async def process(self, startups: List[Dict]) -> List[Dict]:
        """
        Processus complet de nettoyage:
        1. Normalisation
        2. Validation
        3. Déduplication
        4. Enrichissement
        """
        
        logger.info(f"🧹 Nettoyage de {len(startups)} startups...")
        
        # Étape 1: Normalisation
        normalized = [self._normalize_startup(s) for s in startups]
        
        # Étape 2: Validation (filtrer les données invalides)
        valid = [s for s in normalized if self._is_valid(s)]
        logger.info(f"✅ Validation: {len(valid)}/{len(normalized)} startups valides")
        
        # Étape 3: Déduplication
        deduplicated = await self._deduplicate(valid)
        logger.info(f"✅ Déduplication: {len(deduplicated)} startups uniques")
        
        # Étape 4: Enrichissement (fusion des données)
        enriched = await self._enrich_merged_data(deduplicated)
        
        return enriched
    
    def _normalize_startup(self, startup: Dict) -> Dict:
        """Normalise les données d'une startup"""
        
        normalized = startup.copy()
        
        # Normaliser le nom
        if 'name' in normalized:
            normalized['name'] = self._normalize_name(normalized['name'])
        
        # Normaliser l'email
        if 'email' in normalized:
            normalized['email'] = self._normalize_email(normalized['email'])
        
        # Normaliser le secteur
        if 'sector' in normalized:
            normalized['sector'] = self._normalize_sector(normalized['sector'])
        
        # Normaliser la localisation
        if 'location' in normalized:
            normalized['location'] = self._normalize_location(normalized['location'])
        
        # Normaliser les montants
        for field in ['funding_raised', 'revenue']:
            if field in normalized:
                normalized[field] = self._normalize_amount(normalized[field])
        
        # Normaliser les URLs
        if 'website' in normalized:
            normalized['website'] = self._normalize_url(normalized['website'])
        
        return normalized
    
    def _normalize_name(self, name: str) -> str:
        """Normalise le nom de la startup"""
        if not name:
            return ''
        
        # Trim whitespace
        name = name.strip()
        
        # Capitaliser proprement
        # "paymorocco" -> "PayMorocco"
        # "PAYMOROCCO" -> "PayMorocco"
        
        # Exceptions communes
        exceptions = ['SaaS', 'API', 'AI', 'ML', 'IoT', 'VC']
        
        words = name.split()
        normalized_words = []
        
        for word in words:
            if word.upper() in exceptions:
                normalized_words.append(word.upper())
            else:
                normalized_words.append(word.capitalize())
        
        return ' '.join(normalized_words)
    
    def _normalize_email(self, email: str) -> str:
        """Normalise l'email"""
        if not email:
            return ''
        
        email = email.strip().lower()
        
        # Valider format email basique
        if not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', email):
            return ''
        
        return email
    
    def _normalize_sector(self, sector: str) -> str:
        """Normalise le secteur"""
        if not sector:
            return 'other'
        
        sector = sector.lower().strip()
        
        # Mapping des variations
        sector_mapping = {
            'fin tech': 'fintech',
            'financial technology': 'fintech',
            'artificial intelligence': 'ai',
            'machine learning': 'ai',
            'health tech': 'healthtech',
            'healthcare': 'healthtech',
            'ed tech': 'edtech',
            'education technology': 'edtech',
            'agri tech': 'agritech',
            'agricultural technology': 'agritech',
            'clean tech': 'cleantech',
            'green tech': 'cleantech',
            'prop tech': 'proptech',
            'real estate': 'proptech',
            'e-commerce': 'ecommerce',
            'ecom': 'ecommerce',
            'software as a service': 'saas',
        }
        
        return sector_mapping.get(sector, sector)
    
    def _normalize_location(self, location: str) -> str:
        """Normalise la localisation"""
        if not location:
            return 'Morocco'
        
        location = location.strip()
        
        # Mapping des variations de villes
        city_mapping = {
            'casa': 'Casablanca',
            'casablanca, morocco': 'Casablanca',
            'rabat, morocco': 'Rabat',
            'marrakech': 'Marrakech',
            'marrakesh': 'Marrakech',
            'tanger': 'Tanger',
            'tangier': 'Tanger',
            'fes': 'Fès',
            'fez': 'Fès',
        }
        
        location_lower = location.lower()
        
        for key, value in city_mapping.items():
            if key in location_lower:
                return value
        
        # Capitaliser si pas trouvé
        return location.title()
    
    def _normalize_amount(self, amount) -> int:
        """Normalise un montant financier"""
        if isinstance(amount, int):
            return amount
        
        if isinstance(amount, float):
            return int(amount)
        
        if isinstance(amount, str):
            # Parser depuis string
            import re
            
            # Supprimer tout sauf chiffres, . et ,
            cleaned = re.sub(r'[^\d.,]', '', amount)
            
            if not cleaned:
                return 0
            
            try:
                # Gérer différents formats
                if ',' in cleaned and '.' in cleaned:
                    cleaned = cleaned.replace(',', '')
                elif ',' in cleaned:
                    cleaned = cleaned.replace(',', '.')
                
                value = float(cleaned)
                
                # Multiplier par M ou K si présent
                if 'M' in amount.upper() or 'MILLION' in amount.upper():
                    value *= 1000000
                elif 'K' in amount.upper():
                    value *= 1000
                
                return int(value)
            except:
                return 0
        
        return 0
    
    def _normalize_url(self, url: str) -> str:
        """Normalise une URL"""
        if not url:
            return ''
        
        url = url.strip()
        
        # Ajouter https:// si absent
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        
        # Supprimer trailing slash
        url = url.rstrip('/')
        
        return url
    
    def _is_valid(self, startup: Dict) -> bool:
        """Valide qu'une startup a les données minimales requises"""
        
        # Nom obligatoire
        if not startup.get('name') or len(startup['name']) < 2:
            return False
        
        # Au moins un des champs suivants
        required_one_of = ['description', 'website', 'sector', 'email']
        if not any(startup.get(field) for field in required_one_of):
            return False
        
        return True
    
    async def _deduplicate(self, startups: List[Dict]) -> List[Dict]:
        """Déduplique les startups"""
        
        unique_startups = []
        seen_names = set()
        duplicates_merged = {}
        
        for startup in startups:
            name = startup.get('name', '').lower()
            
            # Vérifier si exactement le même nom
            if name in seen_names:
                # C'est un doublon exact, fusionner les données
                existing = next(s for s in unique_startups if s.get('name', '').lower() == name)
                self._merge_startup_data(existing, startup)
                continue
            
            # Vérifier similarité avec startups existantes
            is_duplicate = False
            
            for existing_startup in unique_startups:
                similarity = self._calculate_similarity(
                    startup.get('name', ''),
                    existing_startup.get('name', '')
                )
                
                if similarity >= self.similarity_threshold:
                    # C'est probablement un doublon
                    logger.debug(f"Doublon détecté: {startup.get('name')} ~ {existing_startup.get('name')} ({similarity:.2%})")
                    self._merge_startup_data(existing_startup, startup)
                    is_duplicate = True
                    break
            
            if not is_duplicate:
                unique_startups.append(startup)
                seen_names.add(name)
        
        return unique_startups
    
    def _calculate_similarity(self, str1: str, str2: str) -> float:
        """Calcule la similarité entre deux chaînes"""
        if not str1 or not str2:
            return 0.0
        
        # Normaliser pour comparaison
        s1 = str1.lower().strip()
        s2 = str2.lower().strip()
        
        # Utiliser SequenceMatcher
        return SequenceMatcher(None, s1, s2).ratio()
    
    def _merge_startup_data(self, target: Dict, source: Dict):
        """Fusionne les données de source dans target"""
        
        # Stratégie: garder les données les plus complètes
        
        for key, value in source.items():
            if key not in target or not target[key]:
                # Target n'a pas cette donnée, l'ajouter
                target[key] = value
            elif isinstance(value, (int, float)) and value > target.get(key, 0):
                # Pour les nombres, garder le plus grand (souvent plus récent/précis)
                target[key] = value
            elif isinstance(value, str) and len(value) > len(str(target.get(key, ''))):
                # Pour les strings, garder le plus long (plus d'info)
                target[key] = value
        
        # Merger les sources
        if 'sources' not in target:
            target['sources'] = []
        
        if source.get('source'):
            if source['source'] not in target['sources']:
                target['sources'].append(source['source'])
    
    async def _enrich_merged_data(self, startups: List[Dict]) -> List[Dict]:
        """Enrichit les données après merge"""
        
        enriched = []
        
        for startup in startups:
            # Calculer un score de qualité des données
            startup['data_quality_score'] = self._calculate_data_quality(startup)
            
            # Ajouter un flag de confiance
            startup['confidence'] = 'high' if startup['data_quality_score'] > 70 else 'medium' if startup['data_quality_score'] > 40 else 'low'
            
            enriched.append(startup)
        
        return enriched
    
    def _calculate_data_quality(self, startup: Dict) -> int:
        """Calcule un score de qualité des données (0-100)"""
        score = 0
        
        # Présence de champs importants (50 points max)
        important_fields = ['name', 'description', 'sector', 'location', 'website', 'email']
        for field in important_fields:
            if startup.get(field):
                score += 8
        
        # Présence de champs financiers (30 points max)
        financial_fields = ['funding_raised', 'revenue', 'employees']
        for field in financial_fields:
            if startup.get(field):
                score += 10
        
        # Présence de données riches (20 points max)
        if startup.get('founders'):
            score += 10
        if startup.get('metrics'):
            score += 10
        
        return min(100, score)


# Test
if __name__ == "__main__":
    async def test():
        cleaner = DataCleaner()
        
        # Test data avec doublons
        test_data = [
            {'name': 'paymorocco', 'sector': 'fin tech', 'location': 'casa'},
            {'name': 'PayMorocco', 'sector': 'fintech', 'location': 'Casablanca'},
            {'name': 'TestStartup', 'sector': 'ai', 'email': 'TEST@example.com'},
        ]
        
        cleaned = await cleaner.process(test_data)
        
        print(f"Avant: {len(test_data)} startups")
        print(f"Après: {len(cleaned)} startups")
        
        for s in cleaned:
            print(f"- {s['name']} ({s['sector']}) - Quality: {s['data_quality_score']}")
    
    asyncio.run(test())
