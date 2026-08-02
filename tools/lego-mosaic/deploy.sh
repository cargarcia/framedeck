#!/usr/bin/env bash
# Construit la page autonome et l'envoie sur un serveur via SSH/rsync.
#
#   DEPLOY_HOST=user@exchange.garc-ia.eu \
#   DEPLOY_PATH=/var/www/exchange \
#   ./tools/lego-mosaic/deploy.sh
#
# Variables optionnelles:
#   DEPLOY_FILENAME  nom du fichier sur le serveur (defaut: index.html)
#   DEPLOY_PORT      port SSH (defaut: 22)
#   DRY_RUN=1        simule l'envoi sans rien ecrire sur le serveur

set -euo pipefail

script_directory=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

if [ -z "${DEPLOY_HOST:-}" ] || [ -z "${DEPLOY_PATH:-}" ]; then
    echo "DEPLOY_HOST et DEPLOY_PATH sont requis." >&2
    echo "Exemple: DEPLOY_HOST=user@exchange.garc-ia.eu DEPLOY_PATH=/var/www/exchange $0" >&2
    exit 1
fi

remote_filename=${DEPLOY_FILENAME:-index.html}
ssh_port=${DEPLOY_PORT:-22}
remote_directory=${DEPLOY_PATH%/}

node "$script_directory/build-artifact.js"

# On envoie une copie renommee: le serveur recoit index.html, pas lego-mosaic.html.
staging_directory=$(mktemp -d)
trap 'rm -rf "$staging_directory"' EXIT
cp "$script_directory/dist/lego-mosaic.html" "$staging_directory/$remote_filename"

rsync_options=(--archive --compress --checksum --human-readable --progress)
rsync_options+=(--rsh "ssh -p $ssh_port")
if [ "${DRY_RUN:-0}" = "1" ]; then
    rsync_options+=(--dry-run)
    echo "Mode simulation: rien ne sera ecrit sur $DEPLOY_HOST"
fi

rsync "${rsync_options[@]}" "$staging_directory/$remote_filename" "$DEPLOY_HOST:$remote_directory/"

echo "Deploye: $DEPLOY_HOST:$remote_directory/$remote_filename"
