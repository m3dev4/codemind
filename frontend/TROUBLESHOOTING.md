# 🔍 Guide de Dépannage - Authentification

## Problème: Bloqué sur la page de connexion après login

### ✅ Corrections Apportées

1. **Cookie Auth maintenant mis à jour automatiquement**
   - Ajout de `updateAuthCookie()` appelé à chaque modification du store
   - Création de `setAuthenticated()` pour mettre à jour `isAuthenticated` + cookie

2. **Fix dans `useAuth.ts`**
   - Utilisation de `setAuthenticated(true)` au lieu de `setState()`
   - Garantit que le cookie est créé lors de la connexion

3. **Composant de Debug Ajouté**
   - Panel en bas à droite montrant l'état d'authentification
   - Visible uniquement en mode développement

### 🧪 Tests à Effectuer

#### Test 1: Connexion Basique

```bash
1. Ouvrir la page /auth/sign-in
2. Observer le panel de debug en bas à droite
3. Vérifier que "Hydrated: ✅ Yes" apparaît
4. Vérifier que "Authenticated: ❌ No"
5. Entrer credentials et se connecter
6. Observer les changements dans le panel de debug:
   - "Authenticated" devrait passer à "✅ Yes"
   - "User" devrait afficher le nom
   - "Cookie" devrait afficher "✅ Set"
7. La page devrait rediriger vers /dashboard automatiquement
```

#### Test 2: Vérifier les Cookies

```bash
1. Ouvrir DevTools (F12)
2. Aller dans l'onglet "Application" (Chrome) ou "Storage" (Firefox)
3. Dans la section "Cookies"
4. Chercher le cookie "auth"
5. Vérifier qu'il contient:
   {
     "state": {
       "user": {...},
       "isAuthenticated": true,
       "pendingEmail": null
     },
     "version": 0
   }
```

#### Test 3: Middleware

```bash
1. Se connecter
2. Ouvrir DevTools > Network
3. Naviguer vers /dashboard
4. Vérifier qu'il n'y a PAS de redirection vers /auth/sign-in
5. Naviguer vers /auth/sign-in
6. Vérifier qu'il Y A une redirection vers /dashboard
```

### 🐛 Si ça ne fonctionne toujours pas

#### Vérification 1: Store Zustand

Ouvrir la console et taper:

```javascript
// Vérifier le store
const store = JSON.parse(localStorage.getItem("auth"));
console.log(store);
// Devrait afficher: { state: { user: {...}, isAuthenticated: true, ... }, version: 0 }
```

#### Vérification 2: Cookie

Dans la console:

```javascript
// Vérifier le cookie
console.log(document.cookie);
// Devrait contenir: auth=...
```

#### Vérification 3: Backend Response

Dans DevTools > Network:

```bash
1. Connectez-vous
2. Trouvez la requête POST /auth/login
3. Vérifiez la Response:
   {
     "status": "success",
     "data": {
       "user": {...}
     }
   }
4. L'utilisateur doit avoir toutes les propriétés (firstName, lastName, email, etc.)
```

### 🔧 Solutions Possibles

#### Problème: Cookie pas créé

**Solution 1**: Vider le cache

```bash
1. Ctrl + Shift + Delete (Chrome/Edge)
2. Cocher "Cookies" et "Cache"
3. Cliquer "Clear data"
4. Redémarrer le navigateur
5. Réessayer la connexion
```

**Solution 2**: Vérifier localStorage

```javascript
// Console
localStorage.clear();
location.reload();
```

#### Problème: useAuthRoute ne redirige pas

**Cause**: Le hook vérifie le store avant qu'il ne soit mis à jour

**Solution**: Le setTimeout dans signIn devrait aider:

```typescript
// Dans useAuth.ts - signIn onSuccess
onSuccess: (data) => {
  const { setUser, setAuthenticated } = useAuthState.getState();
  if (data.data?.user) {
    setUser(data.data.user);
    setAuthenticated(true);
    // Petit délai pour laisser le store et le cookie se mettre à jour
    setTimeout(() => {
      router.push("/dashboard");
    }, 100);
  }
};
```

#### Problème: Middleware ne détecte pas l'authentification

**Cause**: Le cookie n'est pas encore créé lors de la navigation

**Solution**: Forcer le reload après connexion

```typescript
// Alternative dans signIn
router.push("/dashboard");
window.location.href = "/dashboard"; // Force un reload complet
```

### 📊 Checklist de Débogage

- [ ] Le panel de debug affiche "Authenticated: ✅ Yes" après connexion
- [ ] Le panel de debug affiche "Cookie: ✅ Set"
- [ ] localStorage contient la clé "auth" avec les bonnes données
- [ ] document.cookie contient "auth="
- [ ] La requête POST /auth/login retourne status 200
- [ ] L'utilisateur a toutes les propriétés requises
- [ ] Le middleware.ts existe à la racine du projet
- [ ] La redirection vers /dashboard est appelée

### 🆘 Dernier Recours

Si rien ne fonctionne:

1. **Supprimer le composant AuthDebug** de sign-in (c'est juste pour debug)

2. **Redémarrer le serveur de dev**:

```bash
# Tuer le processus
Ctrl + C

# Nettoyer
rm -rf .next

# Redémarrer
npm run dev
```

3. **Vérifier les versions**:

```bash
node --version  # Devrait être >= 18
npm --version
```

4. **Vérifier les dépendances**:

```bash
npm install zustand@latest next@latest
```

### 📧 Informations à Fournir

Si le problème persiste, noter:

- Messages dans le panel de debug
- Contenu de localStorage.getItem('auth')
- Contenu de document.cookie
- Response de POST /auth/login
- Messages d'erreur dans la console
- Version de Next.js et Node.js

---

**Créé**: Octobre 2025  
**Dernière mise à jour**: Après fix du cookie
