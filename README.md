# VitalSync

Application de suivi medical et sportif conteneurisee avec pipeline CI/CD.

## Architecture

```
                  ┌─────────────┐
                  │   Client    │
                  └──────┬──────┘
                         │ HTTP
                  ┌──────▼──────┐
                  │   Nginx     │ :80
                  │  (Frontend) │
                  └──────┬──────┘
                         │ /api → proxy_pass
                  ┌──────▼──────┐
                  │  Node.js    │ :3000
                  │  (Backend)  │
                  └──────┬──────┘
                         │ SQL
                  ┌──────▼──────┐
                  │ PostgreSQL  │ :5432
                  │  (Database) │
                  └─────────────┘
```

**Stack technique :**
- **Backend** : Node.js 20 / Express (API REST)
- **Frontend** : HTML/JS servi par Nginx (avec proxy inverse vers le backend)
- **Base de donnees** : PostgreSQL 16
- **Conteneurisation** : Docker + Docker Compose
- **CI/CD** : GitHub Actions
- **Orchestration** : Kubernetes (manifestes YAML)

## Prerequis

- [Docker](https://docs.docker.com/get-docker/) et Docker Compose
- [Git](https://git-scm.com/)
- Node.js 20+ (pour le developpement local)

## Lancement avec Docker Compose

```bash
# 1. Cloner le depot
git clone https://github.com/ibrahima-gh/vitalsync.git
cd vitalsync

# 2. Configurer les variables d'environnement
cp .env.example .env

# 3. Lancer les 3 services
docker compose up -d --build

# 4. Verifier que tout fonctionne
curl http://localhost:3000/health   # Backend
curl http://localhost               # Frontend
```

## Arret des services

```bash
docker compose down          # Arrete les conteneurs (garde les donnees)
docker compose down -v       # Arrete et supprime les volumes (perte de donnees)
```

## Pipeline CI/CD

La pipeline GitHub Actions s'execute automatiquement :
- **Sur push vers `develop`** : lint, tests, build Docker, deploiement staging
- **Sur Pull Request vers `main`** : lint, tests, build Docker

### Etapes de la pipeline

| Etape | Description |
|-------|-------------|
| **Lint & Tests** | Installation des dependances, ESLint, tests Jest |
| **Build Docker** | Construction des images backend/frontend, push vers GHCR avec tag SHA |
| **Deploy Staging** | Deploiement via Docker Compose, health check automatique |

### Secrets necessaires

| Secret | Role |
|--------|------|
| `GITHUB_TOKEN` | Automatique - acces au GitHub Container Registry |

## Deploiement Kubernetes

```bash
# Appliquer les manifestes
kubectl apply -f k8s/namespace.yml
kubectl apply -f k8s/secret.yml
kubectl apply -f k8s/deployment.yml
kubectl apply -f k8s/service.yml
kubectl apply -f k8s/frontend-deployment.yml
kubectl apply -f k8s/ingress.yml

# Verifier les pods
kubectl get pods -n vitalsync
```

## Structure du projet

```
vitalsync/
├── backend/
│   ├── Dockerfile           # Multi-stage build (Node 20 Alpine)
│   ├── .dockerignore
│   ├── server.js            # Serveur Express (API REST)
│   ├── package.json
│   └── test/
│       └── health.test.js   # Tests unitaires Jest
├── frontend/
│   ├── Dockerfile           # Image Nginx Alpine
│   ├── .dockerignore
│   ├── index.html           # Interface utilisateur
│   └── nginx.conf           # Configuration Nginx + proxy inverse
├── k8s/
│   ├── namespace.yml        # Namespace vitalsync
│   ├── secret.yml           # Secrets PostgreSQL
│   ├── deployment.yml       # Deployment backend (2 replicas)
│   ├── service.yml          # Service ClusterIP backend
│   ├── frontend-deployment.yml  # Deployment + Service frontend
│   └── ingress.yml          # Ingress pour acces externe
├── .github/
│   └── workflows/
│       └── ci-cd.yml        # Pipeline CI/CD GitHub Actions
├── docker-compose.yml       # Orchestration des 3 services
├── .env.example             # Variables d'environnement (template)
├── .gitignore
└── README.md
```

## Choix techniques et justifications

- **Node 20 Alpine** : image legere (~180 Mo vs ~1 Go pour l'image complete), reduit la surface d'attaque
- **Multi-stage build** : separe build/tests de la production, image finale plus petite et sans devDependencies
- **Nginx comme reverse proxy** : sert les fichiers statiques et redirige `/api` vers le backend, evite les problemes CORS
- **Reseau bridge Docker** : isolation des conteneurs, communication par nom de service (DNS interne)
- **Volume persistant PostgreSQL** : les donnees survivent aux redemarrages des conteneurs
- **GHCR (GitHub Container Registry)** : integre nativement a GitHub Actions, pas besoin de credentials externes
- **Tag SHA du commit** : chaque image est tracable vers un commit precis, facilitant le debug et le rollback
- **Liveness probe Kubernetes** : redemarrage automatique du pod si `/health` ne repond plus
- **2 replicas backend** : haute disponibilite, zero downtime lors des mises a jour
