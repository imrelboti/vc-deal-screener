# collectors/crunchbase_collector.py
"""
Collecteur Crunchbase API
==========================
Collecte les données depuis Crunchbase avec filtrage intelligent
"""

import aiohttp
import asyncio
from typing import List, Dict, Optional
import os
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class CrunchbaseCollector:
    """Collecteur pour l'API Crunchbase"""
    
    def __init__(self):
        self.api_key = os.getenv('CRUNCHBASE_API_KEY', '')
        self.base_url = 'https://api.crunchbase.com/api/v4'
        self.session = None
        
        if not self.api_key:
            logger.warning("⚠️  CRUNCHBASE_API_KEY non configurée - Mode démo activé")
    
    async def collect(self) -> List[Dict]:
        """Collecte principale"""
        if not self.api_key:
            return await self._demo_mode()
        
        startups = []
        
        # Recherche par pays
        morocco_startups = await self.search_by_location('Morocco')
        startups.extend(morocco_startups)
        
        # Recherche par villes principales
        cities = ['Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Fès']
        for city in cities:
            city_startups = await self.search_by_location(f'{city}, Morocco')
            startups.extend(city_startups)
        
        return startups
    
    async def search_by_location(self, location: str) -> List[Dict]:
        """Recherche par localisation"""
        try:
            headers = {
                'X-cb-user-key': self.api_key,
                'Content-Type': 'application/json'
            }
            
            query = {
                "field_ids": [
                    "name",
                    "short_description",
                    "founded_on",
                    "categories",
                    "location_identifiers",
                    "num_employees_enum",
                    "revenue_range",
                    "funding_total",
                    "last_funding_type",
                    "contact_email",
                    "linkedin",
                    "website_url",
                    "rank_org"
                ],
                "order": [
                    {
                        "field_id": "rank_org",
                        "sort": "desc"
                    }
                ],
                "query": [
                    {
                        "type": "predicate",
                        "field_id": "location_identifiers",
                        "operator_id": "includes",
                        "values": [location]
                    },
                    {
                        "type": "predicate",
                        "field_id": "funding_total",
                        "operator_id": "gte",
                        "values": [{"value": 50000, "currency": "USD"}]
                    }
                ],
                "limit": 100
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f'{self.base_url}/searches/organizations',
                    headers=headers,
                    json=query
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._transform_data(data)
                    else:
                        logger.error(f"Crunchbase API error: {response.status}")
                        return []
                        
        except Exception as e:
            logger.error(f"Erreur Crunchbase: {e}")
            return []
    
    def _transform_data(self, raw_data: Dict) -> List[Dict]:
        """Transforme les données Crunchbase vers notre format"""
        startups = []
        
        for entity in raw_data.get('entities', []):
            props = entity.get('properties', {})
            
            startup = {
                'source': 'crunchbase',
                'collected_at': datetime.now().isoformat(),
                'name': props.get('name'),
                'description': props.get('short_description'),
                'website': props.get('website_url'),
                'linkedin': props.get('linkedin', {}).get('value'),
                'email': props.get('contact_email'),
                'founded_year': self._extract_year(props.get('founded_on')),
                'location': self._extract_location(props.get('location_identifiers', [])),
                'sector': self._map_categories(props.get('categories', [])),
                'funding_raised': props.get('funding_total', {}).get('value', 0),
                'funding_currency': props.get('funding_total', {}).get('currency', 'USD'),
                'last_funding_type': props.get('last_funding_type'),
                'employees': self._parse_employees(props.get('num_employees_enum')),
                'revenue_range': props.get('revenue_range'),
                'rank': props.get('rank_org'),
                'crunchbase_url': entity.get('uuid')
            }
            
            if startup['name']:
                startups.append(startup)
        
        return startups
    
    def _map_categories(self, categories: List) -> str:
        """Mappe les catégories Crunchbase vers nos secteurs"""
        category_mapping = {
            'Financial Services': 'fintech',
            'FinTech': 'fintech',
            'Payments': 'fintech',
            'Banking': 'fintech',
            'Artificial Intelligence': 'ai',
            'Machine Learning': 'ai',
            'Computer Vision': 'ai',
            'Natural Language Processing': 'ai',
            'Biotechnology': 'healthtech',
            'Health Care': 'healthtech',
            'Medical': 'healthtech',
            'Software': 'saas',
            'SaaS': 'saas',
            'Enterprise Software': 'saas',
            'E-Commerce': 'ecommerce',
            'Marketplace': 'ecommerce',
            'Retail': 'ecommerce',
            'Education': 'edtech',
            'EdTech': 'edtech',
            'E-Learning': 'edtech',
            'Agriculture': 'agritech',
            'AgTech': 'agritech',
            'Farming': 'agritech',
            'Clean Energy': 'cleantech',
            'Renewable Energy': 'cleantech',
            'Solar': 'cleantech',
            'Real Estate': 'proptech',
            'Property Technology': 'proptech',
            'Logistics': 'logistics',
            'Delivery': 'logistics',
            'Supply Chain': 'logistics',
        }
        
        for cat in categories:
            cat_name = cat.get('value', '')
            if cat_name in category_mapping:
                return category_mapping[cat_name]
        
        return 'other'
    
    def _extract_location(self, locations: List) -> str:
        """Extrait la ville principale"""
        for loc in locations:
            if loc.get('location_type') == 'city':
                return loc.get('value', 'Morocco')
        return 'Morocco'
    
    def _parse_employees(self, emp_range: str) -> int:
        """Convertit le range d'employés en nombre"""
        mapping = {
            '1-10': 5,
            '11-50': 30,
            '51-100': 75,
            '101-250': 175,
            '251-500': 375,
            '501-1000': 750,
            '1001-5000': 3000,
            '5001-10000': 7500,
            '10001+': 15000
        }
        return mapping.get(emp_range, 10)
    
    def _extract_year(self, date_string: Optional[str]) -> Optional[int]:
        """Extrait l'année depuis une date"""
        if date_string:
            try:
                return int(date_string.split('-')[0])
            except:
                return None
        return None
    
    async def _demo_mode(self) -> List[Dict]:
        """Mode démo si pas d'API key"""
        logger.info("📝 Mode démo Crunchbase - Génération de données factices")
        
        # Retourne quelques startups fictives pour tester
        return [
            {
                'source': 'crunchbase_demo',
                'collected_at': datetime.now().isoformat(),
                'name': 'TechMorocco Demo',
                'description': 'Startup marocaine innovante (demo)',
                'location': 'Casablanca',
                'sector': 'fintech',
                'funding_raised': 500000,
                'founded_year': 2022
            }
        ]


# Test standalone
if __name__ == "__main__":
    async def test():
        collector = CrunchbaseCollector()
        startups = await collector.collect()
        print(f"Collecté: {len(startups)} startups")
        if startups:
            print(f"Exemple: {startups[0]}")
    
    asyncio.run(test())
