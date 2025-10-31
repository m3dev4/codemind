# 🛡️ Système de Protection des Routes

## Vue d'ensemble

Le système de protection des routes combine un middleware Next.js et des hooks React pour sécuriser l'accès aux différentes parties de l'application.

## 🔐 Architecture

### 1. Middleware Next.js (`middleware.ts`)

**Emplacement**: Racine du projet frontend

**Fonctionnalités**:

- ✅ Vérifie le cookie `auth` pour déterminer l'état d'authentification
- ✅ Protège les routes `(root)` (dashboard, etc.) pour les utilisateurs authentifiés
- ✅ Bloque l'accès aux routes d'authentification pour les utilisateurs connectés
- ✅ Effectue les redirections automatiques

**Routes protégées** (nécessitent authentification):

```typescript
["/dashboard"];
```

**Routes d'authentification** (bloquées si connecté):

```typescript
[
  "/auth/sign-in",
  "/auth/sign-up",
  "/email/verify-email",
  "/password/forgot-password",
  "/password/reset-password",
];
```

### 2. Hooks de Protection (`useProtectedRoute.ts`)

#### `useProtectedRoute()`

- Protège les routes côté client
- Redirige vers `/auth/sign-in` si non authentifié
- Attend l'hydratation du store avant de vérifier

**Utilisation**:

```typescript
import { useProtectedRoute } from "@/hooks/auth/useProtectedRoute";

const ProtectedPage = () => {
  const { isAuthenticated, hydrated } = useProtectedRoute();
  // Votre code...
};
```

#### `useAuthRoute()`

- Protège les pages d'authentification
- Redirige vers `/dashboard` si déjà authentifié
- Empêche les utilisateurs connectés d'accéder au login/signup

**Utilisation**:

```typescript
import { useAuthRoute } from "@/hooks/auth/useProtectedRoute";

const SignInPage = () => {
  useAuthRoute();
  // Votre code...
};
```

### 3. Layout Protégé (`app/(root)/layout.tsx`)

**Caractéristiques**:

- Layout pour toutes les pages du dossier `(root)`
- Utilise `useProtectedRoute()` automatiquement
- Affiche un loader pendant l'hydratation
- Affiche un loader pendant la redirection

## 🚀 Flux d'Authentification

### Utilisateur Non Authentifié

1. **Tente d'accéder à `/dashboard`**
   - Middleware détecte: non authentifié
   - → Redirection vers `/auth/sign-in`

2. **Accède à `/auth/sign-in`**
   - Middleware: Autorisé ✅
   - Hook `useAuthRoute()`: Autorisé ✅

### Utilisateur Authentifié

1. **Tente d'accéder à `/auth/sign-in`**
   - Middleware détecte: authentifié
   - → Redirection vers `/dashboard`

2. **Accède à `/dashboard`**
   - Middleware: Autorisé ✅
   - Layout `(root)`: Autorisé ✅

## 🔒 Sécurité

### Protection en Production

**Suppression des console.log** (`next.config.ts`):

```typescript
compiler: {
  removeConsole: process.env.NODE_ENV === "production",
}
```

- ✅ Tous les `console.log()` sont automatiquement supprimés en production
- ✅ Empêche les fuites de données sensibles
- ✅ Améliore les performances

### Cookie d'Authentification

Le middleware lit le cookie `auth` créé par Zustand persist:

```typescript
const authCookie = request.cookies.get("auth");
const authData = JSON.parse(decodeURIComponent(authCookie.value));
const isAuthenticated = authData?.state?.isAuthenticated === true;
```

## 📝 Ajout d'une Nouvelle Route

### Route Protégée (nécessite authentification)

1. **Ajouter dans `middleware.ts`**:

```typescript
const protectedRoutes = [
  "/dashboard",
  "/profile", // Nouvelle route
];
```

2. **Placer dans le dossier `(root)`**:

```
app/
  (root)/
    profile/
      page.tsx
```

Le layout `(root)` protégera automatiquement la route ✅

### Route d'Authentification

1. **Ajouter dans `middleware.ts`**:

```typescript
const authRoutes = [
  "/auth/sign-in",
  "/auth/new-page", // Nouvelle route
];
```

2. **Utiliser le hook dans la page**:

```typescript
const NewAuthPage = () => {
  useAuthRoute();
  // ...
};
```

## 🧪 Tests

### Scénarios à Tester

1. ✅ **Utilisateur non connecté → `/dashboard`**
   - Résultat: Redirection vers `/auth/sign-in`

2. ✅ **Utilisateur connecté → `/auth/sign-in`**
   - Résultat: Redirection vers `/dashboard`

3. ✅ **Refresh de page sur route protégée**
   - Résultat: Reste sur la page (si authentifié) ou redirige (si non authentifié)

4. ✅ **Déconnexion**
   - Résultat: Accès aux routes protégées bloqué, redirection vers sign-in

## 🔧 Configuration

### Variables d'Environnement

Aucune variable spécifique nécessaire pour le middleware.

### Dépendances

- `zustand` - Store d'authentification
- `zustand/middleware` - Persistence du store
- Next.js 14+ - Middleware support

## 🎯 Bonnes Pratiques

1. ✅ Toujours utiliser `useAuthRoute()` sur les pages d'authentification
2. ✅ Toujours placer les pages protégées dans `(root)`
3. ✅ Mettre à jour `middleware.ts` lors de l'ajout de nouvelles routes
4. ✅ Tester en mode développement ET production
5. ✅ Vérifier les cookies dans DevTools

## 🐛 Débogage

### La redirection ne fonctionne pas

1. Vérifier le cookie `auth` dans DevTools
2. Vérifier que `isAuthenticated` est `true` dans le store
3. Vérifier les logs du middleware (en dev)

### Boucle de redirection

1. Vérifier que les routes sont bien catégorisées
2. Vérifier que le cookie est bien créé après login
3. Vérifier l'hydratation du store

---

**Dernière mise à jour**: Octobre 2025
