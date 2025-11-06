# Système de Queue avec BullMQ

## 📋 Vue d'ensemble

Le système de queue utilise **BullMQ** pour traiter les tâches lourdes en arrière-plan, notamment :

- Upload de projets ZIP vers Cloudflare R2
- Clonage et upload de repositories GitHub

## 🎯 Avantages

### 1. **Traitement asynchrone**

- Les requêtes API retournent immédiatement (HTTP 202 Accepted)
- Le client n'attend plus que le traitement se termine
- Pas de timeout lors de gros clonages GitHub

### 2. **Gestion des pics de charge**

- Les jobs sont mis en file d'attente
- Traités selon la capacité du serveur (concurrency: 2)
- Pas de surcharge du serveur

### 3. **Retry automatique**

- 3 tentatives en cas d'échec
- Délai exponentiel : 5s → 10s → 20s
- Les erreurs temporaires sont gérées automatiquement

### 4. **Monitoring et traçabilité**

- Chaque job a un ID unique
- Statut consultable en temps réel
- Historique des jobs (succès/échecs)

## 🏗️ Architecture

```
Client Request → Controller → DB (status: PENDING) → Queue
                                                        ↓
                                    Worker → R2 Upload → DB Update (status: UPLOADED)
```

## 📝 Utilisation

### 1. Upload d'un projet ZIP

**Requête:**

```http
POST /api/project/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "name": "Mon Projet",
  "description": "Description",
  "file": <binary>
}
```

**Réponse (202 Accepted):**

```json
{
  "success": true,
  "message": "Project upload started. Processing in background.",
  "data": {
    "projectId": "clx123...",
    "jobId": "zip-clx123...",
    "status": "PENDING",
    "message": "Use the job ID to check processing status"
  }
}
```

### 2. Import d'un projet GitHub

**Requête:**

```http
POST /api/project/github
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Mon Projet GitHub",
  "description": "Description optionnelle",
  "githubUrl": "https://github.com/user/repo",
  "githubBranch": "main"
}
```

**Réponse (202 Accepted):**

```json
{
  "success": true,
  "message": "Project import started. Processing in background.",
  "data": {
    "projectId": "clx456...",
    "jobId": "github-clx456...",
    "status": "PENDING",
    "message": "Use the job ID to check processing status"
  }
}
```

### 3. Vérifier le statut d'un job

**Requête:**

```http
GET /api/project/job/:jobId
```

**Réponse:**

```json
{
  "success": true,
  "data": {
    "id": "github-clx456...",
    "name": "process-github-project",
    "state": "completed",
    "progress": 100,
    "returnvalue": {
      "projectId": "clx456...",
      "storageUrl": "https://...",
      "storageKey": "projects/...",
      "fileSize": 1234567,
      "status": "UPLOADED"
    }
  }
}
```

**États possibles:**

- `waiting`: Job en attente dans la queue
- `active`: Job en cours de traitement
- `completed`: Job terminé avec succès
- `failed`: Job échoué (voir `failedReason`)
- `delayed`: Job programmé pour plus tard

## 🔧 Configuration

### Queue Configuration (`src/config/queue/queue.config.ts`)

```typescript
export const defaultJobOptions = {
  attempts: 3, // Nombre de tentatives
  backoff: {
    type: "exponential",
    delay: 5000, // Délai initial en ms
  },
  removeOnComplete: {
    age: 24 * 3600, // Garder 24h
    count: 1000, // Max 1000 jobs
  },
  removeOnFail: {
    age: 7 * 24 * 3600, // Garder 7 jours
  },
};
```

### Worker Configuration (`src/workers/project.worker.ts`)

```typescript
concurrency: 2; // Traiter 2 jobs en parallèle maximum
```

## 📊 Suivi du projet

Après avoir reçu le `jobId`, tu peux :

1. **Polling** (recommandé) :

   ```javascript
   const checkStatus = async (jobId) => {
     const response = await fetch(`/api/project/job/${jobId}`);
     const data = await response.json();
     return data;
   };

   // Vérifier toutes les 2 secondes
   const interval = setInterval(async () => {
     const status = await checkStatus(jobId);
     if (status.data.state === "completed") {
       console.log("✅ Processing complete!", status.data.returnvalue);
       clearInterval(interval);
     } else if (status.data.state === "failed") {
       console.error("❌ Processing failed:", status.data.failedReason);
       clearInterval(interval);
     }
   }, 2000);
   ```

2. **Récupérer le projet** :
   ```http
   GET /api/project/:projectId
   ```
   Le statut du projet sera automatiquement mis à jour :
   - `PENDING`: En attente
   - `UPLOADING`: En cours d'upload
   - `UPLOADED`: Upload terminé
   - `FAILED`: Échec

## 🐛 Debugging

### Logs du worker

Les logs du worker affichent :

- `🔄 [Worker] Processing job <id>` : Job démarre
- `📥 [Worker] Cloning <url>...` : Clonage GitHub
- `☁️ [Worker] Uploading to R2...` : Upload R2
- `✅ [Worker] Job <id> completed` : Job réussi
- `❌ [Worker] Job <id> failed` : Job échoué

### Vérifier Redis

```bash
redis-cli
> KEYS bull:project-processing:*
> HGETALL bull:project-processing:github-clx123...
```

## 🚀 Prochaines étapes

Pour améliorer encore le système :

1. **WebSocket / Server-Sent Events** : Push des updates au client en temps réel
2. **Dashboard BullMQ** : Interface web pour monitorer les jobs
3. **Priorités** : Jobs prioritaires pour certains utilisateurs
4. **Scheduled jobs** : Nettoyage automatique, statistiques, etc.
5. **Dead letter queue** : Gestion des jobs définitivement échoués

## 📚 Ressources

- [Documentation BullMQ](https://docs.bullmq.io/)
- [Redis Commands](https://redis.io/commands)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)
