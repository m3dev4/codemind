# 🔐 Sécurité et Protection des Routes

## ✅ Fonctionnalités Implémentées

### 1. Middleware de Protection (middleware.ts)

**Fonctionnement**:

- Intercepte toutes les requêtes avant qu'elles n'atteignent les pages
- Lit le cookie `auth` pour vérifier l'authentification
- Redirige automatiquement selon l'état d'authentification

**Règles**:

```
✅ Utilisateur NON authentifié → /dashboard → REDIRIGE vers /auth/sign-in
✅ Utilisateur authentifié → /auth/sign-in → REDIRIGE vers /dashboard
✅ Utilisateur authentifié → /dashboard → ACCÈS AUTORISÉ
✅ Utilisateur NON authentifié → /auth/sign-in → ACCÈS AUTORISÉ
```

### 2. Protection Côté Client

**Hooks Créés**:

#### `useProtectedRoute()`

- Utilisé dans le layout `(root)`
- Protège toutes les pages du dossier `(root)` automatiquement
- Affiche un loader pendant l'hydratation du store
- Redirige si non authentifié

#### `useAuthRoute()`

- Utilisé dans les pages d'authentification
- Empêche les utilisateurs connectés d'accéder aux pages auth
- Redirige vers `/dashboard` si déjà connecté

**Pages Protégées**:

- ✅ `/auth/sign-in` - Utilise `useAuthRoute()`
- ✅ `/auth/sign-up` - Utilise `useAuthRoute()`
- ✅ `/password/forgot-password` - Utilise `useAuthRoute()`
- ✅ `/password/reset-password` - Utilise `useAuthRoute()`
- ✅ `/dashboard` - Protégé par layout `(root)`

### 3. Suppression des Console.log en Production

**Configuration** (`next.config.ts`):

```typescript
compiler: {
  removeConsole: process.env.NODE_ENV === "production",
}
```

**Résultat**:

- ✅ Tous les `console.log()` supprimés automatiquement en build de production
- ✅ Aucune fuite de données sensibles dans la console
- ✅ Amélioration des performances

### 4. Gestion du Logout

**Fonction Améliorée** (`authState.ts`):

```typescript
logout: () => {
  set({ user: null, isAuthenticated: false, pendingEmail: null });
  // Clear the auth cookie
  if (typeof window !== "undefined") {
    document.cookie = "auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
  }
};
```

**Actions**:

- ✅ Réinitialise le store Zustand
- ✅ Supprime le cookie d'authentification
- ✅ Nettoie `pendingEmail`

### 5. Dashboard avec Déconnexion

**Page Dashboard**:

- ✅ Affiche les informations de l'utilisateur
- ✅ Bouton de déconnexion fonctionnel
- ✅ Appelle l'API backend `/auth/logout`
- ✅ Nettoie le store local
- ✅ Redirige vers `/auth/sign-in`

## 🔄 Flux Complet d'Authentification

### Inscription

```
1. Utilisateur accède à /auth/sign-up
   ├─ Middleware: Autorisé (non authentifié) ✅
   └─ Hook useAuthRoute: Autorisé ✅

2. Soumission du formulaire
   ├─ Backend enregistre l'utilisateur
   ├─ Backend envoie code de vérification
   └─ Frontend sauvegarde pendingEmail

3. Redirection vers /email/verify-email
   └─ Email pré-rempli automatiquement

4. Vérification avec code à 6 chiffres
   ├─ Backend valide le code
   ├─ Backend retourne user avec emailVerified=true
   └─ Frontend met à jour le store

5. Redirection vers /dashboard
   ├─ Middleware: Autorisé (authentifié) ✅
   └─ Layout (root): Autorisé ✅
```

### Connexion

```
1. Utilisateur accède à /auth/sign-in
   ├─ Middleware: Autorisé (non authentifié) ✅
   └─ Hook useAuthRoute: Autorisé ✅

2. Soumission du formulaire
   ├─ Backend valide credentials
   ├─ Backend crée JWT + session
   └─ Backend définit cookies httpOnly

3. Frontend met à jour le store
   ├─ setUser(user)
   └─ isAuthenticated = true

4. Redirection vers /dashboard
   ├─ Middleware: Autorisé (authentifié) ✅
   └─ Layout (root): Autorisé ✅
```

### Mot de Passe Oublié

```
1. Utilisateur clique "Mot de passe oublié?"
   └─ Redirige vers /password/forgot-password

2. Entre son email
   ├─ Backend envoie email avec token
   └─ Frontend affiche confirmation

3. Utilisateur clique le lien dans l'email
   └─ Redirige vers /password/reset-password?token=xxx

4. Entre nouveau mot de passe
   ├─ Backend valide token
   ├─ Backend met à jour mot de passe
   └─ Frontend redirige vers /auth/sign-in

5. Connexion avec nouveau mot de passe
   └─ Accès au dashboard
```

### Déconnexion

```
1. Utilisateur clique "Déconnexion"
   ├─ Frontend appelle POST /auth/logout
   ├─ Backend invalide session
   ├─ Backend supprime cookies JWT
   └─ Frontend nettoie le store

2. Redirection vers /auth/sign-in
   ├─ Cookie auth supprimé
   ├─ isAuthenticated = false
   └─ Middleware bloque l'accès au dashboard
```

## 🛡️ Sécurité Multi-Couches

### Couche 1: Middleware (Server-Side)

- Vérifie chaque requête
- Redirige avant même d'atteindre la page
- Rapide et efficace

### Couche 2: Layout (Client-Side)

- Protection du dossier `(root)`
- Vérifie après hydratation du store
- Double sécurité

### Couche 3: Hooks (Page-Level)

- Protection individuelle des pages auth
- Vérifie l'état d'authentification
- Redirection personnalisée

### Couche 4: Backend

- Cookies httpOnly
- JWT avec expiration
- Sessions trackées en DB
- Validation des tokens

## 📊 Matrice de Protection

| Route                       | Non Authentifié      | Authentifié       |
| --------------------------- | -------------------- | ----------------- |
| `/auth/sign-in`             | ✅ Accès             | ❌ → `/dashboard` |
| `/auth/sign-up`             | ✅ Accès             | ❌ → `/dashboard` |
| `/email/verify-email`       | ✅ Accès             | ✅ Accès          |
| `/password/forgot-password` | ✅ Accès             | ❌ → `/dashboard` |
| `/password/reset-password`  | ✅ Accès             | ❌ → `/dashboard` |
| `/dashboard`                | ❌ → `/auth/sign-in` | ✅ Accès          |

## 🧪 Tests de Sécurité

### À Vérifier

1. **Accès Direct aux URLs**

   ```
   ✅ Taper manuellement /dashboard sans être connecté
   ✅ Taper manuellement /auth/sign-in en étant connecté
   ```

2. **Refresh de Page**

   ```
   ✅ F5 sur /dashboard (doit rester si authentifié)
   ✅ F5 sur /auth/sign-in (doit rediriger si authentifié)
   ```

3. **Navigation Arrière/Avant**

   ```
   ✅ Après connexion, bouton retour ne doit pas retourner au login
   ✅ Après déconnexion, bouton avant ne doit pas accéder au dashboard
   ```

4. **Cookies**

   ```
   ✅ Supprimer manuellement cookie auth → Redirection vers login
   ✅ Modifier cookie auth → Redirection vers login
   ```

5. **Console en Production**
   ```
   ✅ Build production → Aucun console.log visible
   ✅ Aucune donnée sensible exposée
   ```

## 🚨 Points d'Attention

### ⚠️ Cookie SameSite

- Backend utilise `sameSite: "lax"` pour OAuth
- Compatible avec les redirections externes

### ⚠️ Hydratation Zustand

- Toujours vérifier `hydrated` avant de lire le store
- Afficher un loader pendant l'hydratation

### ⚠️ JWT Expiration

- Access token: 15 minutes
- Refresh token: 7 jours
- Implémenter refresh automatique (TODO)

## 📝 TODO Future

- [ ] Système de refresh automatique des tokens
- [ ] Rate limiting sur les routes sensibles
- [ ] 2FA (Two-Factor Authentication)
- [ ] Logs d'activité utilisateur
- [ ] Détection d'IP suspectes
- [ ] Session timeout automatique

---

**Documentation maintenue par**: Équipe Dev  
**Dernière révision**: Octobre 2025  
**Version**: 1.0
