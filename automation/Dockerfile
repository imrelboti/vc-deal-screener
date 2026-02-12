# Dockerfile
# VC Deal Screener - Data Collector

FROM python:3.11-slim

# Métadonnées
LABEL maintainer="VCDealScreener Team"
LABEL description="Automated data collection for Moroccan startups"

# Variables d'environnement
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Installer les dépendances système
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Créer répertoire de travail
WORKDIR /app

# Copier requirements et installer
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Télécharger modèle spaCy français (pour NLP)
RUN python -m spacy download fr_core_news_md

# Copier le code de l'application
COPY . .

# Créer répertoires pour logs et data
RUN mkdir -p /app/logs /app/data

# Exposer le port (si API)
EXPOSE 8000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD python -c "import sys; sys.exit(0)"

# Point d'entrée par défaut
CMD ["python", "scheduler/auto_collector.py"]
