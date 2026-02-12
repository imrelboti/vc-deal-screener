# 🤖 Système d'Automatisation Complète - VC Deal Screener
# Phase 2: Collecte Automatique de Données avec ML

"""
SYSTÈME COMPLET DE COLLECTE AUTOMATIQUE
=========================================

Ce système collecte automatiquement les données des startups marocaines depuis:
- Crunchbase API
- LinkedIn (via Bright Data)
- Google Search (via Serper)
- Web Scraping intelligent
- Sources locales (blogs, médias marocains)

Utilise ML pour:
- Classification sectorielle automatique
- Scoring prédictif
- Détection de duplicatas
- Validation de données
"""

import asyncio
import logging
from datetime import datetime
from typing import List, Dict, Optional
import os
from pathlib import Path

# Configuration
BASE_DIR = Path(__file__).parent
LOG_DIR = BASE_DIR / 'logs'
LOG_DIR.mkdir(exist_ok=True)

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOG_DIR / f'collector_{datetime.now():%Y%m%d}.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class DataCollectionOrchestrator:
    """
    Orchestrateur principal de collecte de données
    Coordonne tous les collecteurs et le pipeline ML
    """
    
    def __init__(self):
        self.collectors = []
        self.ml_pipeline = None
        self.database = None
        self.stats = {
            'total_collected': 0,
            'new_startups': 0,
            'updated_startups': 0,
            'failed': 0,
            'start_time': None,
            'end_time': None
        }
    
    async def initialize(self):
        """Initialize tous les composants"""
        logger.info("🚀 Initialisation du système de collecte automatique...")
        
        # Import des collecteurs
        from collectors.crunchbase_collector import CrunchbaseCollector
        from collectors.web_scraper import IntelligentWebScraper
        from collectors.linkedin_collector import LinkedInCollector
        from collectors.google_search_collector import GoogleSearchCollector
        from collectors.local_sources_collector import LocalSourcesCollector
        
        # Import du pipeline ML
        from ml.classification_pipeline import MLClassificationPipeline
        from ml.scoring_engine import MLScoringEngine
        
        # Import de la base de données
        from database.db_manager import DatabaseManager
        
        # Initialiser la base de données
        self.database = DatabaseManager()
        await self.database.connect()
        logger.info("✅ Base de données connectée")
        
        # Initialiser les collecteurs
        self.collectors = [
            CrunchbaseCollector(),
            GoogleSearchCollector(),
            IntelligentWebScraper(),
            LocalSourcesCollector(),
            # LinkedInCollector() sera ajouté après configuration Bright Data
        ]
        logger.info(f"✅ {len(self.collectors)} collecteurs initialisés")
        
        # Initialiser le pipeline ML
        self.ml_pipeline = MLClassificationPipeline()
        self.ml_scoring = MLScoringEngine()
        await self.ml_pipeline.load_models()
        logger.info("✅ Pipeline ML chargé")
    
    async def run_full_collection(self):
        """Lance une collecte complète"""
        self.stats['start_time'] = datetime.now()
        logger.info("=" * 80)
        logger.info("🎯 DÉMARRAGE COLLECTE AUTOMATIQUE COMPLÈTE")
        logger.info("=" * 80)
        
        all_startups = []
        
        # Collecte depuis chaque source
        for collector in self.collectors:
            try:
                logger.info(f"📊 Collecte depuis {collector.__class__.__name__}...")
                startups = await collector.collect()
                logger.info(f"✅ {len(startups)} startups collectées depuis {collector.__class__.__name__}")
                all_startups.extend(startups)
            except Exception as e:
                logger.error(f"❌ Erreur {collector.__class__.__name__}: {e}")
                self.stats['failed'] += 1
        
        logger.info(f"📈 Total collecté (brut): {len(all_startups)} startups")
        
        # Nettoyage et déduplication
        logger.info("🧹 Nettoyage et déduplication...")
        cleaned_startups = await self._clean_and_deduplicate(all_startups)
        logger.info(f"✅ Après nettoyage: {len(cleaned_startups)} startups uniques")
        
        # Enrichissement ML
        logger.info("🤖 Enrichissement avec ML...")
        enriched_startups = await self._ml_enrichment(cleaned_startups)
        
        # Sauvegarde en base de données
        logger.info("💾 Sauvegarde en base de données...")
        saved = await self._save_to_database(enriched_startups)
        
        self.stats['total_collected'] = len(enriched_startups)
        self.stats['new_startups'] = saved['new']
        self.stats['updated_startups'] = saved['updated']
        self.stats['end_time'] = datetime.now()
        
        # Rapport final
        self._print_final_report()
    
    async def _clean_and_deduplicate(self, startups: List[Dict]) -> List[Dict]:
        """Nettoie et déduplique les données"""
        from utils.data_cleaner import DataCleaner
        
        cleaner = DataCleaner()
        return await cleaner.process(startups)
    
    async def _ml_enrichment(self, startups: List[Dict]) -> List[Dict]:
        """Enrichit les données avec ML"""
        enriched = []
        
        for startup in startups:
            try:
                # Classification sectorielle automatique
                if not startup.get('sector'):
                    startup['sector'] = await self.ml_pipeline.classify_sector(
                        startup.get('description', ''),
                        startup.get('name', '')
                    )
                
                # Scoring prédictif
                startup['predicted_score'] = await self.ml_scoring.predict_score(startup)
                
                # Extraction d'entités (founders, technologies, etc.)
                startup['extracted_entities'] = await self.ml_pipeline.extract_entities(
                    startup.get('description', '')
                )
                
                # Sentiment analysis sur les news
                if startup.get('news'):
                    startup['sentiment_score'] = await self.ml_pipeline.analyze_sentiment(
                        startup['news']
                    )
                
                enriched.append(startup)
                
            except Exception as e:
                logger.warning(f"⚠️  Erreur enrichissement {startup.get('name')}: {e}")
                enriched.append(startup)
        
        return enriched
    
    async def _save_to_database(self, startups: List[Dict]) -> Dict:
        """Sauvegarde les startups en base de données"""
        new_count = 0
        updated_count = 0
        
        for startup in startups:
            try:
                exists = await self.database.startup_exists(startup['name'])
                
                if exists:
                    await self.database.update_startup(startup)
                    updated_count += 1
                else:
                    await self.database.create_startup(startup)
                    new_count += 1
                    
            except Exception as e:
                logger.error(f"❌ Erreur sauvegarde {startup.get('name')}: {e}")
        
        return {'new': new_count, 'updated': updated_count}
    
    def _print_final_report(self):
        """Affiche le rapport final"""
        duration = (self.stats['end_time'] - self.stats['start_time']).total_seconds()
        
        logger.info("=" * 80)
        logger.info("📊 RAPPORT FINAL DE COLLECTE")
        logger.info("=" * 80)
        logger.info(f"⏱️  Durée: {duration:.2f} secondes")
        logger.info(f"📈 Total collecté: {self.stats['total_collected']}")
        logger.info(f"🆕 Nouvelles startups: {self.stats['new_startups']}")
        logger.info(f"🔄 Startups mises à jour: {self.stats['updated_startups']}")
        logger.info(f"❌ Échecs: {self.stats['failed']}")
        logger.info(f"✅ Taux de succès: {((self.stats['total_collected'] - self.stats['failed']) / max(self.stats['total_collected'], 1) * 100):.1f}%")
        logger.info("=" * 80)


async def main():
    """Point d'entrée principal"""
    orchestrator = DataCollectionOrchestrator()
    
    try:
        await orchestrator.initialize()
        await orchestrator.run_full_collection()
        logger.info("✅ Collecte terminée avec succès!")
        
    except KeyboardInterrupt:
        logger.info("⚠️  Collecte interrompue par l'utilisateur")
    except Exception as e:
        logger.error(f"❌ Erreur fatale: {e}", exc_info=True)
    finally:
        if orchestrator.database:
            await orchestrator.database.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
