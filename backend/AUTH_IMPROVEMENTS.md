# 🔐 Améliorations du Système d'Authentification

## ✅ Corrections Appliquées

### 1. **Singleton Prisma**
- ✅ Remplacement de `new PrismaClient()` par l'import du singleton
- **Bénéfice** : Évite les fuites mémoire et les connexions multiples

### 2. **Correction du Type maxAge**
- ✅ Ajout de la fonction `parseExpiryToMs()` pour convertir les durées en millisecondes
- **Bénéfice** : Les cookies expirent correctement

### 3. **Gestion d'Erreurs Améliorée**
- ✅ Logger conditionnel basé sur l'environnement
- ✅ Messages d'erreur plus descriptifs
- **Bénéfice** : Sécurité en production, debug facile en dev

### 4. **Token Renewal avec Nouveau JTI**
- ✅ Génération d'un UUID unique lors du renouvellement
- **Bénéfice** : Meilleure traçabilité et possibilité de révocation

### 5. **Vérifications JWT Optimisées**
- ✅ Suppression de la vérification d'expiration redondante
- ✅ Gestion spécifique des erreurs JWT
- **Bénéfice** : Code plus propre et performant

### 6. **Correction Typo**
- ✅ `jwtScret` → `jwtSecret`
- **Bénéfice** : Meilleure lisibilité

### 7. **Cookie Secure Dynamique**
- ✅ `secure: config.NODE_ENV === "production"`
- **Bénéfice** : Fonctionne en dev (HTTP) et prod (HTTPS)

---

## 🚀 Recommandations Supplémentaires

### 1. **Implémenter Token Blacklist (Haute Priorité)**

#### Schéma Prisma
```prisma
model TokenBlacklist {
  id        String   @id @default(uuid())
  jti       String   @unique
  userId    String
  reason    String?  // "logout", "password_change", "security"
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@index([jti])
  @@index([expiresAt])
}
```

#### Code dans authMiddleware.ts (lignes 45-51 - décommenter et adapter)
```typescript
const isBlacklisted = await prisma.tokenBlacklist.findUnique({
  where: { jti: decoded.jti }
});

if (isBlacklisted) {
  throw new Error("Token has been revoked");
}
```

#### Service de Logout
```typescript
export const revokeToken = async (jti: string, userId: string, reason: string) => {
  await prisma.tokenBlacklist.create({
    data: {
      jti,
      userId,
      reason,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
    },
  });
};
```

---

### 2. **Rate Limiting sur les Endpoints d'Auth**

```typescript
import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives max
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Usage: app.post('/api/login', authLimiter, loginHandler);
```

---

### 3. **Refresh Token Rotation**

```typescript
interface RefreshTokenPayload {
  userId: string;
  jti: string;
  tokenFamily: string; // Pour détecter le replay
}

// À chaque refresh, invalider l'ancien et créer un nouveau
const refreshAccessToken = async (refreshToken: string) => {
  const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET) as RefreshTokenPayload;
  
  // Vérifier si déjà utilisé (rotation breach)
  const isUsed = await prisma.refreshTokenUsage.findUnique({
    where: { jti: decoded.jti }
  });
  
  if (isUsed) {
    // Token replay détecté - révoquer toute la famille
    await revokeTokenFamily(decoded.tokenFamily);
    throw new Error('Token replay detected');
  }
  
  // Marquer comme utilisé
  await prisma.refreshTokenUsage.create({
    data: { jti: decoded.jti, usedAt: new Date() }
  });
  
  // Générer nouveaux tokens
  return generateTokenPair(decoded.userId, decoded.tokenFamily);
};
```

---

### 4. **CSRF Protection pour Cookies**

```typescript
import csrf from 'csurf';

const csrfProtection = csrf({ 
  cookie: {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

// Envoyer le token CSRF au client
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});
```

---

### 5. **Audit Log des Authentifications**

```prisma
model AuthLog {
  id        String   @id @default(uuid())
  userId    String?
  action    String   // "login", "logout", "token_refresh", "failed_login"
  ipAddress String
  userAgent String
  success   Boolean
  reason    String?
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([createdAt])
}
```

---

### 6. **Device Fingerprinting**

```typescript
import Fingerprint from 'express-fingerprint';

app.use(Fingerprint());

// Stocker le fingerprint dans le token
const token = jwt.sign(
  {
    userId: user.id,
    deviceId: req.fingerprint.hash,
  },
  jwtSecret
);

// Valider dans le middleware
if (decoded.deviceId !== req.fingerprint.hash) {
  throw new Error('Device mismatch - potential token theft');
}
```

---

### 7. **Améliorer la Configuration JWT**

```typescript
// Dans env.Config.ts
export const jwtConfig = {
  access: {
    secret: getEnv('JWT_SECRET_KEY'),
    expiry: getEnv('JWT_ACCESS_EXPIRY', '15m'), // Court pour la sécurité
    algorithm: 'HS256' as const,
  },
  refresh: {
    secret: getEnv('JWT_REFRESH_SECRET'),
    expiry: getEnv('JWT_REFRESH_EXPIRY', '7d'),
    algorithm: 'HS256' as const,
  },
  options: {
    issuer: 'codemind-api',
    audience: 'codemind-client',
  }
};

// Utilisation
jwt.sign(payload, jwtConfig.access.secret, {
  expiresIn: jwtConfig.access.expiry,
  algorithm: jwtConfig.access.algorithm,
  issuer: jwtConfig.options.issuer,
  audience: jwtConfig.options.audience,
});
```

---

### 8. **Tests Unitaires Critiques**

```typescript
import { describe, it, expect } from 'vitest';
import { verifyToken } from './authMiddleware';

describe('Auth Middleware', () => {
  it('should reject expired tokens', async () => {
    const expiredToken = generateExpiredToken();
    await expect(verifyToken(expiredToken, jwtSecret))
      .rejects.toThrow('Token has expired');
  });

  it('should reject blacklisted tokens', async () => {
    const token = generateValidToken();
    await blacklistToken(token.jti);
    await expect(verifyToken(token.raw, jwtSecret))
      .rejects.toThrow('Token has been revoked');
  });

  it('should renew token when < 24h expiry', async () => {
    // Test du renouvellement automatique
  });
});
```

---

## 📊 Priorités d'Implémentation

### 🔴 Haute Priorité (Sécurité Critique)
1. ✅ Correction du maxAge (FAIT)
2. ✅ Utilisation du singleton Prisma (FAIT)
3. **Token Blacklist** (À FAIRE)
4. **Rate Limiting** (À FAIRE)

### 🟡 Moyenne Priorité (Sécurité Renforcée)
5. **Refresh Token Rotation** (À FAIRE)
6. **CSRF Protection** (À FAIRE)
7. **Audit Logs** (À FAIRE)

### 🟢 Basse Priorité (Nice to Have)
8. Device Fingerprinting
9. Tests unitaires complets
10. Monitoring avec Sentry/DataDog

---

## 🔍 Checklist de Validation

- [x] Les cookies expirent correctement
- [x] Pas de fuite mémoire Prisma
- [x] Logs sécurisés en production
- [x] Token renewal avec nouveau JTI
- [ ] Tokens révoqués ne peuvent pas être utilisés
- [ ] Rate limiting sur login/register
- [ ] CSRF protection activée
- [ ] Audit logs en place
- [ ] Tests de sécurité écrits

---

## 📚 Ressources

- [OWASP JWT Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [Token-Based Authentication Guide](https://auth0.com/docs/secure/tokens/refresh-tokens/refresh-token-rotation)
