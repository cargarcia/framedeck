# LEGO Mosaic

Petite app HTML/JS (aucune dépendance, aucun build) qui convertit une photo en tableau de dots LEGO.

## Lancer

Ouvrir `index.html` directement dans le navigateur, ou servir le dossier :

```bash
python3 -m http.server 8787 --directory tools/lego-mosaic
# http://127.0.0.1:8787
```

Le traitement est 100 % local : l'image n'est jamais envoyée sur un réseau.

## Fonctionnalités

- **Dimensions paramétrables** : largeur × hauteur en dots (8 → 256), presets 32×32 / 48×48 / 64×64 / 96×64, verrou de proportions, cadrage « remplir » ou « étirer ».
- **Nombre de couleurs limité** avec trois modes :
  - `LEGO auto` : k-means dans l'espace Lab pour trouver les N teintes dominantes, puis mapping sur la brique LEGO la plus proche ;
  - `LEGO manuel` : la palette est exactement l'ensemble des couleurs cochées ;
  - `Libre` : N couleurs extraites de la photo, sans contrainte de catalogue.
- **Catalogue de 51 couleurs LEGO** activables/désactivables (le mode auto ne pioche que dans les couleurs actives).
- **Tramage Floyd–Steinberg** optionnel pour lisser les dégradés avec peu de couleurs.
- **Réglages image** : luminosité, contraste, saturation.
- **Rendu** : tenons LEGO ou aplat, grille et repères tous les 16 dots (taille d'une plaque), numéro de couleur sur chaque dot.
- **Liste de pièces** : nombre et pourcentage par couleur, total de dots, dimensions réelles estimées (1 dot = 8 mm).
- **Exports** : PNG haute résolution et plan de montage `.txt` (légende + grille numérotée ligne par ligne).

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `index.html` | structure de l'UI |
| `styles.css` | thème sombre, layout |
| `palette.js` | catalogue LEGO + conversions sRGB/Lab + distance perceptuelle |
| `mosaic.js` | échantillonnage de la grille, k-means, choix de palette, tramage |
| `renderer.js` | dessin des dots sur canvas (aperçu et export) |
| `app.js` | câblage UI, exports, liste de pièces |

## Notes techniques

- Le rapprochement des couleurs se fait en **CIE Lab** (et non en RGB) : le résultat est nettement plus fidèle à la perception.
- Le downscale se fait par **divisions successives par 2** avant le rendu final, pour éviter l'aliasing des gros facteurs de réduction.
- L'image est lue en `dataURL` (et non `blob:`) pour que le canvas reste exploitable même en ouverture `file://`.
- Ce dossier est volontairement hors de `apps/*` : ce n'est pas un workspace pnpm et il n'entre pas dans le pipeline Turborepo de Framedeck.
