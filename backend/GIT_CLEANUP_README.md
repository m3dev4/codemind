# 🧹 Nettoyage Git - Fichiers Générés

## 📋 Résumé des Changements

Les fichiers suivants sont maintenant ignorés par Git :

### 1. **Fichiers Prisma Générés**

```
src/lib/generated/prisma/**
```

**Raison** : Ces fichiers sont générés automatiquement par `prisma generate` et ne doivent jamais être versionnés.

### 2. **Configuration d'Environnement**

```
src/config/env/env.Config.ts
```

**Raison** : Peut contenir des secrets et des clés API. Un fichier `.example` est fourni pour documentation.

---

## 🚀 Étapes de Nettoyage

### Option 1 : Script Automatique (Recommandé)

```powershell
# Depuis le dossier backend/
.\clean-git-cache.ps1
```

### Option 2 : Commandes Manuelles

```bash
# Retirer les fichiers Prisma générés
git rm -r --cached src/lib/generated/prisma/

# Retirer le fichier de config d'environnement
git rm --cached src/config/env/env.Config.ts

# Ajouter le .gitignore mis à jour
git add .gitignore

# Commit
git commit -m "chore: ignore Prisma generated files and env config"

# Push
git push
```

---

## 📦 Configuration pour Nouveaux Développeurs

### 1. Cloner le projet

```bash
git clone <repo-url>
cd backend
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer l'environnement

```bash
# Copier le fichier exemple
cp .env.example .env

# Copier le fichier de configuration exemple
cp src/config/env/env.Config.example.ts src/config/env/env.Config.ts

# Éditer avec vos vraies valeurs
code .env
code src/config/env/env.Config.ts
```

### 4. Générer le client Prisma

```bash
npx prisma generate
```

### 5. Migrer la base de données

```bash
npx prisma migrate dev
```

---

## 🔐 Générer des Secrets JWT

```bash
# JWT Secret Key
openssl rand -base64 32

# JWT Refresh Secret
openssl rand -base64 32
```

Ajoutez ces valeurs dans votre `.env` :

```
JWT_SECRET_KEY=<généré_ci-dessus>
JWT_REFRESH_SECRET=<généré_ci-dessus>
```

---

## ⚠️ Important

### ✅ À FAIRE

- ✅ Commiter `.gitignore` mis à jour
- ✅ Commiter `.env.example`
- ✅ Commiter `env.Config.example.ts`
- ✅ Documenter les variables d'environnement nécessaires

### ❌ À NE JAMAIS FAIRE

- ❌ Commiter `.env`
- ❌ Commiter `env.Config.ts`
- ❌ Commiter `src/lib/generated/prisma/**`
- ❌ Partager des secrets dans le code
- ❌ Hardcoder des API keys

---

## 🔄 Workflow Git Amélioré

### Vérifier les fichiers avant commit

```bash
git status
```

### Si des fichiers générés apparaissent

```bash
# Vérifier le .gitignore
cat .gitignore | grep -E "(prisma|env)"

# Nettoyer le cache si nécessaire
git rm -r --cached src/lib/generated/prisma/
```

---

## 📚 Ressources

- [Prisma Best Practices](https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/generated-artifacts)
- [Gitignore Best Practices](https://github.com/github/gitignore)
- [Environment Variables Security](https://12factor.net/config)
