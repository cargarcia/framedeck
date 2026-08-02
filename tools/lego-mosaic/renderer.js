/* Rendu de la grille de dots sur un canvas (aperçu ecran et export PNG). Expose window.LegoRenderer. */
(function () {
    const { isLightColor } = window.LegoPalette;

    function shade(rgb, amount) {
        const mix = (channel) =>
            Math.max(0, Math.min(255, Math.round(amount > 0 ? channel + (255 - channel) * amount : channel * (1 + amount))));
        return `rgb(${mix(rgb[0])}, ${mix(rgb[1])}, ${mix(rgb[2])})`;
    }

    function drawStud({ context, x, y, size, rgb, studStyle }) {
        context.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
        context.fillRect(x, y, size, size);
        if (studStyle === 'flat') return;

        const center = size / 2;
        const radius = size * 0.32;
        // Anneau clair en haut-gauche + ombre en bas-droite: donne le relief du tenon.
        context.beginPath();
        context.arc(x + center, y + center, radius, 0, Math.PI * 2);
        context.fillStyle = shade(rgb, 0.12);
        context.fill();

        context.lineWidth = Math.max(1, size * 0.05);
        context.beginPath();
        context.arc(x + center, y + center, radius, Math.PI * 0.75, Math.PI * 1.75);
        context.strokeStyle = shade(rgb, 0.35);
        context.stroke();

        context.beginPath();
        context.arc(x + center, y + center, radius, Math.PI * 1.75, Math.PI * 2.75);
        context.strokeStyle = shade(rgb, -0.3);
        context.stroke();
    }

    /* Dessine la mosaique complete. studSize est la taille d'une case en pixels. */
    function drawMosaic({ canvas, columns, rows, indices, palette, studSize, studStyle, isGridVisible, isLabelVisible }) {
        const context = canvas.getContext('2d');
        canvas.width = columns * studSize;
        canvas.height = rows * studSize;
        context.fillStyle = '#111318';
        context.fillRect(0, 0, canvas.width, canvas.height);

        for (let row = 0; row < rows; row += 1) {
            for (let column = 0; column < columns; column += 1) {
                const color = palette[indices[row * columns + column]];
                drawStud({
                    context,
                    x: column * studSize,
                    y: row * studSize,
                    size: studSize,
                    rgb: color.rgb,
                    studStyle,
                });
                if (isLabelVisible && studSize >= 14) {
                    context.fillStyle = isLightColor(color.rgb) ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.8)';
                    context.font = `${Math.round(studSize * 0.34)}px monospace`;
                    context.textAlign = 'center';
                    context.textBaseline = 'middle';
                    context.fillText(
                        String(indices[row * columns + column] + 1),
                        column * studSize + studSize / 2,
                        row * studSize + studSize / 2,
                    );
                }
            }
        }

        if (!isGridVisible) return;
        context.lineWidth = 1;
        context.strokeStyle = 'rgba(0, 0, 0, 0.25)';
        context.beginPath();
        for (let column = 1; column < columns; column += 1) {
            context.moveTo(column * studSize + 0.5, 0);
            context.lineTo(column * studSize + 0.5, canvas.height);
        }
        for (let row = 1; row < rows; row += 1) {
            context.moveTo(0, row * studSize + 0.5);
            context.lineTo(canvas.width, row * studSize + 0.5);
        }
        context.stroke();

        // Reperes tous les 16 tenons: correspond a une plaque 16x16 pour le montage.
        context.lineWidth = 2;
        context.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        context.beginPath();
        for (let column = 16; column < columns; column += 16) {
            context.moveTo(column * studSize, 0);
            context.lineTo(column * studSize, canvas.height);
        }
        for (let row = 16; row < rows; row += 16) {
            context.moveTo(0, row * studSize);
            context.lineTo(canvas.width, row * studSize);
        }
        context.stroke();
    }

    window.LegoRenderer = { drawMosaic };
})();
