# Publivite - Gestionnaire d'annonces Leboncoin

Application web pour gérer et publier automatiquement des annonces sur Leboncoin.

## Fonctionnalités

- ✅ Gestion d'annonces (78 catégories Leboncoin)
- ✅ Formulaires dynamiques avec champs conditionnels
- ✅ Galerie d'images
- ✅ Gestion de comptes Leboncoin multiples
- ✅ Publication automatique sur Leboncoin (Playwright)
- ✅ Tâches planifiées (immédiates, programmées, récurrentes)
- ✅ Historique des publications
- ✅ Statistiques avancées avec graphiques
- ✅ Système de crédits
- ✅ Interface moderne et responsive

## Technologies

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- PostgreSQL + Prisma
- Redis + Bull/BullMQ
- Playwright
- Zustand (state management)

## Installation locale

```bash
# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos configurations

# Initialiser la base de données
npx prisma generate
npx prisma db push

# Démarrer l'application
npm run dev

# Démarrer le worker (dans un autre terminal)
npm run worker
```

## Déploiement sur Railway

1. Pousser le code sur GitHub
2. Créer un projet Railway
3. Ajouter PostgreSQL et Redis
4. Configurer les variables d'environnement
5. Créer un service Worker séparé
6. Déployer !

## Variables d'environnement

Voir `.env.example` pour la liste complète.

## Licence

Propriétaire
