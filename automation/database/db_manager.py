# database/db_manager.py
"""
Database Manager
================
Gestion de la base de données PostgreSQL pour les startups
"""

import asyncpg
import os
from typing import Dict, List, Optional
from datetime import datetime
import json
import logging

logger = logging.getLogger(__name__)


class DatabaseManager:
    """Manager pour la base de données PostgreSQL"""
    
    def __init__(self):
        self.pool = None
        self.db_config = {
            'host': os.getenv('DB_HOST', 'localhost'),
            'port': int(os.getenv('DB_PORT', 5432)),
            'database': os.getenv('DB_NAME', 'vc_deal_screener'),
            'user': os.getenv('DB_USER', 'postgres'),
            'password': os.getenv('DB_PASSWORD', 'postgres')
        }
    
    async def connect(self):
        """Établit la connexion au pool"""
        try:
            self.pool = await asyncpg.create_pool(**self.db_config, min_size=2, max_size=10)
            logger.info("✅ Connexion à PostgreSQL établie")
            
            # Créer les tables si elles n'existent pas
            await self._create_tables()
            
        except Exception as e:
            logger.error(f"❌ Erreur connexion PostgreSQL: {e}")
            raise
    
    async def disconnect(self):
        """Ferme la connexion"""
        if self.pool:
            await self.pool.close()
            logger.info("🔌 Connexion PostgreSQL fermée")
    
    async def _create_tables(self):
        """Crée les tables nécessaires"""
        
        create_tables_sql = """
        -- Table principale des startups
        CREATE TABLE IF NOT EXISTS startups (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            slug VARCHAR(255) UNIQUE,
            description TEXT,
            sector VARCHAR(100),
            stage VARCHAR(50),
            location VARCHAR(100),
            
            -- Informations financières
            funding_raised BIGINT DEFAULT 0,
            funding_currency VARCHAR(10) DEFAULT 'MAD',
            revenue BIGINT,
            
            -- Équipe
            employees INTEGER,
            founded_year INTEGER,
            founders JSONB,
            
            -- Contact
            website VARCHAR(500),
            email VARCHAR(255),
            phone VARCHAR(50),
            linkedin_url VARCHAR(500),
            
            -- Scores
            score INTEGER DEFAULT 0,
            predicted_score INTEGER,
            
            -- Métadonnées
            source VARCHAR(100),
            source_url TEXT,
            collected_at TIMESTAMP,
            updated_at TIMESTAMP DEFAULT NOW(),
            created_at TIMESTAMP DEFAULT NOW(),
            
            -- Données brutes
            raw_data JSONB,
            
            -- Flags
            verified BOOLEAN DEFAULT FALSE,
            featured BOOLEAN DEFAULT FALSE,
            active BOOLEAN DEFAULT TRUE
        );
        
        -- Table des métriques sectorielles
        CREATE TABLE IF NOT EXISTS startup_metrics (
            id SERIAL PRIMARY KEY,
            startup_id INTEGER REFERENCES startups(id) ON DELETE CASCADE,
            sector VARCHAR(100),
            
            -- Métriques génériques
            metrics JSONB,
            
            -- Timestamp
            measured_at TIMESTAMP DEFAULT NOW(),
            
            UNIQUE(startup_id, measured_at)
        );
        
        -- Table des actualités/mentions
        CREATE TABLE IF NOT EXISTS startup_news (
            id SERIAL PRIMARY KEY,
            startup_id INTEGER REFERENCES startups(id) ON DELETE CASCADE,
            
            title TEXT,
            content TEXT,
            url TEXT,
            source VARCHAR(255),
            published_at TIMESTAMP,
            
            sentiment_score FLOAT,
            
            created_at TIMESTAMP DEFAULT NOW()
        );
        
        -- Table des rounds de financement
        CREATE TABLE IF NOT EXISTS funding_rounds (
            id SERIAL PRIMARY KEY,
            startup_id INTEGER REFERENCES startups(id) ON DELETE CASCADE,
            
            round_type VARCHAR(50),
            amount BIGINT,
            currency VARCHAR(10),
            announced_date DATE,
            
            investors JSONB,
            valuation BIGINT,
            
            source VARCHAR(255),
            created_at TIMESTAMP DEFAULT NOW()
        );
        
        -- Table des logs de collecte
        CREATE TABLE IF NOT EXISTS collection_logs (
            id SERIAL PRIMARY KEY,
            
            collector_name VARCHAR(100),
            status VARCHAR(50),
            startups_collected INTEGER DEFAULT 0,
            errors INTEGER DEFAULT 0,
            
            started_at TIMESTAMP,
            completed_at TIMESTAMP,
            
            details JSONB
        );
        
        -- Index pour performance
        CREATE INDEX IF NOT EXISTS idx_startups_sector ON startups(sector);
        CREATE INDEX IF NOT EXISTS idx_startups_location ON startups(location);
        CREATE INDEX IF NOT EXISTS idx_startups_score ON startups(score);
        CREATE INDEX IF NOT EXISTS idx_startups_stage ON startups(stage);
        CREATE INDEX IF NOT EXISTS idx_startups_active ON startups(active);
        CREATE INDEX IF NOT EXISTS idx_startup_news_startup_id ON startup_news(startup_id);
        """
        
        async with self.pool.acquire() as conn:
            await conn.execute(create_tables_sql)
        
        logger.info("✅ Tables créées/vérifiées")
    
    async def startup_exists(self, name: str) -> bool:
        """Vérifie si une startup existe déjà"""
        async with self.pool.acquire() as conn:
            result = await conn.fetchval(
                "SELECT EXISTS(SELECT 1 FROM startups WHERE name = $1)",
                name
            )
            return result
    
    async def create_startup(self, data: Dict) -> int:
        """Crée une nouvelle startup"""
        
        # Générer slug
        slug = self._generate_slug(data['name'])
        
        # Préparer les données
        sql = """
        INSERT INTO startups (
            name, slug, description, sector, stage, location,
            funding_raised, funding_currency, revenue, employees, founded_year,
            website, email, phone, linkedin_url,
            score, predicted_score, source, source_url, collected_at,
            founders, raw_data, verified
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
            $16, $17, $18, $19, $20, $21, $22, $23
        )
        ON CONFLICT (name) DO NOTHING
        RETURNING id
        """
        
        async with self.pool.acquire() as conn:
            startup_id = await conn.fetchval(
                sql,
                data.get('name'),
                slug,
                data.get('description'),
                data.get('sector'),
                data.get('stage'),
                data.get('location'),
                data.get('funding_raised', 0),
                data.get('funding_currency', 'MAD'),
                data.get('revenue', 0),
                data.get('employees', 0),
                data.get('founded_year'),
                data.get('website'),
                data.get('email'),
                data.get('phone'),
                data.get('linkedin'),
                data.get('score', 0),
                data.get('predicted_score'),
                data.get('source'),
                data.get('source_url'),
                data.get('collected_at', datetime.now()),
                json.dumps(data.get('founders', [])),
                json.dumps(data),
                data.get('verified', False)
            )
            
            # Insérer les métriques si présentes
            if startup_id and data.get('metrics'):
                await self._insert_metrics(conn, startup_id, data)
            
            return startup_id
    
    async def update_startup(self, data: Dict):
        """Met à jour une startup existante"""
        
        sql = """
        UPDATE startups SET
            description = COALESCE($2, description),
            sector = COALESCE($3, sector),
            stage = COALESCE($4, stage),
            location = COALESCE($5, location),
            funding_raised = COALESCE($6, funding_raised),
            revenue = COALESCE($7, revenue),
            employees = COALESCE($8, employees),
            website = COALESCE($9, website),
            email = COALESCE($10, email),
            linkedin_url = COALESCE($11, linkedin_url),
            score = COALESCE($12, score),
            predicted_score = COALESCE($13, predicted_score),
            updated_at = NOW()
        WHERE name = $1
        RETURNING id
        """
        
        async with self.pool.acquire() as conn:
            startup_id = await conn.fetchval(
                sql,
                data.get('name'),
                data.get('description'),
                data.get('sector'),
                data.get('stage'),
                data.get('location'),
                data.get('funding_raised'),
                data.get('revenue'),
                data.get('employees'),
                data.get('website'),
                data.get('email'),
                data.get('linkedin'),
                data.get('score'),
                data.get('predicted_score')
            )
            
            # Mettre à jour les métriques
            if startup_id and data.get('metrics'):
                await self._insert_metrics(conn, startup_id, data)
    
    async def _insert_metrics(self, conn, startup_id: int, data: Dict):
        """Insère les métriques sectorielles"""
        
        sql = """
        INSERT INTO startup_metrics (startup_id, sector, metrics)
        VALUES ($1, $2, $3)
        """
        
        await conn.execute(
            sql,
            startup_id,
            data.get('sector'),
            json.dumps(data.get('metrics'))
        )
    
    async def get_all_startups(self, filters: Dict = None) -> List[Dict]:
        """Récupère toutes les startups avec filtres optionnels"""
        
        where_clauses = ["active = TRUE"]
        params = []
        param_count = 1
        
        if filters:
            if filters.get('sector'):
                where_clauses.append(f"sector = ${param_count}")
                params.append(filters['sector'])
                param_count += 1
            
            if filters.get('location'):
                where_clauses.append(f"location = ${param_count}")
                params.append(filters['location'])
                param_count += 1
            
            if filters.get('stage'):
                where_clauses.append(f"stage = ${param_count}")
                params.append(filters['stage'])
                param_count += 1
            
            if filters.get('min_score'):
                where_clauses.append(f"score >= ${param_count}")
                params.append(filters['min_score'])
                param_count += 1
        
        where_sql = " AND ".join(where_clauses)
        
        sql = f"""
        SELECT 
            id, name, description, sector, stage, location,
            funding_raised, funding_currency, revenue, employees, founded_year,
            website, email, phone, linkedin_url,
            score, predicted_score, founders,
            created_at, updated_at
        FROM startups
        WHERE {where_sql}
        ORDER BY score DESC, updated_at DESC
        """
        
        async with self.pool.acquire() as conn:
            rows = await conn.fetch(sql, *params)
            
            return [dict(row) for row in rows]
    
    async def get_startup_by_name(self, name: str) -> Optional[Dict]:
        """Récupère une startup par nom"""
        
        sql = """
        SELECT * FROM startups WHERE name = $1
        """
        
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(sql, name)
            return dict(row) if row else None
    
    async def log_collection(self, collector_name: str, stats: Dict):
        """Log une session de collecte"""
        
        sql = """
        INSERT INTO collection_logs (
            collector_name, status, startups_collected, errors,
            started_at, completed_at, details
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        """
        
        async with self.pool.acquire() as conn:
            await conn.execute(
                sql,
                collector_name,
                stats.get('status', 'completed'),
                stats.get('collected', 0),
                stats.get('errors', 0),
                stats.get('started_at'),
                stats.get('completed_at'),
                json.dumps(stats.get('details', {}))
            )
    
    def _generate_slug(self, name: str) -> str:
        """Génère un slug URL-friendly"""
        import re
        slug = name.lower()
        slug = re.sub(r'[^\w\s-]', '', slug)
        slug = re.sub(r'[-\s]+', '-', slug)
        return slug.strip('-')
    
    async def get_stats(self) -> Dict:
        """Récupère les statistiques globales"""
        
        sql = """
        SELECT 
            COUNT(*) as total_startups,
            COUNT(DISTINCT sector) as sectors_count,
            COUNT(DISTINCT location) as cities_count,
            AVG(score) as avg_score,
            SUM(funding_raised) as total_funding,
            AVG(employees) as avg_employees
        FROM startups
        WHERE active = TRUE
        """
        
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(sql)
            return dict(row) if row else {}


# Test
if __name__ == "__main__":
    import asyncio
    
    async def test():
        db = DatabaseManager()
        await db.connect()
        
        # Test création
        test_startup = {
            'name': 'TestStartup Inc',
            'description': 'Une startup de test',
            'sector': 'fintech',
            'location': 'Casablanca',
            'funding_raised': 500000,
            'employees': 10
        }
        
        startup_id = await db.create_startup(test_startup)
        print(f"Startup créée: ID {startup_id}")
        
        # Test récupération
        startups = await db.get_all_startups()
        print(f"Total startups: {len(startups)}")
        
        # Stats
        stats = await db.get_stats()
        print(f"Stats: {stats}")
        
        await db.disconnect()
    
    asyncio.run(test())
