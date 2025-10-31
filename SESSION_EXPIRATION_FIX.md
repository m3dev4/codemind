# 🔧 Correction : Gestion automatique de l'expiration de session

## 🐛 Problème identifié

L'application présentait une **incohérence critique** :

- ✅ L'utilisateur était considéré comme connecté côté **frontend** (state Zustand)
- ❌ Le token JWT était **expiré** ou **invalide**
- ❌ Les requêtes API retournaient une **erreur 401**
- ❌ **L'utilisateur restait connecté** et voyait juste un message d'erreur

### Impact utilisateur
- Confusion : "Pourquoi je vois une erreur alors que je suis connecté ?"
- Mauvaise UX : Erreur technique affichée sans solution claire
- Sécurité : Sessions "zombies" côté frontend

---

## ✅ Solution implémentée

### 1. Intercepteur Axios global

**Fichier** : `frontend/utils/axios.ts`

```typescript
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      
      if (!currentPath.includes("/auth/sign-in")) {
        const { useAuthState } = await import("@/stores/auth/authState");
        const { logout } = useAuthState.getState();
        
        logout(); // Nettoyage complet
        window.location.href = "/auth/sign-in?session_expired=true";
      }
    }
    return Promise.reject(error);
  }
);
```

**Ce que ça fait** :
- ✅ Détecte automatiquement toutes les erreurs 401
- ✅ Déconnecte l'utilisateur (clear state, cookies, localStorage)
- ✅ Redirige vers la page de connexion
- ✅ Évite les boucles infinies

---

### 2. Message informatif sur la page de connexion

**Fichier** : `frontend/app/(auth)/auth/sign-in/page.tsx`

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

**Ce que ça fait** :
- ✅ Détecte le paramètre `session_expired=true`
- ✅ Affiche un toast clair et informatif
- ✅ Guide l'utilisateur vers la reconnexion

---

### 3. Composant d'erreur amélioré

**Fichier** : `frontend/components/sessions/SessionsError.tsx`

```typescript
// Détection spécifique erreur 401
const is401Error = error?.message?.includes("401") || 
                   error?.message?.toLowerCase().includes("unauthorized");

// Redirection de sécurité
useEffect(() => {
  if (is401Error) {
    const timer = setTimeout(() => {
      logout();
      router.push("/auth/sign-in?session_expired=true");
    }, 2000);
    return () => clearTimeout(timer);
  }
}, [is401Error, logout, router]);
```

**Ce que ça fait** :
- ✅ Affiche un message spécifique "Session expirée"
- ✅ Icône dédiée (LogOut)
- ✅ Redirection automatique après 2 secondes
- ✅ Backup au cas où l'intercepteur ne fonctionne pas

---

### 4. Hook TanStack Query optimisé

**Fichier** : `frontend/hooks/auth/useSessionsQuery.ts`

```typescript
retry: (failureCount, error: any) => {
  // Ne pas retry si c'est une erreur 401
  if (error?.response?.status === 401) {
    return false;
  }
  // Retry 2 fois pour les autres erreurs
  return failureCount < 2;
}
```

**Ce que ça fait** :
- ✅ Pas de retry inutile pour les erreurs 401
- ✅ Déconnexion immédiate sans délai
- ✅ Économise des ressources

---

## 📊 Avant vs Après

### ❌ AVANT

```
Utilisateur sur /parametres/sessions
    ↓
Requête GET /users/sessions
    ↓
Backend retourne 401
    ↓
Erreur affichée : "Request failed with status code 401"
    ↓
Utilisateur reste connecté ❌
État incohérent ❌
Confusion totale ❌
```

### ✅ APRÈS

```
Utilisateur sur /parametres/sessions
    ↓
Requête GET /users/sessions
    ↓
Backend retourne 401
    ↓
Intercepteur détecte l'erreur 401
    ↓
logout() appelé automatiquement
    ↓
State nettoyé (Zustand + cookies + localStorage)
    ↓
Redirection → /auth/sign-in?session_expired=true
    ↓
Toast : "Votre session a expiré. Veuillez vous reconnecter."
    ↓
Utilisateur comprend et peut se reconnecter ✅
```

---

## 📁 Fichiers modifiés

1. ✅ `frontend/utils/axios.ts` - Intercepteur ajouté
2. ✅ `frontend/app/(auth)/auth/sign-in/page.tsx` - Détection session expirée
3. ✅ `frontend/components/sessions/SessionsError.tsx` - UI erreur 401
4. ✅ `frontend/hooks/auth/useSessionsQuery.ts` - Stratégie retry améliorée

## 📝 Fichiers de documentation créés

1. 📖 `AUTHENTICATION_FLOW.md` - Documentation complète du flux d'authentification
2. 📖 `SESSION_EXPIRATION_FIX.md` - Ce fichier (résumé de la correction)

---

## 🧪 Comment tester

### Test 1: Simulation session expirée

1. Se connecter normalement
2. Ouvrir DevTools → Application → Cookies
3. Supprimer ou modifier le cookie d'authentification
4. Naviguer vers `/parametres/[firstName]/[id]/sessions`
5. **Résultat attendu** :
   - Redirection automatique vers `/auth/sign-in`
   - Toast : "Votre session a expiré..."
   - State complètement nettoyé

### Test 2: Token naturellement expiré

1. Se connecter
2. Attendre que le token expire (ou le forcer en modifiant l'expiration)
3. Essayer de charger les sessions
4. **Résultat attendu** :
   - Déconnexion automatique
   - Redirection
   - Message clair

### Test 3: Vérification état cohérent

1. Après redirection post-401
2. Vérifier dans DevTools :
   - State Zustand : `isAuthenticated: false, user: null`
   - Cookies : Supprimés
   - LocalStorage : Nettoyé
3. **Résultat attendu** :
   - Tout est propre ✅

---

## 🎯 Bénéfices

### Sécurité 🔒
- ✅ Pas de sessions "zombies" côté frontend
- ✅ État toujours synchronisé avec le backend
- ✅ Déconnexion immédiate en cas de token invalide

### UX 🎨
- ✅ Message clair et compréhensible
- ✅ Redirection automatique fluide
- ✅ Pas d'erreur technique brute affichée
- ✅ L'utilisateur sait quoi faire

### Maintenance 🛠️
- ✅ Solution centralisée (intercepteur Axios)
- ✅ Fonctionne pour TOUTES les requêtes API
- ✅ Pas besoin de gérer ça dans chaque composant
- ✅ Code propre et réutilisable

### Performance ⚡
- ✅ Pas de retry inutile pour erreurs 401
- ✅ Déconnexion immédiate
- ✅ Économie de ressources

---

## 🚀 Améliorations futures possibles

### 1. Refresh Token automatique
Implémenter un système de refresh token avant expiration pour éviter les déconnexions fréquentes.

### 2. Avertissement avant expiration
```typescript
// Toast 2-3 minutes avant expiration
"Votre session va expirer dans 2 minutes. Cliquez pour prolonger."
```

### 3. Sauvegarde intention navigation
```typescript
// Sauvegarder où l'utilisateur voulait aller
localStorage.setItem("redirectAfterLogin", currentPath);
// Après connexion, y retourner
```

### 4. Métrique de sessions expirées
Tracker combien de fois les utilisateurs se font déconnecter pour ajuster la durée des tokens.

---

## ✅ Checklist de validation

- [x] Intercepteur Axios configuré
- [x] Détection erreur 401 fonctionnelle
- [x] Déconnexion automatique implémentée
- [x] Redirection avec paramètre
- [x] Message informatif sur login
- [x] Composant d'erreur amélioré
- [x] Stratégie retry optimisée
- [x] Tests manuels effectués
- [x] Documentation créée

---

## 📞 Support

Pour toute question :
- Consulter `AUTHENTICATION_FLOW.md` pour le flux complet
- Vérifier les logs de l'intercepteur dans la console
- Tester avec différents scénarios d'expiration

---

**Status** : ✅ Correction implémentée et testée  
**Date** : 31 Octobre 2025  
**Impact** : Critique - Améliore sécurité et UX
