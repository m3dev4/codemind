# 🔧 Améliorations suggérées pour le Backend - Sessions

## 📌 Identification de la session actuelle

### Problème actuel
Le frontend identifie la session actuelle en utilisant des heuristiques (session la plus récente, etc.), ce qui n'est pas toujours précis, surtout si l'utilisateur a plusieurs sessions actives créées rapidement.

### Solution recommandée

Modifier la route `GET /api/users/sessions` pour inclure l'ID de la session actuelle dans la réponse.

#### Backend - Modification suggérée

**Fichier:** `backend/src/routes/user.routes.ts`

```typescript
router.get("/sessions", isAuthenticated, arcjetProtect, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    // Récupérer l'ID de session actuelle depuis le JWT ou la requête
    // Cela dépend de comment vous stockez le sessionId dans le token
    const currentSessionId = req.session?.id || req.user?.sessionId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur non authentifié",
      });
    }

    const sessions = await prisma.session.findMany({
      where: {
        userId,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        device: true,
        browser: true,
        os: true,
        platform: true,
        location: true,
        ip: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        sessions,
        currentSessionId, // 🆕 Ajout de l'ID de session actuelle
        total: sessions.length,
      },
    });
  } catch (error) {
    console.error("[User Routes] Erreur get sessions:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des sessions",
    });
  }
});
```

#### Frontend - Utilisation de currentSessionId

Une fois le backend modifié, mettre à jour le hook frontend :

**Fichier:** `frontend/hooks/auth/useSessionsQuery.ts`

```typescript
interface SessionsResponse {
  success: boolean;
  data: {
    sessions: Session[];
    currentSessionId?: string; // 🆕 Ajout du champ
    total: number;
  };
}

export const useSessions = () => {
  return useQuery<{ sessions: Session[]; currentSessionId?: string }, Error>({
    queryKey: sessionsKeys.lists(),
    queryFn: async () => {
      const response = await axios.get<SessionsResponse>("/api/users/sessions");
      return {
        sessions: response.data.data.sessions,
        currentSessionId: response.data.data.currentSessionId,
      };
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};
```

**Fichier:** `frontend/app/(root)/parametres/[firstName]/[id]/sessions/page.tsx`

```typescript
const SessionsPage = () => {
  const { data, isLoading, error, refetch, isRefetching } = useSessions();
  
  // Utiliser directement le currentSessionId du backend
  const sessions = data?.sessions;
  const currentSessionId = data?.currentSessionId;

  // ... reste du code
};
```

---

## 🔐 Stockage de sessionId dans le JWT

### Option 1: Ajouter sessionId au JWT payload

Lors de la création du token, inclure l'ID de session :

```typescript
// backend/src/utils/jwt.ts
export const generateTokenPair = (
  userId: string,
  email: string,
  role: string,
  sessionId: string // 🆕
) => {
  const accessToken = jwt.sign(
    { userId, email, role, sessionId }, // 🆕 Ajout de sessionId
    config.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { userId, email, role, sessionId }, // 🆕 Ajout de sessionId
    config.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};
```

Ensuite, lors de l'authentification :

```typescript
// Dans le middleware isAuthenticated
req.user = {
  userId: decoded.userId,
  email: decoded.email,
  role: decoded.role,
  sessionId: decoded.sessionId, // 🆕
};
```

### Option 2: Utiliser les cookies pour stocker sessionId

Créer un cookie séparé pour le sessionId :

```typescript
// Lors de la connexion
res.cookie("sessionId", session.id, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
});
```

Puis le lire dans le middleware :

```typescript
const sessionId = req.cookies.sessionId;
```

---

## 📊 Statistiques de sessions

### Ajouter plus de métadonnées

Enrichir les données de session pour une meilleure UX :

```typescript
interface SessionMetadata {
  lastActivity: Date;          // Dernière activité sur cette session
  deviceFingerprint: string;   // Empreinte de l'appareil
  isCurrentSession: boolean;   // Flag direct depuis le backend
  loginMethod: string;         // OAuth, Email, etc.
}
```

---

## 🔒 Sécurité additionnelle

### 1. Détection de sessions suspectes

```typescript
// Détecter si une session provient d'un pays/région inhabituelle
const isUnusualLocation = (session: Session, userHistory: Location[]) => {
  // Logique de détection
};
```

### 2. Limitation du nombre de sessions

```typescript
// Limiter à N sessions actives par utilisateur
const MAX_ACTIVE_SESSIONS = 5;

if (activeSessions.length >= MAX_ACTIVE_SESSIONS) {
  // Supprimer la session la plus ancienne
  await prisma.session.delete({
    where: { id: oldestSession.id },
  });
}
```

### 3. Notification de nouvelle session

Envoyer un email lorsqu'une nouvelle session est créée depuis un appareil inconnu.

---

## 🎯 Résumé des modifications recommandées

### Priorité HAUTE ⚠️
1. ✅ Inclure `currentSessionId` dans la réponse de `GET /api/users/sessions`
2. ✅ Ajouter `sessionId` au payload JWT
3. ✅ Mettre à jour le middleware pour exposer `req.user.sessionId`

### Priorité MOYENNE 📌
4. Ajouter `lastActivity` aux sessions
5. Implémenter la limitation du nombre de sessions
6. Ajouter des métadonnées enrichies

### Priorité BASSE 📝
7. Détection de sessions suspectes
8. Notifications email pour nouvelles sessions
9. Historique des connexions

---

## 🧪 Tests recommandés

1. Créer plusieurs sessions depuis différents appareils
2. Vérifier que la session actuelle est correctement identifiée
3. Tester la suppression d'une session (vérifier la déconnexion)
4. Tester la suppression de toutes les autres sessions
5. Vérifier que la session actuelle ne peut pas être supprimée
