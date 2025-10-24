# 🚀 Démarrage Rapide - API CodeMind

Guide pour démarrer l'API d'authentification en 5 minutes.

---

## ✅ Prérequis

- Node.js 18+ installé
- PostgreSQL installé et en cours d'exécution
- Redis installé et en cours d'exécution
- Compte Resend (pour les emails)

---

## 📦 Installation

### 1. Installer les dépendances

```bash
cd backend
npm install
```

### 2. Configurer l'environnement

Créez un fichier `.env` à partir de l'exemple :

```bash
cp .env.example .env
```

Éditez `.env` et remplissez les valeurs :

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/codemind?schema=public"

# Resend (Email)
RESEND_KEY=re_your_api_key_here

# JWT Secrets (générer avec: openssl rand -base64 32)
JWT_SECRET_KEY=your_generated_secret_here
JWT_REFRESH_SECRET=your_generated_refresh_secret_here
```

### 3. Générer les secrets JWT

```bash
# Sur Linux/Mac
openssl rand -base64 32

# Sur Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Copiez le résultat dans `JWT_SECRET_KEY` et générez-en un autre pour `JWT_REFRESH_SECRET`.

### 4. Créer le fichier de config (si nécessaire)

```bash
cp src/config/env/env.Config.example.ts src/config/env/env.Config.ts
```

### 5. Initialiser la base de données

```bash
# Générer le client Prisma
npx prisma generate

# Créer les tables
npx prisma migrate dev --name init

# (Optionnel) Voir la base de données
npx prisma studio
```

---

## 🎯 Démarrer le serveur

### Mode Développement

```bash
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

### Mode Production

```bash
# Build
npm run build

# Start
npm start
```

---

## 🧪 Tester l'API

### 1. Vérifier que le serveur fonctionne

```bash
curl http://localhost:3000/api/health
```

Réponse attendue :

```json
{
  "success": true,
  "message": "API CodeMind - Serveur opérationnel",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### 2. Tester l'inscription

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456",
    "firstName": "Test",
    "lastName": "User",
    "username": "testuser"
  }'
```

**Attendu :** Email avec code à 6 chiffres envoyé (vérifiez votre boîte mail).

### 3. Vérifier l'email

```bash
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "code": "123456"
  }'
```

Remplacez `123456` par le code reçu par email.

### 4. Se connecter

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

**Attendu :** Tokens JWT retournés et cookies définis.

### 5. Accéder au profil

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -b cookies.txt
```

**Attendu :** Informations du profil utilisateur.

---

## 📁 Structure des Fichiers Créés

```
backend/
├── src/
│   ├── controllers/
│   │   └── auth.controller.ts           # Logique des endpoints auth
│   ├── services/
│   │   ├── auth.service.ts              # Business logic auth
│   │   └── email.service.ts             # Service d'envoi d'emails
│   ├── routes/
│   │   ├── auth.routes.ts               # Routes d'authentification
│   │   ├── user.routes.ts               # Routes utilisateur
│   │   └── index.ts                     # Router principal
│   ├── middlewares/
│   │   ├── authMiddleware.ts            # Vérification JWT (amélioré)
│   │   └── validateMiddleware.ts        # Validation Zod
│   ├── validations/
│   │   └── auth.validation.ts           # Schémas Zod
│   ├── templates/
│   │   ├── emailVerification.ts         # Template email vérification
│   │   ├── welcomeEmail.ts              # Template email bienvenue
│   │   └── resetPasswordEmail.ts        # Template reset password
│   ├── utils/
│   │   ├── crypto.ts                    # Fonctions de hashing/génération
│   │   ├── jwt.ts                       # Gestion des JWT
│   │   └── deviceInfo.ts                # Extraction info device
│   └── index.ts                         # Point d'entrée principal (mis à jour)
├── .env.example                         # Template de configuration
├── AUTH_API_DOCUMENTATION.md            # Documentation complète
├── QUICK_START.md                       # Ce fichier
└── package.json
```

---

## 🔧 Commandes Utiles

### Base de données

```bash
# Créer une nouvelle migration
npx prisma migrate dev --name <nom_migration>

# Appliquer les migrations en production
npx prisma migrate deploy

# Réinitialiser la base de données
npx prisma migrate reset

# Ouvrir Prisma Studio
npx prisma studio
```

### Développement

```bash
# Démarrer en mode dev (avec hot reload)
npm run dev

# Linter le code
npm run lint

# Formater le code
npm run format

# Build pour production
npm run build
```

---

## 🐛 Dépannage

### Erreur : "JWT_SECRET_KEY is not defined"

**Solution :** Vérifiez que votre fichier `.env` contient bien `JWT_SECRET_KEY` et `JWT_REFRESH_SECRET`.

### Erreur : "RESEND_KEY is not defined"

**Solution :** Créez un compte sur [Resend](https://resend.com), obtenez votre clé API et ajoutez-la dans `.env`.

### Erreur de connexion à la base de données

**Solution :** Vérifiez que PostgreSQL est démarré et que `DATABASE_URL` dans `.env` est correct.

### Les emails ne sont pas envoyés

**Solutions :**

1. Vérifiez que `RESEND_KEY` est valide
2. Vérifiez que le domaine est vérifié dans Resend
3. En développement, utilisez un domaine test fourni par Resend

### Erreur : "Port already in use"

**Solution :** Changez le port dans `.env` :

```env
PORT=3001
```

---

## 📚 Documentation Complète

Pour la documentation complète de l'API, consultez :

- [AUTH_API_DOCUMENTATION.md](./AUTH_API_DOCUMENTATION.md)
- [AUTH_IMPROVEMENTS.md](./AUTH_IMPROVEMENTS.md) (recommandations de sécurité)

---

## 🎉 C'est Prêt !

Votre API d'authentification est maintenant fonctionnelle avec :

✅ Inscription avec validation  
✅ Vérification email obligatoire (code à 6 chiffres)  
✅ Connexion avec JWT  
✅ Gestion des sessions  
✅ Réinitialisation de mot de passe  
✅ Emails HTML professionnels  
✅ Sécurité renforcée

---

## 🚀 Prochaines Étapes

1. Configurer le frontend pour consommer l'API
2. Implémenter le rate limiting
3. Ajouter la blacklist de tokens
4. Configurer le monitoring (Sentry, DataDog, etc.)
5. Déployer en production

Bon développement ! 🎊
