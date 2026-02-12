# collectors/google_search_collector.py
"""
Google Search Collector
=======================
Utilise l'API Serper pour rechercher des startups marocaines
"""

import aiohttp
import asyncio
from typing import List, Dict
import os
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class GoogleSearchCollector:
    """Collecteur via Google Search (API Serper)"""
    
    def __init__(self):
        self.api_key = os.getenv('SERPER_API_KEY', '')
        self.base_url = 'https://google.serper.dev/search'
        
        # Requêtes de recherche ciblées
        self.search_queries = [
            'startup marocaine fintech 2024',
            'startup maroc technologie levée de fonds',
            'entreprise innovante casablanca',
            'startup rabat intelligence artificielle',
            'moroccan startup funding',
            'startup marrakech ecommerce',
            'jeune pousse maroc tech',
            'innovation maroc 2024',
            'startup tanger digital',
            'moroccan tech companies',
        ]
        
        if not self.api_key:
            logger.warning("⚠️  SERPER_API_KEY non configurée - Mode limité")
    
    async def collect(self) -> List[Dict]:
        """Collecte principale via recherche Google"""
        all_startups = []
        
        if not self.api_key:
            return await self._demo_mode()
        
        async with aiohttp.ClientSession() as session:
            tasks = [
                self._search_query(session, query)
                for query in self.search_queries
            ]
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for result in results:
                if isinstance(result, list):
                    all_startups.extend(result)
        
        logger.info(f"✅ Google Search: {len(all_startups)} leads collectés")
        return all_startups
    
    async def _search_query(self, session, query: str) -> List[Dict]:
        """Exécute une requête de recherche"""
        try:
            headers = {
                'X-API-KEY': self.api_key,
                'Content-Type': 'application/json'
            }
            
            payload = {
                'q': query,
                'num': 10,
                'gl': 'ma',  # Geolocation: Morocco
                'hl': 'fr'   # Language: French
            }
            
            async with session.post(
                self.base_url,
                headers=headers,
                json=payload,
                timeout=10
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    return self._extract_startups_from_results(data, query)
                else:
                    logger.warning(f"Serper API error {response.status} for: {query}")
                    return []
                    
        except Exception as e:
            logger.error(f"Erreur search query '{query}': {e}")
            return []
    
    def _extract_startups_from_results(self, data: Dict, query: str) -> List[Dict]:
        """Extrait les startups depuis les résultats Google"""
        startups = []
        
        for item in data.get('organic', []):
            startup = {
                'source': 'google_search',
                'search_query': query,
                'collected_at': datetime.now().isoformat(),
                'title': item.get('title', ''),
                'description': item.get('snippet', ''),
                'url': item.get('link', ''),
                'position': item.get('position'),
            }
            
            # Extraire le nom de la startup depuis le titre
            startup['name'] = self._extract_startup_name(startup['title'])
            
            # Extraire les signaux d'investissement
            startup['signals'] = self._extract_signals(startup['description'])
            
            # Deviner le secteur
            startup['sector'] = self._guess_sector(
                f"{startup['title']} {startup['description']}"
            )
            
            if startup['name']:
                startups.append(startup)
        
        # Extraire aussi depuis Knowledge Graph si présent
        if 'knowledgeGraph' in data:
            kg = data['knowledgeGraph']
            startup = {
                'source': 'google_knowledge_graph',
                'collected_at': datetime.now().isoformat(),
                'name': kg.get('title'),
                'description': kg.get('description'),
                'website': kg.get('website'),
                'type': kg.get('type')
            }
            if startup['name']:
                startups.append(startup)
        
        return startups
    
    def _extract_startup_name(self, title: str) -> str:
        """Extrait le nom de la startup depuis le titre"""
        import re
        
        # Patterns communs dans les titres
        patterns = [
            r'^([A-Z][a-zA-Z0-9]+)',  # Mot commençant par majuscule
            r'([A-Z][a-zA-Z0-9]+)\s+lève',
            r'([A-Z][a-zA-Z0-9]+)\s+obtient',
            r'([A-Z][a-zA-Z0-9]+),\s+(?:la |une )?startup',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, title)
            if match:
                name = match.group(1)
                if len(name) > 2:  # Éviter les faux positifs courts
                    return name
        
        # Fallback: premier mot en majuscule
        words = title.split()
        for word in words:
            if word[0].isupper() and len(word) > 3:
                return word
        
        return ''
    
    def _extract_signals(self, text: str) -> Dict:
        """Extrait des signaux d'investissement depuis le texte"""
        signals = {
            'funding_mentioned': False,
            'recent_news': False,
            'partnership': False,
            'expansion': False,
            'amount': None
        }
        
        text_lower = text.lower()
        
        # Signaux de financement
        funding_keywords = ['lève', 'levée', 'funding', 'investissement', 
                           'financement', 'million', 'capital']
        signals['funding_mentioned'] = any(kw in text_lower for kw in funding_keywords)
        
        # Montant
        import re
        amount_patterns = [
            r'(\d+(?:,\d+)?)\s*(?:million|M)',
            r'(\d+(?:\.\d+)?)\s*(?:million|M)',
        ]
        for pattern in amount_patterns:
            match = re.search(pattern, text)
            if match:
                signals['amount'] = match.group(1)
                break
        
        # Partenariat
        partnership_keywords = ['partenariat', 'partnership', 'collaboration', 's\'associe']
        signals['partnership'] = any(kw in text_lower for kw in partnership_keywords)
        
        # Expansion
        expansion_keywords = ['expansion', 'croissance', 'nouvell', 'lancement']
        signals['expansion'] = any(kw in text_lower for kw in expansion_keywords)
        
        # News récente (chercher des dates)
        date_patterns = [r'2024', r'2025', r'janvier|février|mars']
        signals['recent_news'] = any(re.search(p, text_lower) for p in date_patterns)
        
        return signals
    
    def _guess_sector(self, text: str) -> str:
        """Devine le secteur depuis le texte"""
        text_lower = text.lower()
        
        sector_keywords = {
            'fintech': ['fintech', 'paiement', 'banking', 'finance', 'monétique', 
                       'mobile money', 'assurance', 'insurtech'],
            'ai': ['intelligence artificielle', 'ia', 'ai', 'machine learning',
                  'ml', 'deep learning', 'computer vision', 'nlp'],
            'healthtech': ['santé', 'médical', 'health', 'télémédecine', 
                          'e-santé', 'diagnostic', 'biotech'],
            'edtech': ['éducation', 'formation', 'e-learning', 'edtech',
                      'école', 'cours', 'apprentissage'],
            'ecommerce': ['e-commerce', 'marketplace', 'vente en ligne',
                         'boutique', 'commerce électronique'],
            'agritech': ['agriculture', 'agritech', 'farming', 'agri',
                        'irrigation', 'smart farming'],
            'cleantech': ['énergie', 'cleantech', 'solaire', 'renouvelable',
                         'environnement', 'recyclage', 'green'],
            'logistics': ['logistique', 'livraison', 'delivery', 'transport',
                         'supply chain', 'fret'],
            'saas': ['saas', 'cloud', 'software', 'logiciel', 'plateforme',
                    'application']
        }
        
        for sector, keywords in sector_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                return sector
        
        return 'other'
    
    async def _demo_mode(self) -> List[Dict]:
        """Mode démo sans API key"""
        logger.info("📝 Mode démo Google Search")
        
        return [
            {
                'source': 'google_search_demo',
                'collected_at': datetime.now().isoformat(),
                'name': 'TechStartup MA',
                'description': 'Startup marocaine innovante dans la tech',
                'sector': 'ai',
                'signals': {'funding_mentioned': True}
            }
        ]


# Test
if __name__ == "__main__":
    async def test():
        collector = GoogleSearchCollector()
        startups = await collector.collect()
        print(f"Trouvé: {len(startups)} leads")
        for s in startups[:3]:
            print(f"- {s.get('name')}: {s.get('description')[:80]}...")
    
    asyncio.run(test())
