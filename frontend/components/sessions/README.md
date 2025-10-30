# Composants de Gestion des Sessions

## 📋 Vue d'ensemble

Ce module contient tous les composants nécessaires pour gérer les sessions utilisateur avec une interface moderne et intuitive.

## 🎨 Composants

### `SessionCardEnhanced`
Carte affichant les détails d'une session avec possibilité de suppression.

### `SessionsList`
Liste complète des sessions avec en-tête, statistiques et actions groupées.

### `EmptySessionsState`
État vide affiché quand aucune session n'est active.

### `SessionsLoading`
Skeleton loader pour l'état de chargement.

### `SessionsError`
Composant d'erreur avec possibilité de réessayer.

### `DeleteSessionDialog`
Dialog de confirmation pour la suppression d'une session.

## 🔧 Installation requise

Pour que les composants fonctionnent correctement, vous devez installer le package suivant :

```bash
npm install @radix-ui/react-alert-dialog
```

Ou avec pnpm :

```bash
pnpm add @radix-ui/react-alert-dialog
```

## 🚀 Utilisation

### Page complète (déjà intégrée)

```tsx
import { useSessions } from "@/hooks/auth/useSessionsQuery";
import { SessionsList, EmptySessionsState, SessionsLoading, SessionsError } from "@/components/sessions";

const SessionsPage = () => {
  const { data: sessions, isLoading, error, refetch } = useSessions();

  if (isLoading) return <SessionsLoading />;
  if (error) return <SessionsError error={error} onRetry={refetch} />;
  if (!sessions?.length) return <EmptySessionsState />;

  return <SessionsList sessions={sessions} />;
};
```

### Utilisation individuelle

```tsx
import { SessionCardEnhanced } from "@/components/sessions";

<SessionCardEnhanced 
  session={sessionData} 
  isCurrentSession={true} 
/>
```

## 🎯 Fonctionnalités

- ✅ Affichage des sessions actives et expirées
- ✅ Suppression d'une session individuelle
- ✅ Suppression de toutes les autres sessions (sauf la session actuelle)
- ✅ Actualisation des données
- ✅ États de chargement et d'erreur
- ✅ Interface responsive et moderne
- ✅ Animations et transitions fluides
- ✅ Support du dark mode
- ✅ Internationalisation (français)

## 🔐 Sécurité

- Les suppressions nécessitent une confirmation
- La session actuelle ne peut pas être supprimée
- Toast notifications pour les actions importantes

## 📝 TODO

- [ ] Implémenter la détection de la session actuelle via JWT
- [ ] Ajouter la fonctionnalité de renommage des sessions
- [ ] Ajouter des filtres (actives/expirées)
- [ ] Ajouter la pagination si beaucoup de sessions
