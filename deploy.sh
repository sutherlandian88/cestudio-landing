#!/bin/bash
# GarageBids — Deploy script
# Sincroniza local → GitHub → Documents/GarageBids
# Uso: ./deploy.sh "mensaje del commit"

set -e

MSG="${1:-"Update GarageBids"}"
REPO="/Users/iansutherlandborja/Documents/Github/cestudio-landing"
DOCS="/Users/iansutherlandborja/Documents/GarageBids"

echo "→ Commit y push a GitHub..."
git -C "$REPO" add -A
git -C "$REPO" commit -m "$MSG" 2>/dev/null || echo "  (nada nuevo para commitear)"
git -C "$REPO" push origin garagebids

echo "→ Sincronizando a Documents/GarageBids..."
rsync -a --delete \
  --exclude='.git' \
  --exclude='.claude' \
  --exclude='deploy.sh' \
  --exclude='*.zip' \
  "$REPO/" "$DOCS/"

echo ""
echo "Listo. Actualizado en:"
echo "  Local:    $REPO"
echo "  GitHub:   https://github.com/sutherlandian88/cestudio-landing/tree/garagebids"
echo "  Docs:     $DOCS"
