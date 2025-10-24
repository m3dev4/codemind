# Guide d'utilisation des Middlewares Arcjet

## Configuration

Assurez-vous d'avoir ajouté votre clé API Arcjet dans le fichier `.env` :

```env
ARCJECT_SECRET_KEY=your_arcjet_api_key_here
```

Obtenez votre clé API sur : https://app.arcjet.com

## Middlewares disponibles

### 1. `arcjetProtect` - Protection standard

Protection par défaut avec détection de bots et rate limiting modéré.

**Configuration :**

- Shield: Mode LIVE
- Bot Detection: Autorise les moteurs de recherche, monitoring et preview
- Rate Limiting: 5 requêtes toutes les 10 secondes

**Utilisation :**

```typescript
import { arcjetProtect } from "../middlewares/arcjet.middleware";

router.get("/api/data", arcjetProtect, (req, res) => {
  // Votre code ici
});
```

### 2. `arcjetAuthProtect` - Protection authentification

Protection stricte pour les endpoints d'authentification.

**Configuration :**

- Shield: Mode LIVE
- Rate Limiting: 3 requêtes toutes les 5 minutes

**Utilisation :**

```typescript
import { arcjetAuthProtect } from "../middlewares/arcjet.middleware";

router.post("/api/auth/login", arcjetAuthProtect, (req, res) => {
  // Logique de login
});

router.post("/api/auth/register", arcjetAuthProtect, (req, res) => {
  // Logique d'inscription
});
```

### 3. `arcjetPublicProtect` - Protection publique

Protection souple pour les endpoints publics.

**Configuration :**

- Shield: Mode LIVE
- Bot Detection: Autorise uniquement les moteurs de recherche
- Rate Limiting: 100 requêtes par minute

**Utilisation :**

```typescript
import { arcjetPublicProtect } from "../middlewares/arcjet.middleware";

router.get("/api/public/blog", arcjetPublicProtect, (req, res) => {
  // Contenu public
});
```

### 4. `arcjetCriticalProtect` - Protection critique

Protection très stricte pour les actions critiques.

**Configuration :**

- Shield: Mode LIVE
- Rate Limiting: 1 requête par minute

**Utilisation :**

```typescript
import { arcjetCriticalProtect } from "../middlewares/arcjet.middleware";

router.post("/api/admin/delete-user", arcjetCriticalProtect, (req, res) => {
  // Action critique
});

router.post("/api/payment/process", arcjetCriticalProtect, (req, res) => {
  // Traitement de paiement
});
```

### 5. `arcjetProtectUser` - Protection par utilisateur

Protection avec identification de l'utilisateur pour un rate limiting personnalisé.

**Utilisation :**

```typescript
import { arcjetProtectUser } from "../middlewares/arcjet.middleware";

// Fonction pour extraire l'userId de la requête
const getUserId = (req: Request) => req.user?.id || req.ip;

router.post(
  "/api/user/action",
  authMiddleware, // D'abord authentifier
  arcjetProtectUser(getUserId), // Puis protéger avec Arcjet
  (req, res) => {
    // Votre code ici
  },
);
```

## Exemples d'utilisation complète

### Route d'authentification

```typescript
import { Router } from "express";
import { arcjetAuthProtect } from "../middlewares/arcjet.middleware";

const authRouter = Router();

authRouter.post("/login", arcjetAuthProtect, loginController);
authRouter.post("/register", arcjetAuthProtect, registerController);
authRouter.post("/forgot-password", arcjetAuthProtect, forgotPasswordController);

export default authRouter;
```

### Routes utilisateur protégées

```typescript
import { Router } from "express";
import { arcjetProtect } from "../middlewares/arcjet.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";

const userRouter = Router();

// Protéger toutes les routes utilisateur
userRouter.use(authMiddleware);
userRouter.use(arcjetProtect);

userRouter.get("/profile", getUserProfile);
userRouter.put("/profile", updateUserProfile);

export default userRouter;
```

### Routes publiques

```typescript
import { Router } from "express";
import { arcjetPublicProtect } from "../middlewares/arcjet.middleware";

const publicRouter = Router();

publicRouter.get("/blog", arcjetPublicProtect, getBlogPosts);
publicRouter.get("/blog/:id", arcjetPublicProtect, getBlogPost);

export default publicRouter;
```

## Codes de réponse

### 429 - Too Many Requests

Rate limit dépassé. L'utilisateur doit attendre avant de réessayer.

### 403 - Forbidden

- Bot détecté
- Activité suspecte détectée (Shield)
- Accès refusé

### 500 - Internal Server Error

Erreur du middleware Arcjet.

## Logs

Chaque middleware log les décisions Arcjet dans la console :

```javascript
Arcjet Decision: {
  id: "dec_...",
  conclusion: "ALLOW" | "DENY",
  ip: "192.168.1.1",
  reason: { ... }
}
```

## Notes importantes

1. **Ne pas appliquer globalement** : Les middlewares Arcjet doivent être appliqués sur des routes spécifiques, pas sur toute l'application.

2. **Ordre des middlewares** : Appliquer Arcjet AVANT la logique métier mais APRÈS l'authentification si nécessaire.

3. **Mode de développement** : Tous les middlewares sont en mode `LIVE`. Changez en `DRY_RUN` pour tester sans bloquer les requêtes.

4. **Personnalisation** : Modifiez les configurations dans `src/config/arcject/arrject.ts` selon vos besoins.
