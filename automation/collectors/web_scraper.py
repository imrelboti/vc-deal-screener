# collectors/web_scraper.py
"""
Web Scraper Intelligent
=======================
Scrape les sites web marocains spécialisés dans les startups
"""

import aiohttp
from bs4 import BeautifulSoup
import asyncio
from typing import List, Dict
import re
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class IntelligentWebScraper:
    """Scraper intelligent pour sources web marocaines"""
    
    def __init__(self):
        self.sources = [
            {
                'name': 'StartupInfo.ma',
                'url': 'https://www.startupinfo.ma',
                'type': 'directory'
            },
            {
                'name': 'MoroccoTechNews',
                'url': 'https://www.moroccotechnews.ma',
                'type': 'blog'
            },
            {
                'name': 'L\'Economiste Startups',
                'url': 'https://www.leconomiste.com',
                'search_path': '/entreprises/startups',
                'type': 'news'
            }
        ]
        
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml',
            'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7'
        }
    
    async def collect(self) -> List[Dict]:
        """Collecte depuis toutes les sources"""
        all_startups = []
        
        # Scraping des annuaires
        directory_startups = await self._scrape_directories()
        all_startups.extend(directory_startups)
        
        # Scraping des articles de blog/news
        news_startups = await self._scrape_news_articles()
        all_startups.extend(news_startups)
        
        # Scraping des événements et pitch decks
        event_startups = await self._scrape_events()
        all_startups.extend(event_startups)
        
        logger.info(f"✅ Web Scraper: {len(all_startups)} startups collectées")
        return all_startups
    
    async def _scrape_directories(self) -> List[Dict]:
        """Scrape les annuaires de startups"""
        startups = []
        
        # URLs d'annuaires marocains connus
        directories = [
            'https://ma-startups.com/directory',  # Fictif pour demo
            'https://moroccanstartups.ma/list',   # Fictif pour demo
        ]
        
        async with aiohttp.ClientSession(headers=self.headers) as session:
            for url in directories:
                try:
                    startup_list = await self._parse_directory_page(session, url)
                    startups.extend(startup_list)
                except Exception as e:
                    logger.warning(f"⚠️  Erreur scraping {url}: {e}")
        
        return startups
    
    async def _parse_directory_page(self, session, url: str) -> List[Dict]:
        """Parse une page d'annuaire"""
        try:
            async with session.get(url, timeout=10) as response:
                if response.status != 200:
                    return []
                
                html = await response.text()
                soup = BeautifulSoup(html, 'html.parser')
                
                startups = []
                
                # Pattern générique pour trouver les cartes de startups
                # Chercher div/article avec classes communes
                cards = soup.find_all(['div', 'article'], 
                    class_=re.compile(r'startup|company|card|item', re.I))
                
                for card in cards:
                    startup = self._extract_startup_from_card(card)
                    if startup:
                        startup['source'] = 'web_directory'
                        startup['source_url'] = url
                        startup['collected_at'] = datetime.now().isoformat()
                        startups.append(startup)
                
                return startups
                
        except Exception as e:
            logger.error(f"Erreur parsing {url}: {e}")
            return []
    
    def _extract_startup_from_card(self, card) -> Dict:
        """Extrait les infos d'une carte startup"""
        try:
            data = {}
            
            # Nom (chercher dans h2, h3, strong, etc.)
            name_tag = card.find(['h2', 'h3', 'h4', 'strong', 'a'])
            if name_tag:
                data['name'] = name_tag.get_text(strip=True)
            
            # Description
            desc_tag = card.find(['p', 'div'], class_=re.compile(r'desc|about|summary', re.I))
            if desc_tag:
                data['description'] = desc_tag.get_text(strip=True)
            
            # Lien website
            link_tag = card.find('a', href=True)
            if link_tag:
                href = link_tag['href']
                if 'http' in href:
                    data['website'] = href
            
            # Email (regex)
            text = card.get_text()
            email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
            if email_match:
                data['email'] = email_match.group(0)
            
            # Secteur (keywords dans le texte)
            data['sector'] = self._guess_sector_from_text(text)
            
            # Localisation (chercher ville marocaine)
            cities = ['Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Fès', 
                     'Agadir', 'Meknès', 'Oujda', 'Tétouan']
            for city in cities:
                if city in text:
                    data['location'] = city
                    break
            
            return data if data.get('name') else None
            
        except Exception as e:
            logger.debug(f"Erreur extraction card: {e}")
            return None
    
    def _guess_sector_from_text(self, text: str) -> str:
        """Devine le secteur depuis le texte"""
        text_lower = text.lower()
        
        sector_keywords = {
            'fintech': ['fintech', 'paiement', 'banking', 'finance', 'assurance'],
            'ai': ['intelligence artificielle', 'ia', 'machine learning', 'ml', 'deep learning'],
            'healthtech': ['santé', 'médical', 'health', 'télémédecine', 'diagnostic'],
            'edtech': ['éducation', 'formation', 'learning', 'école', 'cours'],
            'ecommerce': ['e-commerce', 'marketplace', 'boutique', 'vente en ligne'],
            'agritech': ['agriculture', 'farming', 'agri', 'récolte', 'irrigation'],
            'cleantech': ['énergie', 'solaire', 'renouvelable', 'environnement', 'recyclage'],
            'logistics': ['logistique', 'livraison', 'transport', 'supply chain'],
            'saas': ['saas', 'cloud', 'software', 'logiciel', 'plateforme']
        }
        
        for sector, keywords in sector_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                return sector
        
        return 'other'
    
    async def _scrape_news_articles(self) -> List[Dict]:
        """Scrape les articles de news sur les startups"""
        startups = []
        
        # Sources de news marocaines
        news_urls = [
            'https://www.medias24.com/tag/startups',
            'https://www.hespress.com/economie/startups',
            'https://www.challenge.ma/tag/startups'
        ]
        
        async with aiohttp.ClientSession(headers=self.headers) as session:
            for url in news_urls:
                try:
                    articles = await self._parse_news_page(session, url)
                    
                    # Extraire mentions de startups depuis les articles
                    for article in articles:
                        mentioned_startups = self._extract_startups_from_article(article)
                        startups.extend(mentioned_startups)
                        
                except Exception as e:
                    logger.warning(f"⚠️  Erreur news {url}: {e}")
        
        return startups
    
    async def _parse_news_page(self, session, url: str) -> List[Dict]:
        """Parse une page de news"""
        try:
            async with session.get(url, timeout=10) as response:
                if response.status != 200:
                    return []
                
                html = await response.text()
                soup = BeautifulSoup(html, 'html.parser')
                
                articles = []
                article_tags = soup.find_all(['article', 'div'], 
                    class_=re.compile(r'article|post|news', re.I), limit=20)
                
                for tag in article_tags:
                    title_tag = tag.find(['h2', 'h3', 'h1'])
                    content_tag = tag.find(['p', 'div'], 
                        class_=re.compile(r'content|excerpt|summary', re.I))
                    
                    if title_tag:
                        articles.append({
                            'title': title_tag.get_text(strip=True),
                            'content': content_tag.get_text(strip=True) if content_tag else '',
                            'url': url
                        })
                
                return articles
                
        except Exception as e:
            logger.error(f"Erreur parsing news {url}: {e}")
            return []
    
    def _extract_startups_from_article(self, article: Dict) -> List[Dict]:
        """Extrait les mentions de startups depuis un article"""
        startups = []
        text = f"{article['title']} {article['content']}"
        
        # Pattern: "startup X", "la société Y", etc.
        patterns = [
            r'(?:startup|société|entreprise)\s+([A-Z][a-zA-Z]+)',
            r'([A-Z][a-zA-Z]+)\s+(?:lève|obtient|annonce)',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text)
            for match in matches:
                if len(match) > 3:  # Éviter les faux positifs
                    startup = {
                        'name': match,
                        'source': 'news_mention',
                        'source_url': article['url'],
                        'collected_at': datetime.now().isoformat(),
                        'sector': self._guess_sector_from_text(text),
                        'news_mention': article['title']
                    }
                    startups.append(startup)
        
        return startups
    
    async def _scrape_events(self) -> List[Dict]:
        """Scrape les événements startup (pitch, demo day, etc.)"""
        # Scraping d'événements Moroccan Startup Events
        # Pour une implémentation complète, parser les sites d'événements
        logger.info("📅 Scraping événements startup...")
        return []


# Test
if __name__ == "__main__":
    async def test():
        scraper = IntelligentWebScraper()
        startups = await scraper.collect()
        print(f"Scraped: {len(startups)} startups")
        for s in startups[:3]:
            print(s)
    
    asyncio.run(test())
