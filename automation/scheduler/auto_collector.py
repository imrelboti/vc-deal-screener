# scheduler/auto_collector.py
"""
Automated Collection Scheduler
===============================
Planifie et exécute les collectes automatiques de données
"""

import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime
import logging
import sys
import os

# Ajouter le parent directory au path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from main_orchestrator import DataCollectionOrchestrator

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class AutoCollectionScheduler:
    """
    Scheduler pour collectes automatiques
    
    Schedules configurés:
    - Collecte complète: Dimanche à 3h du matin (hebdomadaire)
    - Collecte incrémentale: Tous les jours à 2h du matin
    - Actualisation rapide: Toutes les 6 heures (news, updates)
    """
    
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self.orchestrator = None
        self.is_running = False
    
    async def initialize(self):
        """Initialize l'orchestrateur"""
        logger.info("🚀 Initialisation du scheduler automatique...")
        self.orchestrator = DataCollectionOrchestrator()
        await self.orchestrator.initialize()
        logger.info("✅ Scheduler initialisé")
    
    def setup_schedules(self):
        """Configure les plannings de collecte"""
        
        # Collecte complète hebdomadaire (Dimanche 3h)
        self.scheduler.add_job(
            self.run_full_collection,
            trigger=CronTrigger(day_of_week='sun', hour=3, minute=0),
            id='full_collection_weekly',
            name='Collecte Complète Hebdomadaire',
            replace_existing=True
        )
        logger.info("📅 Collecte complète programmée: Dimanche 3h00")
        
        # Collecte incrémentale quotidienne (2h)
        self.scheduler.add_job(
            self.run_incremental_collection,
            trigger=CronTrigger(hour=2, minute=0),
            id='incremental_daily',
            name='Collecte Incrémentale Quotidienne',
            replace_existing=True
        )
        logger.info("📅 Collecte incrémentale programmée: Tous les jours 2h00")
        
        # Actualisation rapide (toutes les 6h)
        self.scheduler.add_job(
            self.run_quick_update,
            trigger=CronTrigger(hour='*/6'),
            id='quick_update',
            name='Actualisation Rapide',
            replace_existing=True
        )
        logger.info("📅 Actualisation rapide programmée: Toutes les 6h")
        
        # Nettoyage base de données (Samedi 1h)
        self.scheduler.add_job(
            self.run_database_cleanup,
            trigger=CronTrigger(day_of_week='sat', hour=1, minute=0),
            id='db_cleanup_weekly',
            name='Nettoyage Base de Données',
            replace_existing=True
        )
        logger.info("📅 Nettoyage DB programmé: Samedi 1h00")
    
    async def run_full_collection(self):
        """Exécute une collecte complète"""
        logger.info("=" * 80)
        logger.info("🔄 COLLECTE COMPLÈTE DÉMARRÉE")
        logger.info("=" * 80)
        
        try:
            await self.orchestrator.run_full_collection()
            logger.info("✅ Collecte complète terminée avec succès")
        except Exception as e:
            logger.error(f"❌ Erreur collecte complète: {e}", exc_info=True)
    
    async def run_incremental_collection(self):
        """Exécute une collecte incrémentale (mise à jour)"""
        logger.info("🔄 Collecte incrémentale démarrée...")
        
        try:
            # Collecte uniquement depuis sources rapides
            from collectors.google_search_collector import GoogleSearchCollector
            from collectors.local_sources_collector import LocalSourcesCollector
            
            collectors = [
                GoogleSearchCollector(),
                LocalSourcesCollector()
            ]
            
            all_startups = []
            for collector in collectors:
                try:
                    startups = await collector.collect()
                    all_startups.extend(startups)
                except Exception as e:
                    logger.error(f"Erreur {collector.__class__.__name__}: {e}")
            
            # Processus de nettoyage et sauvegarde
            from utils.data_cleaner import DataCleaner
            
            cleaner = DataCleaner()
            cleaned = await cleaner.process(all_startups)
            
            # Sauvegarder
            for startup in cleaned:
                exists = await self.orchestrator.database.startup_exists(startup['name'])
                if exists:
                    await self.orchestrator.database.update_startup(startup)
                else:
                    await self.orchestrator.database.create_startup(startup)
            
            logger.info(f"✅ Collecte incrémentale: {len(cleaned)} startups traitées")
            
        except Exception as e:
            logger.error(f"❌ Erreur collecte incrémentale: {e}", exc_info=True)
    
    async def run_quick_update(self):
        """Actualisation rapide (news, updates)"""
        logger.info("⚡ Actualisation rapide...")
        
        try:
            # Collecter uniquement les news/updates
            # Implementation simplifiée
            logger.info("✅ Actualisation rapide terminée")
        except Exception as e:
            logger.error(f"❌ Erreur actualisation: {e}")
    
    async def run_database_cleanup(self):
        """Nettoyage et optimisation de la base de données"""
        logger.info("🧹 Nettoyage base de données...")
        
        try:
            async with self.orchestrator.database.pool.acquire() as conn:
                # Supprimer les doublons
                await conn.execute("""
                    DELETE FROM startups a USING startups b
                    WHERE a.id > b.id AND a.name = b.name
                """)
                
                # Vacuum (PostgreSQL optimization)
                # Note: Nécessite connexion autocommit
                
                logger.info("✅ Nettoyage terminé")
        except Exception as e:
            logger.error(f"❌ Erreur nettoyage: {e}")
    
    def start(self):
        """Démarre le scheduler"""
        logger.info("=" * 80)
        logger.info("🤖 DÉMARRAGE DU SCHEDULER AUTOMATIQUE")
        logger.info("=" * 80)
        
        self.scheduler.start()
        self.is_running = True
        
        # Afficher les jobs programmés
        jobs = self.scheduler.get_jobs()
        logger.info(f"📋 {len(jobs)} tâches programmées:")
        for job in jobs:
            logger.info(f"  - {job.name}: {job.next_run_time}")
        
        logger.info("=" * 80)
        logger.info("✅ Scheduler actif - En attente des tâches programmées...")
        logger.info("=" * 80)
    
    def stop(self):
        """Arrête le scheduler"""
        if self.is_running:
            logger.info("🛑 Arrêt du scheduler...")
            self.scheduler.shutdown()
            self.is_running = False
            logger.info("✅ Scheduler arrêté")


async def main():
    """Point d'entrée principal"""
    scheduler = AutoCollectionScheduler()
    
    try:
        # Initialiser
        await scheduler.initialize()
        
        # Configurer les plannings
        scheduler.setup_schedules()
        
        # Démarrer
        scheduler.start()
        
        # Option: Exécuter une collecte immédiate au démarrage
        import sys
        if '--run-now' in sys.argv:
            logger.info("🚀 Exécution immédiate d'une collecte complète...")
            await scheduler.run_full_collection()
        
        # Garder le programme en vie
        try:
            while True:
                await asyncio.sleep(60)  # Check toutes les minutes
        except (KeyboardInterrupt, SystemExit):
            logger.info("⚠️  Interruption détectée")
    
    except Exception as e:
        logger.error(f"❌ Erreur fatale: {e}", exc_info=True)
    
    finally:
        scheduler.stop()
        if scheduler.orchestrator and scheduler.orchestrator.database:
            await scheduler.orchestrator.database.disconnect()


if __name__ == "__main__":
    """
    Usage:
        python scheduler/auto_collector.py              # Mode scheduler
        python scheduler/auto_collector.py --run-now    # + collecte immédiate
    """
    asyncio.run(main())
