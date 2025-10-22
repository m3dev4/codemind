# 🔐 API d'Authentification - CodeMind

Documentation complète du système d'authentification avec vérification email obligatoire.

---

## 📋 Table des Matières

1. [Flux d'Authentification](#flux-dauthentification)
2. [Endpoints API](#endpoints-api)
3. [Modèles de Données](#modèles-de-données)
4. [Variables d'Environnement](#variables-denvironnement)
5. [Tests avec cURL](#tests-avec-curl)
6. [Gestion des Erreurs](#gestion-des-erreurs)

---

## 🔄 Flux d'Authentification

### 1. Inscription & Vérification Email

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant A as API
    participant D as Database
    participant E as Email Service

    U->>A: POST /api/auth/register
    A->>D: Créer utilisateur (emailVerified=false)
    A->>E: Envoyer code à 6 chiffres
    E-->>U: Email avec code de vérification
    U->>A: POST /api/auth/verify-email + code
    A->>D: Marquer emailVerified=true
    A->>E: Envoyer email de bienvenue
    E-->>U: Email de bienvenue
    Note over U,A: L'utilisateur peut maintenant se connecter
```

### 2. Connexion

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant A as API
    participant D as Database

    U->>A: POST /api/auth/login
    A->>D: Vérifier credentials + emailVerified
    alt Email non vérifié
        A-->>U: 401 - Email non vérifié
    else Email vérifié
        A->>D: Créer session
        A-->>U: Tokens JWT + Cookie
    end
```

### 3. Réinitialisation de Mot de Passe

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant A as API
    participant D as Database
    participant E as Email Service

    U->>A: POST /api/auth/forgot-password
    A->>D: Générer token de reset
    A->>E: Envoyer email avec lien
    E-->>U: Email avec lien de reset
    U->>A: POST /api/auth/reset-password + token
    A->>D: Mettre à jour password + supprimer sessions
    A-->>U: 200 - Mot de passe réinitialisé
```

---

## 🔌 Endpoints API

### Base URL

```
http://localhost:3000/api
```

---

### 1. **Inscription** 📝

**Endpoint:** `POST /api/auth/register`

**Description:** Crée un nouvel utilisateur et envoie un code de vérification par email. Aucun token JWT n'est créé tant que l'email n'est pas vérifié.

**Body:**

```json
{
  "email": "user@example.com",
  "password": "Password123",
  "firstName": "John",
  "lastName": "Doe",
  "username": "johndoe"
}
```

**Validation:**

- `email`: Format email valide, unique
- `password`: Min 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
- `firstName`: Min 2 caractères
- `lastName`: Min 2 caractères
- `username`: Min 3 caractères, unique, alphanumerique + tirets/underscores

**Réponse Succès (201):**

```json
{
  "success": true,
  "message": "Inscription réussie. Veuillez vérifier votre email pour activer votre compte.",
  "data": {
    "user": {
      "id": "cuid...",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "username": "johndoe",
      "emailVerified": false,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  }
}
```

**Réponse Erreur (400):**

```json
{
  "success": false,
  "message": "Un compte avec cet email existe déjà"
}
```

---

### 2. **Vérification Email** ✅

**Endpoint:** `POST /api/auth/verify-email`

**Description:** Vérifie l'email avec le code à 6 chiffres reçu par email.

**Body:**

```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Validation:**

- `code`: Exactement 6 chiffres
- Expiration: 15 minutes après l'envoi

**Réponse Succès (200):**

```json
{
  "success": true,
  "message": "Email vérifié avec succès",
  "data": {
    "user": {
      "id": "cuid...",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "username": "johndoe",
      "role": "USER",
      "emailVerified": true
    }
  }
}
```

---

### 3. **Connexion** 🔑

**Endpoint:** `POST /api/auth/login`

**Description:** Connecte un utilisateur et crée une session. L'email doit être vérifié.

**Body:**

```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Réponse Succès (200):**

```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": {
      "id": "cuid...",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "username": "johndoe",
      "role": "USER"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    },
    "session": {
      "id": "cuid...",
      "expiresAt": "2025-01-08T00:00:00.000Z"
    }
  }
}
```

**Cookies définis:**

- `jwt`: Access token (httpOnly, secure, 15 minutes)
- `refreshToken`: Refresh token (httpOnly, secure, 7 jours)

**Réponse Erreur (401):**

```json
{
  "success": false,
  "message": "Veuillez vérifier votre email avant de vous connecter"
}
```

---

### 4. **Déconnexion** 🚪

**Endpoint:** `POST /api/auth/logout`

**Headers:**

```
Authorization: Bearer <accessToken>
```

**Body (optionnel):**

```json
{
  "sessionId": "cuid..."
}
```

**Réponse Succès (200):**

```json
{
  "success": true,
  "message": "Déconnexion réussie"
}
```

---

### 5. **Mot de Passe Oublié** 🔒

**Endpoint:** `POST /api/auth/forgot-password`

**Description:** Envoie un email avec un lien de réinitialisation de mot de passe.

**Body:**

```json
{
  "email": "user@example.com"
}
```

**Réponse Succès (200):**

```json
{
  "success": true,
  "message": "Si cet email existe, un lien de réinitialisation a été envoyé"
}
```

**Note:** La réponse est toujours la même (existant ou non) pour des raisons de sécurité.

---

### 6. **Réinitialiser Mot de Passe** 🔐

**Endpoint:** `POST /api/auth/reset-password`

**Description:** Réinitialise le mot de passe avec le token reçu par email.

**Body:**

```json
{
  "token": "a1b2c3d4e5f6...",
  "newPassword": "NewPassword123"
}
```

**Validation:**

- Token valide et non expiré (1 heure)
- `newPassword`: Min 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre

**Réponse Succès (200):**

```json
{
  "success": true,
  "message": "Mot de passe réinitialisé avec succès"
}
```

**Note:** Toutes les sessions existantes sont supprimées après le reset.

---

### 7. **Mon Profil** 👤

**Endpoint:** `GET /api/auth/me`

**Headers:**

```
Authorization: Bearer <accessToken>
```

**Réponse Succès (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cuid...",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "username": "johndoe",
      "role": "USER",
      "emailVerified": true,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z",
      "sessions": [
        {
          "id": "cuid...",
          "device": "Desktop",
          "browser": "Chrome",
          "os": "Windows",
          "location": "Unknown",
          "ip": "127.0.0.1",
          "createdAt": "2025-01-01T00:00:00.000Z",
          "expiresAt": "2025-01-08T00:00:00.000Z"
        }
      ]
    }
  }
}
```

---

## 📊 Modèles de Données

### User

```typescript
{
  id: string
  email: string (unique)
  firstName: string
  lastName: string
  username: string (unique)
  password: string (hashed)
  emailVerified: boolean
  emailVerificationToken: string | null
  emailVerificationExpires: string | null
  passwordResetToken: string | null
  passwordResetExpires: string | null
  createdAt: Date
  updatedAt: Date
  role: "USER" | "ADMIN"
  sessions: Session[]
}
```

### Session

```typescript
{
  id: string;
  userId: string;
  userAgent: string;
  location: string;
  expiresAt: Date;
  device: string;
  ip: string;
  os: string;
  browser: string;
  platform: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## ⚙️ Variables d'Environnement

Créez un fichier `.env` à la racine du projet backend :

```env
# Application
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/codemind"

# Redis
REDIS_USERNAME=default
REDIS_PASSWORD=your_redis_password
REDIS_SOCKET=localhost
REDIS_PORT=6379

# Email (Resend)
RESEND_KEY=re_your_resend_api_key

# JWT
JWT_SECRET_KEY=your_secret_key_here  # Générer avec: openssl rand -base64 32
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Frontend
FRONTEND_URL=http://localhost:3000
```

---

## 🧪 Tests avec cURL

### 1. Inscription

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

### 2. Vérification Email

```bash
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "code": "123456"
  }'
```

### 3. Connexion

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

### 4. Profil (avec cookie)

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -b cookies.txt
```

### 5. Déconnexion

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
```

---

## ❌ Gestion des Erreurs

Toutes les réponses d'erreur suivent ce format :

```json
{
  "success": false,
  "message": "Description de l'erreur"
}
```

### Codes d'erreur courants

| Code  | Description                           |
| ----- | ------------------------------------- |
| `400` | Mauvaise requête / Validation échouée |
| `401` | Non authentifié / Email non vérifié   |
| `404` | Ressource non trouvée                 |
| `500` | Erreur serveur interne                |

---

## 📧 Templates Email

Trois templates HTML professionnels sont fournis :

1. **Email de Vérification** : Code à 6 chiffres, expire en 15 minutes
2. **Email de Bienvenue** : Envoyé après vérification réussie
3. **Email de Reset Password** : Lien avec token, expire en 1 heure

---

## 🔒 Sécurité

### Mesures Implémentées

- ✅ Mots de passe hashés avec bcrypt (12 rounds)
- ✅ JWT avec expiration (15min access, 7j refresh)
- ✅ Cookies httpOnly et secure
- ✅ Validation Zod sur toutes les entrées
- ✅ CORS configuré
- ✅ Helmet pour headers de sécurité
- ✅ Rate limiting recommandé (à implémenter)
- ✅ Session tracking avec device info

---

## 📚 Prochaines Étapes

1. Implémenter le rate limiting sur les endpoints sensibles
2. Ajouter la blacklist de tokens pour révocation
3. Implémenter le refresh token rotation
4. Ajouter la 2FA (authentification à deux facteurs)
5. Mettre en place les tests unitaires et d'intégration

---

## 🆘 Support

Pour toute question ou problème :

- Email : support@codemind.com
- Documentation : [Lien vers la doc]
- Issues : [GitHub Issues]
