# 📁 Structure du système de gestion des sessions

## Architecture des composants

```
frontend/
├── hooks/auth/
│   └── useSessionsQuery.ts                 # 🔄 Hook TanStack Query principal
│
├── components/sessions/
│   ├── index.ts                           # 📦 Exports centralisés
│   ├── SessionCardEnhanced.tsx            # 💳 Carte session (améliorée)
│   ├── SessionsList.tsx                   # 📋 Liste complète avec actions
│   ├── EmptySessionsState.tsx             # 🔍 État vide
│   ├── SessionsLoading.tsx                # ⏳ Skeleton loading
│   ├── SessionsError.tsx                  # ⚠️ État d'erreur
│   ├── DeleteSessionDialog.tsx            # 🗑️ Dialog de confirmation
│   ├── README.md                          # 📖 Documentation composants
│   └── STRUCTURE.md                       # 📁 Ce fichier
│
├── components/ui/
│   └── alert-dialog.tsx                   # 🆕 AlertDialog (Radix UI)
│
└── app/(root)/parametres/[firstName]/[id]/sessions/
    └── page.tsx                           # 📄 Page principale (mise à jour)
```

## Flux de données

```
┌─────────────────────────────────────────────────────────────┐
│                        SessionsPage                          │
│  • Utilise useSessions() pour récupérer les données         │
│  • Gère les états : loading, error, success                 │
│  • Affiche le composant approprié selon l'état              │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
  ┌──────────┐   ┌─────────────┐  ┌──────────┐
  │ Loading  │   │ Error State │  │ Success  │
  │ Skeleton │   │ Component   │  │ State    │
  └──────────┘   └─────────────┘  └────┬─────┘
                                        │
                        ┌───────────────┴─────────────┐
                        │                             │
                        ▼                             ▼
                ┌──────────────┐          ┌──────────────────┐
                │ SessionsList │          │ EmptySessionState│
                │              │          └──────────────────┘
                │  • Header    │
                │  • Stats     │
                │  • Actions   │
                └──────┬───────┘
                       │
        ┌──────────────┼──────────────┐
        │                             │
        ▼                             ▼
┌───────────────┐           ┌────────────────┐
│Current Session│           │ Other Sessions │
│ (highlighted) │           │ (with delete)  │
└───────┬───────┘           └────────┬───────┘
        │                            │
        └──────────┬─────────────────┘
                   │
                   ▼
        ┌─────────────────────┐
        │ SessionCardEnhanced │
        │  • Device info      │
        │  • Location         │
        │  • Date/time        │
        │  • Delete button    │
        └──────────┬──────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ DeleteSessionDialog  │
        │  • Confirmation      │
        │  • Loading state     │
        └──────────────────────┘
```

## Interactions utilisateur

```
1. Chargement de la page
   └─> useSessions() → GET /api/users/sessions
       └─> Affichage SessionsLoading
           └─> Données reçues
               └─> Affichage SessionsList

2. Supprimer une session
   └─> Clic sur bouton Trash
       └─> Ouverture DeleteSessionDialog
           └─> Confirmation
               └─> useDeleteSession() → DELETE /api/users/sessions/:id
                   └─> Toast de succès
                       └─> Invalidation cache & refetch automatique

3. Supprimer toutes les autres sessions
   └─> Clic sur "Supprimer les autres sessions"
       └─> Ouverture AlertDialog
           └─> Confirmation
               └─> useDeleteAllOtherSessions() → Multiple DELETE
                   └─> Toast de succès
                       └─> Invalidation cache & refetch automatique

4. Actualiser
   └─> Clic sur bouton Actualiser
       └─> refetch() → GET /api/users/sessions
           └─> Mise à jour de la liste
```

## Hooks TanStack Query

### `useSessions()`

```tsx
const { data, isLoading, error, refetch, isRefetching } = useSessions();
```

- **Query Key**: `['sessions', 'list']`
- **Route**: `GET /api/users/sessions`
- **Cache**: 5 minutes
- **Retry**: 2 fois

### `useDeleteSession()`

```tsx
const { mutate, isPending } = useDeleteSession();
mutate(sessionId);
```

- **Route**: `DELETE /api/users/sessions/:sessionId`
- **Invalidation**: `['sessions', 'list']`
- **Toast**: Succès/Erreur automatique

### `useDeleteAllOtherSessions()`

```tsx
const { mutate, isPending } = useDeleteAllOtherSessions();
mutate([sessionId1, sessionId2, ...]);
```

- **Routes**: Multiple `DELETE /api/users/sessions/:sessionId`
- **Invalidation**: `['sessions', 'list']`
- **Toast**: Succès/Erreur automatique

## États du composant

| État        | Composant affiché    | Condition                      |
| ----------- | -------------------- | ------------------------------ |
| **Loading** | `SessionsLoading`    | `isLoading === true`           |
| **Error**   | `SessionsError`      | `error !== null && !isLoading` |
| **Empty**   | `EmptySessionsState` | `sessions.length === 0`        |
| **Success** | `SessionsList`       | `sessions.length > 0`          |

## Fonctionnalités clés

### ✅ Sécurité

- Dialog de confirmation pour chaque suppression
- Protection de la session actuelle
- Validation des permissions côté backend

### ✅ UX

- Loading states avec skeletons
- Toast notifications
- Animations fluides
- Responsive design

### ✅ Performance

- Cache avec TanStack Query
- Invalidation intelligente
- Retry automatique en cas d'erreur
- Requêtes parallèles pour suppressions multiples

### ✅ Accessibilité

- Composants Radix UI (ARIA compliant)
- Focus management
- Keyboard navigation
- Screen reader friendly
