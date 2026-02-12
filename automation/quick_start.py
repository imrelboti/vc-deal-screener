#!/usr/bin/env python3
"""
Quick Start Script - VC Deal Screener Phase 2
==============================================
Script de démarrage rapide pour tester le système
"""

import asyncio
import sys
import os
from pathlib import Path

# Ajouter le répertoire parent au path
sys.path.insert(0, str(Path(__file__).parent))

async def quick_start():
    """Démarrage rapide du système"""
    
    print("=" * 80)
    print("🚀 VC DEAL SCREENER - PHASE 2: QUICK START")
    print("=" * 80)
    print()
    
    # Étape 1: Vérifier l'environnement
    print("📋 Étape 1/5: Vérification environnement...")
    
    # Vérifier Python version
    if sys.version_info < (3, 9):
        print("❌ Python 3.9+ requis")
        sys.exit(1)
    print("   ✅ Python version OK")
    
    # Vérifier .env
    if not os.path.exists('.env'):
        print("   ⚠️  Fichier .env manquant")
        print("   📝 Copier .env.example vers .env et configurer")
        
        # Créer .env basique
        with open('.env', 'w') as f:
            f.write("DB_HOST=localhost\n")
            f.write("DB_PORT=5432\n")
            f.write("DB_NAME=vc_deal_screener\n")
            f.write("DB_USER=postgres\n")
            f.write("DB_PASSWORD=postgres\n")
            f.write("\n# Ajouter vos API keys ici\n")
            f.write("CRUNCHBASE_API_KEY=\n")
            f.write("SERPER_API_KEY=\n")
        
        print("   ✅ Fichier .env créé (à configurer)")
    else:
        print("   ✅ Fichier .env trouvé")
    
    # Étape 2: Vérifier les dépendances
    print("\n📦 Étape 2/5: Vérification dépendances...")
    
    try:
        import aiohttp
        import asyncpg
        import bs4
        print("   ✅ Dépendances principales installées")
    except ImportError as e:
        print(f"   ❌ Dépendance manquante: {e}")
        print("   📝 Installer avec: pip install -r requirements.txt")
        sys.exit(1)
    
    # Étape 3: Tester connexion PostgreSQL
    print("\n🔌 Étape 3/5: Test connexion PostgreSQL...")
    
    try:
        from database.db_manager import DatabaseManager
        
        db = DatabaseManager()
        await db.connect()
        
        # Tester requête simple
        stats = await db.get_stats()
        
        print(f"   ✅ Connexion PostgreSQL OK")
        print(f"   📊 Startups en base: {stats.get('total_startups', 0)}")
        
        await db.disconnect()
        
    except Exception as e:
        print(f"   ⚠️  Connexion PostgreSQL échouée: {e}")
        print("   📝 Vérifier que PostgreSQL est lancé et .env configuré")
        print("   💡 Ou utiliser Docker: docker-compose up -d postgres")
    
    # Étape 4: Test collecteur (mode démo)
    print("\n🎯 Étape 4/5: Test collecteur...")
    
    try:
        from collectors.google_search_collector import GoogleSearchCollector
        from collectors.local_sources_collector import LocalSourcesCollector
        
        # Test avec collecteur local (pas besoin d'API)
        collector = LocalSourcesCollector()
        startups = await collector.collect()
        
        print(f"   ✅ Collecteur testé: {len(startups)} startups collectées")
        
        if startups:
            print(f"   📝 Exemple: {startups[0].get('name')} ({startups[0].get('sector')})")
        
    except Exception as e:
        print(f"   ❌ Erreur test collecteur: {e}")
    
    # Étape 5: Test ML Pipeline
    print("\n🤖 Étape 5/5: Test ML Pipeline...")
    
    try:
        from ml.classification_pipeline import MLClassificationPipeline
        
        pipeline = MLClassificationPipeline()
        await pipeline.load_models()
        
        # Test classification
        sector = await pipeline.classify_sector(
            "Plateforme de paiement mobile pour PME",
            "PayTech"
        )
        
        print(f"   ✅ ML Pipeline OK")
        print(f"   📝 Test classification: '{sector}'")
        
    except Exception as e:
        print(f"   ⚠️  ML Pipeline: {e}")
    
    # Résumé final
    print("\n" + "=" * 80)
    print("✅ QUICK START TERMINÉ")
    print("=" * 80)
    print()
    print("📖 Prochaines étapes:")
    print()
    print("1. Configurer les API keys dans .env:")
    print("   - CRUNCHBASE_API_KEY (recommandé)")
    print("   - SERPER_API_KEY (optionnel)")
    print()
    print("2. Lancer une collecte test:")
    print("   python main_orchestrator.py")
    print()
    print("3. Ou lancer le scheduler automatique:")
    print("   python scheduler/auto_collector.py")
    print()
    print("4. Voir les données dans PostgreSQL:")
    print("   psql -U postgres -d vc_deal_screener")
    print("   SELECT * FROM startups;")
    print()
    print("=" * 80)


if __name__ == "__main__":
    asyncio.run(quick_start())
