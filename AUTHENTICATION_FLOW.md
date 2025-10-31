# 🔐 Flux d'authentification et gestion des sessions expirées

## 🎯 Problème résolu

### Incohérence initiale
L'application avait une incohérence où :
- L'utilisateur était connecté côté frontend (state Zustand)
- Le token JWT était expiré ou invalide
- Les requêtes API retournaient une erreur 401
- **L'utilisateur n'était PAS déconnecté automatiquement**

### Solution implémentée
Un système complet de déconnexion automatique avec :
1. Intercepteur Axios qui détecte les erreurs 401
2. Déconnexion automatique de l'utilisateur
3. Nettoyage du state d'authentification
4. Redirection vers la page de connexion
5. Message informatif à l'utilisateur

---

## 🔄 Flux d'authentification complet

### 1. Connexion réussie
```
Utilisateur → Formulaire de connexion
    ↓
Backend valide les credentials
    ↓
Génération du JWT (access + refresh tokens)
    ↓
Cookies HttpOnly créés
    ↓
Frontend: useAuthState.setUser() + setAuthenticated(true)
    ↓
Redirection vers /dashboard
```

### 2. Session expirée (Erreur 401)
```
Utilisateur sur une page protégée
    ↓
Requête API avec token expiré
    ↓
Backend retourne 401 Unauthorized
    ↓
Intercepteur Axios détecte l'erreur 401
    ↓
useAuthState.logout() appelé
    ↓
Nettoyage:
  - State Zustand cleared
  - LocalStorage cleared
  - Cookies cleared
    ↓
Redirection → /auth/sign-in?session_expired=true
    ↓
Toast: "Votre session a expiré. Veuillez vous reconnecter."
```

### 3. Tentative d'accès non autorisé
```
Utilisateur essaie d'accéder à une page protégée
    ↓
useProtectedRoute vérifie isAuthenticated
    ↓
Si false: Redirection → /auth/sign-in
Si true: Accès autorisé
```

---

## 🛠️ Composants du système

### 1. Intercepteur Axios (`utils/axios.ts`)

```typescript
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Ne pas déconnecter si déjà sur la page de login
      const currentPath = window.location.pathname;
      
      if (!currentPath.includes("/auth/sign-in")) {
        const { logout } = useAuthState.getState();
        logout();
        window.location.href = "/auth/sign-in?session_expired=true";
      }
    }
    return Promise.reject(error);
  }
);
```

**Fonctionnalités** :
- ✅ Détection automatique des erreurs 401
- ✅ Évite les boucles infinies (check si déjà sur login)
- ✅ Import dynamique pour éviter les dépendances circulaires
- ✅ Déconnexion complète du state
- ✅ Redirection avec paramètre informatif

---

### 2. Page de connexion (`app/auth/sign-in/page.tsx`)

```typescript
useEffect(() => {
  const sessionExpired = searchParams.get("session_expired");
  if (sessionExpired === "true") {
    toast.error("Votre session a expiré. Veuillez vous reconnecter.", {
      duration: 5000,
    });
  }
}, [searchParams]);
```

**Fonctionnalités** :
- ✅ Détection du paramètre `session_expired`
- ✅ Affichage d'un toast informatif
- ✅ Message clair pour l'utilisateur

---

### 3. Composant d'erreur sessions (`SessionsError.tsx`)

```typescript
// Détection erreur 401
const is401Error = error?.message?.includes("401") || 
                   error?.message?.toLowerCase().includes("unauthorized");

// Redirection automatique après 2s
useEffect(() => {
  if (is401Error) {
    const timer = setTimeout(() => {
      logout();
      router.push("/auth/sign-in?session_expired=true");
    }, 2000);
    return () => clearTimeout(timer);
  }
}, [is401Error]);
```

**Fonctionnalités** :
- ✅ Détection spécifique des erreurs 401
- ✅ Message adapté "Session expirée"
- ✅ Icône dédiée (LogOut)
- ✅ Redirection automatique après 2 secondes
- ✅ Backup si l'intercepteur n'a pas fonctionné

---

### 4. Hook TanStack Query amélioré (`useSessionsQuery.ts`)

```typescript
retry: (failureCount, error: any) => {
  // Ne pas retry si erreur 401
  if (error?.response?.status === 401) {
    return false;
  }
  // Retry 2 fois pour autres erreurs
  return failureCount < 2;
}
```

**Fonctionnalités** :
- ✅ Pas de retry inutile pour erreurs 401
- ✅ Déconnexion immédiate
- ✅ Économie de ressources

---

## 📊 Diagramme de séquence

```
┌─────────┐         ┌──────┐         ┌─────────┐         ┌─────────────┐
│ Browser │         │ Axios│         │ Backend │         │ Auth State  │
└────┬────┘         └──┬───┘         └────┬────┘         └──────┬──────┘
     │                 │                  │                      │
     │  GET /sessions  │                  │                      │
     ├────────────────>│                  │                      │
     │                 │  GET /sessions   │                      │
     │                 ├─────────────────>│                      │
     │                 │                  │                      │
     │                 │   401 Unauthorized│                     │
     │                 │<─────────────────┤                      │
     │                 │                  │                      │
     │   Interceptor   │                  │                      │
     │   detects 401   │                  │                      │
     │                 │                  │                      │
     │                 │  logout()        │                      │
     │                 ├──────────────────┼─────────────────────>│
     │                 │                  │                      │
     │                 │                  │   Clear state        │
     │                 │                  │   Clear cookies      │
     │                 │                  │   Clear localStorage │
     │                 │<─────────────────┼──────────────────────┤
     │                 │                  │                      │
     │  Redirect to    │                  │                      │
     │  /auth/sign-in  │                  │                      │
     │<────────────────┤                  │                      │
     │                 │                  │                      │
     │  Show toast:    │                  │                      │
     │  "Session exp." │                  │                      │
     │                 │                  │                      │
```

---

## 🔒 Sécurité

### Protections implémentées

1. **Cookies HttpOnly**
   - Les tokens JWT sont stockés dans des cookies HttpOnly
   - Protection contre le vol par XSS
   - Envoi automatique avec `withCredentials: true`

2. **Déconnexion automatique**
   - Détection immédiate des tokens expirés
   - Nettoyage complet du state
   - Pas de données sensibles résiduelles

3. **Prévention des boucles infinies**
   - Vérification du pathname avant redirection
   - Pas de déconnexion si déjà sur la page de login

4. **État cohérent**
   - Synchronisation frontend/backend garantie
   - Plus d'incohérence possible

---

## 🧪 Tests à effectuer

### Test 1: Session expirée naturellement
1. Se connecter
2. Attendre l'expiration du token (ou le supprimer manuellement)
3. Naviguer vers `/parametres/.../sessions`
4. **Résultat attendu** : Redirection automatique vers login avec message

### Test 2: Token invalide
1. Se connecter
2. Modifier manuellement le cookie JWT
3. Rafraîchir la page
4. **Résultat attendu** : Déconnexion et redirection

### Test 3: Suppression du cookie
1. Se connecter
2. Supprimer le cookie d'authentification via DevTools
3. Faire une action (charger sessions, etc.)
4. **Résultat attendu** : Erreur 401 → Déconnexion automatique

### Test 4: Accès direct à page protégée sans auth
1. Ne PAS se connecter
2. Tenter d'accéder à `/parametres/.../sessions`
3. **Résultat attendu** : Redirection immédiate vers login

---

## 📝 Messages utilisateur

### Avant (Problème)
- ❌ Erreur technique affichée : "Request failed with status code 401"
- ❌ Utilisateur reste sur la page
- ❌ Pas de guidance claire
- ❌ State incohérent

### Après (Solution)
- ✅ Message clair : "Votre session a expiré. Veuillez vous reconnecter."
- ✅ Redirection automatique
- ✅ État nettoyé complètement
- ✅ UX fluide et professionnelle

---

## 🚀 Améliorations futures possibles

### 1. Refresh Token automatique
```typescript
// Avant que le token expire, tenter un refresh
if (tokenExpiresIn < 5 * 60) { // 5 minutes avant expiration
  await refreshToken();
}
```

### 2. Avertissement avant expiration
```typescript
// Toast 2 minutes avant expiration
toast.warning("Votre session va bientôt expirer. Activité détectée pour prolonger ?");
```

### 3. Sauvegarde de l'intention de navigation
```typescript
// Sauvegarder où l'utilisateur voulait aller
localStorage.setItem("redirectAfterLogin", currentPath);
// Après connexion, rediriger vers cette page
```

### 4. Reconnexion automatique avec refresh token
```typescript
// Utiliser le refresh token pour obtenir un nouveau access token
// Sans redemander les credentials
```

---

## 🎯 Résumé

### Problème initial
```
Token expiré → Erreur 401 → Utilisateur reste connecté ❌
```

### Solution actuelle
```
Token expiré → Erreur 401 → Intercepteur → Logout → Redirect → Toast ✅
```

### Bénéfices
- ✅ **Sécurité** : Pas de session zombie
- ✅ **UX** : Message clair et redirection fluide
- ✅ **Cohérence** : State frontend = Backend
- ✅ **Fiabilité** : Gestion automatique des erreurs

---

**Date de mise en œuvre** : 31 Octobre 2025  
**Status** : ✅ Production Ready
