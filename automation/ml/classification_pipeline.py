# ml/classification_pipeline.py
"""
Pipeline ML de Classification
==============================
Classification automatique de secteur, extraction d'entités, analyse de sentiment
"""

import asyncio
from typing import Dict, List, Optional
import re
import logging
from collections import Counter

logger = logging.getLogger(__name__)


class MLClassificationPipeline:
    """Pipeline ML pour classification et extraction"""
    
    def __init__(self):
        self.sector_classifier = SectorClassifier()
        self.entity_extractor = EntityExtractor()
        self.sentiment_analyzer = SentimentAnalyzer()
        self.models_loaded = False
    
    async def load_models(self):
        """Charge les modèles ML"""
        logger.info("🤖 Chargement des modèles ML...")
        
        # Dans une implémentation complète, charger des modèles pré-entraînés
        # from transformers import pipeline
        # self.classifier = pipeline("text-classification")
        
        self.models_loaded = True
        logger.info("✅ Modèles ML chargés")
    
    async def classify_sector(self, description: str, name: str) -> str:
        """Classifie le secteur d'une startup"""
        return await self.sector_classifier.classify(description, name)
    
    async def extract_entities(self, text: str) -> Dict:
        """Extrait les entités (founders, tech stack, etc.)"""
        return await self.entity_extractor.extract(text)
    
    async def analyze_sentiment(self, news_texts: List[str]) -> float:
        """Analyse le sentiment des actualités"""
        return await self.sentiment_analyzer.analyze(news_texts)


class SectorClassifier:
    """Classificateur de secteur basé sur keywords et ML"""
    
    def __init__(self):
        # Keywords par secteur (peut être remplacé par un modèle ML entraîné)
        self.sector_keywords = {
            'fintech': {
                'primary': ['fintech', 'paiement', 'banking', 'finance', 'monétique',
                           'mobile money', 'wallet', 'assurance', 'insurtech', 'crédit'],
                'secondary': ['transaction', 'carte', 'virement', 'compte', 'épargne']
            },
            'ai': {
                'primary': ['intelligence artificielle', 'ia', 'ai', 'machine learning',
                           'ml', 'deep learning', 'neural', 'computer vision', 'nlp',
                           'traitement langage', 'reconnaissance'],
                'secondary': ['algorithme', 'prédictif', 'automatisation', 'apprentissage']
            },
            'healthtech': {
                'primary': ['santé', 'médical', 'health', 'télémédecine', 'e-santé',
                           'diagnostic', 'biotech', 'pharmaceutique', 'thérapie'],
                'secondary': ['patient', 'médecin', 'hôpital', 'clinique', 'soin']
            },
            'edtech': {
                'primary': ['éducation', 'formation', 'e-learning', 'edtech', 'école',
                           'cours', 'apprentissage', 'enseignement', 'tutoring'],
                'secondary': ['élève', 'étudiant', 'professeur', 'classe', 'pédagogie']
            },
            'ecommerce': {
                'primary': ['e-commerce', 'marketplace', 'vente en ligne', 'boutique',
                           'commerce électronique', 'shop', 'retail'],
                'secondary': ['achat', 'vente', 'produit', 'catalogue', 'panier']
            },
            'agritech': {
                'primary': ['agriculture', 'agritech', 'farming', 'agri', 'irrigation',
                           'smart farming', 'récolte', 'culture'],
                'secondary': ['fermier', 'sol', 'crop', 'semence', 'tracteur']
            },
            'cleantech': {
                'primary': ['énergie', 'cleantech', 'solaire', 'renouvelable',
                           'environnement', 'recyclage', 'green', 'durable'],
                'secondary': ['panneau', 'déchet', 'carbone', 'pollution', 'écologie']
            },
            'logistics': {
                'primary': ['logistique', 'livraison', 'delivery', 'transport',
                           'supply chain', 'fret', 'expédition'],
                'secondary': ['colis', 'entrepôt', 'stock', 'distribution', 'chauffeur']
            },
            'saas': {
                'primary': ['saas', 'cloud', 'software', 'logiciel', 'plateforme',
                           'application', 'api', 'service'],
                'secondary': ['abonnement', 'utilisateur', 'interface', 'dashboard']
            },
            'proptech': {
                'primary': ['immobilier', 'proptech', 'real estate', 'logement',
                           'appartement', 'location'],
                'secondary': ['propriété', 'bail', 'locataire', 'agence', 'maison']
            }
        }
    
    async def classify(self, description: str, name: str = '') -> str:
        """Classifie le secteur"""
        text = f"{name} {description}".lower()
        
        # Calcul du score par secteur
        scores = {}
        
        for sector, keywords in self.sector_keywords.items():
            score = 0
            
            # Primary keywords (poids 3)
            for keyword in keywords['primary']:
                if keyword in text:
                    score += 3
            
            # Secondary keywords (poids 1)
            for keyword in keywords['secondary']:
                if keyword in text:
                    score += 1
            
            scores[sector] = score
        
        # Retourner le secteur avec le score le plus élevé
        if scores:
            best_sector = max(scores.items(), key=lambda x: x[1])
            if best_sector[1] > 0:
                return best_sector[0]
        
        return 'other'
    
    def classify_with_ml(self, description: str):
        """
        Classification avec modèle ML pré-entraîné
        
        Dans une implémentation complète:
        from transformers import pipeline
        classifier = pipeline("text-classification", 
                            model="distilbert-base-uncased-finetuned-sst-2-english")
        result = classifier(description)
        """
        pass


class EntityExtractor:
    """Extracteur d'entités (founders, technologies, etc.)"""
    
    async def extract(self, text: str) -> Dict:
        """Extrait les entités depuis le texte"""
        entities = {
            'founders': self._extract_founders(text),
            'technologies': self._extract_technologies(text),
            'partnerships': self._extract_partnerships(text),
            'funding_info': self._extract_funding_info(text)
        }
        
        return entities
    
    def _extract_founders(self, text: str) -> List[str]:
        """Extrait les noms de fondateurs"""
        founders = []
        
        # Patterns pour identifier les fondateurs
        patterns = [
            r'fondé(?:e)? par ([A-Z][a-z]+ [A-Z][a-z]+)',
            r'créé(?:e)? par ([A-Z][a-z]+ [A-Z][a-z]+)',
            r'(?:CEO|founder|co-founder)(?:\s*:)?\s*([A-Z][a-z]+ [A-Z][a-z]+)',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text)
            founders.extend(matches)
        
        return list(set(founders))  # Dédupliquer
    
    def _extract_technologies(self, text: str) -> List[str]:
        """Extrait les technologies mentionnées"""
        tech_keywords = [
            'python', 'react', 'node', 'angular', 'vue', 'django', 'flask',
            'tensorflow', 'pytorch', 'kubernetes', 'docker', 'aws', 'azure',
            'blockchain', 'iot', 'api', 'mobile', 'web', 'cloud'
        ]
        
        text_lower = text.lower()
        found_tech = [tech for tech in tech_keywords if tech in text_lower]
        
        return found_tech
    
    def _extract_partnerships(self, text: str) -> List[str]:
        """Extrait les partenariats mentionnés"""
        partnerships = []
        
        # Pattern: "partenariat avec X", "collaboration avec Y"
        patterns = [
            r'partenariat (?:avec |)([A-Z][a-zA-Z\s]+)',
            r'collaboration (?:avec |)([A-Z][a-zA-Z\s]+)',
            r's\'associe (?:avec |à |)([A-Z][a-zA-Z\s]+)',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text)
            partnerships.extend([m.strip() for m in matches])
        
        return partnerships
    
    def _extract_funding_info(self, text: str) -> Dict:
        """Extrait les informations de financement"""
        info = {
            'amount': None,
            'round_type': None,
            'investors': []
        }
        
        # Montant
        amount_patterns = [
            r'(\d+(?:,\d+)?)\s*(?:millions?|M)\s*(?:MAD|EUR|USD|\$)',
            r'(\d+(?:\.\d+)?)\s*(?:millions?|M)\s*(?:MAD|EUR|USD|\$)',
        ]
        
        for pattern in amount_patterns:
            match = re.search(pattern, text)
            if match:
                info['amount'] = match.group(0)
                break
        
        # Type de round
        round_types = ['seed', 'pre-seed', 'series a', 'series b', 'amorçage']
        text_lower = text.lower()
        for round_type in round_types:
            if round_type in text_lower:
                info['round_type'] = round_type
                break
        
        return info


class SentimentAnalyzer:
    """Analyseur de sentiment pour les actualités"""
    
    def __init__(self):
        # Dictionnaire de mots positifs/négatifs en français
        self.positive_words = [
            'succès', 'croissance', 'innovation', 'excellent', 'leader',
            'expansion', 'record', 'réussite', 'performant', 'prometteur'
        ]
        
        self.negative_words = [
            'échec', 'problème', 'difficulté', 'crise', 'faillite',
            'licenciement', 'perte', 'baisse', 'retard', 'risque'
        ]
    
    async def analyze(self, texts: List[str]) -> float:
        """
        Analyse le sentiment
        Retourne un score entre -1 (très négatif) et 1 (très positif)
        """
        if not texts:
            return 0.0
        
        total_score = 0
        total_words = 0
        
        for text in texts:
            text_lower = text.lower()
            
            # Compter mots positifs et négatifs
            positive_count = sum(1 for word in self.positive_words if word in text_lower)
            negative_count = sum(1 for word in self.negative_words if word in text_lower)
            
            # Score pour ce texte
            score = (positive_count - negative_count) / max(len(text.split()), 1)
            total_score += score
            total_words += 1
        
        # Score moyen normalisé
        avg_score = total_score / max(total_words, 1)
        
        # Normaliser entre -1 et 1
        return max(-1, min(1, avg_score * 10))


# Test
if __name__ == "__main__":
    async def test():
        pipeline = MLClassificationPipeline()
        await pipeline.load_models()
        
        # Test classification
        sector = await pipeline.classify_sector(
            "Plateforme de paiement mobile pour PME", 
            "PayTech"
        )
        print(f"Secteur classifié: {sector}")
        
        # Test extraction
        entities = await pipeline.extract_entities(
            "Fondé par Ahmed Alami et Sara Bennani, utilise Python et React"
        )
        print(f"Entités: {entities}")
        
        # Test sentiment
        sentiment = await pipeline.analyze_sentiment([
            "La startup connaît une croissance exceptionnelle",
            "Levée de fonds record pour cette jeune entreprise"
        ])
        print(f"Sentiment: {sentiment}")
    
    asyncio.run(test())
