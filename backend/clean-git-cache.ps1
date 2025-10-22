# ==========================================
# Script pour retirer les fichiers générés du tracking Git
# ==========================================

Write-Host "🧹 Nettoyage du cache Git..." -ForegroundColor Cyan

# Retirer les fichiers générés par Prisma
Write-Host "`n📦 Retrait des fichiers Prisma générés..." -ForegroundColor Yellow
git rm -r --cached src/lib/generated/prisma/ 2>$null

# Retirer le fichier de config d'environnement
Write-Host "`n🔐 Retrait du fichier de configuration d'environnement..." -ForegroundColor Yellow
git rm --cached src/config/env/env.Config.ts 2>$null

# Ajouter le .gitignore mis à jour
Write-Host "`n✅ Ajout du .gitignore mis à jour..." -ForegroundColor Yellow
git add .gitignore

Write-Host "`n✨ Nettoyage terminé!" -ForegroundColor Green
Write-Host "`n📝 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "   1. git commit -m 'chore: ignore Prisma generated files and env config'" -ForegroundColor White
Write-Host "   2. git push" -ForegroundColor White
Write-Host "`n⚠️  IMPORTANT: Créez un fichier .env.example pour documenter les variables nécessaires" -ForegroundColor Yellow
