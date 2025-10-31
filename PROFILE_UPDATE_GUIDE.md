# 📝 Guide de mise à jour du profil utilisateur

## ✨ Fonctionnalité implémentée

### Problème résolu
**Avant** : L'utilisateur devait remplir **tous les champs** pour mettre à jour son profil.  
**Après** : L'utilisateur peut modifier **uniquement les champs qu'il souhaite** ✅

---

## 🎯 Comment ça fonctionne

### 1. Validation flexible

**Fichier** : `frontend/validations/user/user.validation.ts`

```typescript
export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(50, "Le prénom est trop long")
    .optional()
    .or(z.literal("")),  // ✅ Accepte les chaînes vides
  // ... même chose pour les autres champs
});
```

**Ce qui change** :
- ✅ `.optional()` : Le champ peut être omis
- ✅ `.or(z.literal(""))` : Le champ peut être une chaîne vide
- ✅ Validation appliquée **uniquement si le champ est rempli**

---

### 2. Filtrage intelligent des données

**Fichier** : `frontend/hooks/auth/userAuth.ts`

```typescript
export const updateProfileUser = () => {
  return useMutation({
    mutationFn: async (userData: Partial<User>) => {
      // 🔍 Filtrer les champs vides
      const filteredData = Object.entries(userData).reduce((acc, [key, value]) => {
        if (value && value !== "" && value !== undefined && value !== null) {
          acc[key] = value;  // ✅ Ne garder que les valeurs remplies
        }
        return acc;
      }, {} as Record<string, any>);

      // ⚠️ Vérifier qu'au moins un champ est modifié
      if (Object.keys(filteredData).length === 0) {
        throw new Error("Aucune modification à enregistrer");
      }

      // 📤 Envoyer uniquement les champs modifiés au backend
      const response = await instance.put<UserResponse>("/users/profile", filteredData);
      return response.data.data.user;
    },
    // ...
  });
};
```

**Ce qui se passe** :
1. 🔍 **Filtrage** : Supprime tous les champs vides/undefined/null
2. ⚠️ **Validation** : Vérifie qu'au moins un champ est rempli
3. 📤 **Envoi** : N'envoie que les champs modifiés au backend
4. ✅ **Mise à jour** : Le cache est invalidé automatiquement

---

### 3. Messages utilisateur intelligents

**Fichier** : `frontend/app/(root)/parametres/.../account/page.tsx`

```typescript
const onSubmit = async (data: UpdateProfileInput) => {
  // 📝 Construire la liste des champs modifiés
  const modifiedFields: string[] = [];
  
  if (data.firstName && data.firstName !== "") {
    modifiedFields.push("prénom");
  }
  // ... pour chaque champ

  // ⚠️ Si aucun champ rempli
  if (modifiedFields.length === 0) {
    toast.warning("Veuillez remplir au moins un champ...");
    return;
  }

  await updateUser(data);
  
  // ✅ Message contextuel
  if (modifiedFields.length === 1) {
    toast.success(`Le ${modifiedFields[0]} a été modifié avec succès`);
  } else {
    toast.success(`Votre profil a été mis à jour avec succès`);
  }
};
```

**Messages affichés** :
- 1 champ modifié : *"Le prénom a été modifié avec succès"*
- Plusieurs champs : *"Votre profil a été mis à jour avec succès"*
- Aucun champ : *"Veuillez remplir au moins un champ..."*

---

## 🎨 Exemples d'utilisation

### Cas 1 : Modifier uniquement le prénom
```
Formulaire:
  firstName: "Jean"        ← Rempli
  lastName: ""             ← Vide
  username: ""             ← Vide
  password: ""             ← Vide

Données envoyées au backend:
  { firstName: "Jean" }    ← Seulement le prénom

Résultat:
  ✅ Toast: "Le prénom a été modifié avec succès"
```

### Cas 2 : Modifier prénom + nom d'utilisateur
```
Formulaire:
  firstName: "Jean"        ← Rempli
  lastName: ""             ← Vide
  username: "jean.dupont"  ← Rempli
  password: ""             ← Vide

Données envoyées au backend:
  { 
    firstName: "Jean",
    username: "jean.dupont"
  }

Résultat:
  ✅ Toast: "Votre profil a été mis à jour avec succès"
```

### Cas 3 : Aucun champ rempli
```
Formulaire:
  firstName: ""            ← Vide
  lastName: ""             ← Vide
  username: ""             ← Vide
  password: ""             ← Vide

Données envoyées au backend:
  ❌ Aucune requête envoyée

Résultat:
  ⚠️ Toast: "Veuillez remplir au moins un champ..."
```

---

## 🔧 Avantages de cette approche

### Performance 🚀
- ✅ Moins de données envoyées au backend
- ✅ Requêtes plus rapides
- ✅ Économie de bande passante

### UX 🎨
- ✅ Flexibilité totale pour l'utilisateur
- ✅ Messages clairs et contextuels
- ✅ Validation intelligente
- ✅ Pas de frustration

### Sécurité 🔒
- ✅ Validation côté frontend ET backend
- ✅ Filtrage des données
- ✅ Pas de données inutiles envoyées

### Maintenabilité 🛠️
- ✅ Code propre et réutilisable
- ✅ Logique centralisée
- ✅ Facile à étendre

---

## 📊 Flux de données

```
Utilisateur remplit le formulaire
    ↓
Validation Zod (accepte vides)
    ↓
onSubmit() appelé
    ↓
Détection des champs remplis
    ↓
Si aucun champ → Toast warning + stop
    ↓
Sinon → updateUser() appelé
    ↓
Filtrage des champs vides
    ↓
PUT /users/profile (seulement champs remplis)
    ↓
Backend met à jour uniquement les champs reçus
    ↓
Réponse backend
    ↓
Mise à jour du state (Zustand + React Query)
    ↓
Toast de succès contextuel
    ↓
UI mise à jour automatiquement
```

---

## 🔍 Points techniques importants

### 1. Validation Zod
```typescript
.optional()         // Champ peut être omis
.or(z.literal(""))  // Accepte chaîne vide
```

### 2. Filtrage des données
```typescript
const filteredData = Object.entries(userData).reduce((acc, [key, value]) => {
  if (value && value !== "" && value !== undefined && value !== null) {
    acc[key] = value;
  }
  return acc;
}, {} as Record<string, any>);
```

### 3. Type Partial<User>
```typescript
mutationFn: async (userData: Partial<User>) => {
  // Partial = tous les champs deviennent optionnels
}
```

### 4. Invalidation du cache
```typescript
queryClient.invalidateQueries({ queryKey: ["user"] });
// Force React Query à refetch les données
```

---

## 🧪 Tests suggérés

### Test 1 : Un seul champ
1. Remplir uniquement `firstName`
2. Cliquer sur "Mettre à jour"
3. **Attendu** : Toast "Le prénom a été modifié..."

### Test 2 : Plusieurs champs
1. Remplir `firstName` + `username`
2. Cliquer sur "Mettre à jour"
3. **Attendu** : Toast "Votre profil a été mis à jour..."

### Test 3 : Aucun champ
1. Ne rien remplir
2. Cliquer sur "Mettre à jour"
3. **Attendu** : Toast warning "Veuillez remplir..."

### Test 4 : Mot de passe invalide
1. Remplir un mot de passe sans majuscule
2. Cliquer sur "Mettre à jour"
3. **Attendu** : Erreur de validation Zod

### Test 5 : Vérification backend
1. Modifier le prénom
2. Ouvrir DevTools Network
3. Vérifier que seulement `{ firstName: "..." }` est envoyé

---

## 🚀 Améliorations futures possibles

### 1. Confirmation avant mise à jour
```typescript
if (data.password) {
  const confirmed = confirm("Êtes-vous sûr de vouloir changer le mot de passe ?");
  if (!confirmed) return;
}
```

### 2. Affichage des changements
```typescript
// Montrer quels champs vont être modifiés
<Alert>
  Vous allez modifier : {modifiedFields.join(", ")}
</Alert>
```

### 3. Mot de passe actuel requis
```typescript
if (data.password) {
  // Demander le mot de passe actuel pour confirmation
}
```

### 4. Historique des modifications
```typescript
// Logger les modifications dans une table d'historique
await logProfileChange(userId, modifiedFields);
```

---

## ✅ Checklist de validation

- [x] Validation Zod accepte les champs vides
- [x] Filtrage des données côté frontend
- [x] Envoi uniquement des champs modifiés
- [x] Messages de succès contextuels
- [x] Gestion d'erreur si aucun champ
- [x] Invalidation du cache React Query
- [x] Mise à jour du state Zustand
- [x] Tests manuels effectués
- [x] Documentation créée

---

**Status** : ✅ Implémenté et fonctionnel  
**Date** : 31 Octobre 2025  
**Impact** : Amélioration significative de l'UX
