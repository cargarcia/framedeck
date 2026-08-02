/* Rendu de la grille de dots sur un canvas (aperçu ecran et export PNG). Expose window.LegoRenderer. */
(function () {
    const { isLightColor } = window.LegoPalette;
    const { getPlateLabel } = window.LegoMosaic;

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

    function drawStudGrid({ context, width, height, studSize }) {
        context.lineWidth = 1;
        context.strokeStyle = 'rgba(0, 0, 0, 0.25)';
        context.beginPath();
        for (let column = 1; column < width; column += 1) {
            context.moveTo(column * studSize + 0.5, 0);
            context.lineTo(column * studSize + 0.5, height * studSize);
        }
        for (let row = 1; row < height; row += 1) {
            context.moveTo(0, row * studSize + 0.5);
            context.lineTo(width * studSize, row * studSize + 0.5);
        }
        context.stroke();
    }

    /* Trace les separations de plaques et, si demande, leur etiquette (A1, B1, ...). */
    function drawPlateGuides({ context, region, columns, rows, studSize, plateSize, isPlateLabelVisible }) {
        context.lineWidth = Math.max(2, studSize * 0.16);
        context.strokeStyle = 'rgba(255, 255, 255, 0.78)';
        context.beginPath();
        for (let column = plateSize; column < columns; column += plateSize) {
            const localX = (column - region.x) * studSize;
            if (localX <= 0 || localX >= region.width * studSize) continue;
            context.moveTo(localX, 0);
            context.lineTo(localX, region.height * studSize);
        }
        for (let row = plateSize; row < rows; row += plateSize) {
            const localY = (row - region.y) * studSize;
            if (localY <= 0 || localY >= region.height * studSize) continue;
            context.moveTo(0, localY);
            context.lineTo(region.width * studSize, localY);
        }
        context.stroke();

        if (!isPlateLabelVisible) return;
        const fontSize = Math.max(10, Math.min(22, studSize * 1.6));
        context.font = `bold ${Math.round(fontSize)}px system-ui, sans-serif`;
        context.textAlign = 'left';
        context.textBaseline = 'top';
        const firstPlateColumn = Math.floor(region.x / plateSize);
        const firstPlateRow = Math.floor(region.y / plateSize);
        for (let plateRow = firstPlateRow; plateRow * plateSize < region.y + region.height; plateRow += 1) {
            for (let plateColumn = firstPlateColumn; plateColumn * plateSize < region.x + region.width; plateColumn += 1) {
                const localX = Math.max(0, plateColumn * plateSize - region.x) * studSize + 3;
                const localY = Math.max(0, plateRow * plateSize - region.y) * studSize + 3;
                const label = getPlateLabel(plateColumn, plateRow);
                const textWidth = context.measureText(label).width;
                context.fillStyle = 'rgba(0, 0, 0, 0.6)';
                context.fillRect(localX, localY, textWidth + 8, fontSize + 6);
                context.fillStyle = '#ffb703';
                context.fillText(label, localX + 4, localY + 3);
            }
        }
    }

    /* Dessine la mosaique. region permet de n'afficher qu'une plaque; par defaut tout le tableau. */
    function drawMosaic({
        canvas,
        columns,
        rows,
        indices,
        palette,
        studSize,
        studStyle,
        isGridVisible,
        isLabelVisible,
        plateSize,
        isPlateLabelVisible,
        region,
    }) {
        const visible = region || { x: 0, y: 0, width: columns, height: rows };
        const context = canvas.getContext('2d');
        canvas.width = visible.width * studSize;
        canvas.height = visible.height * studSize;
        context.fillStyle = '#111318';
        context.fillRect(0, 0, canvas.width, canvas.height);

        for (let row = 0; row < visible.height; row += 1) {
            for (let column = 0; column < visible.width; column += 1) {
                const paletteIndex = indices[(visible.y + row) * columns + (visible.x + column)];
                const color = palette[paletteIndex];
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
                        String(paletteIndex + 1),
                        column * studSize + studSize / 2,
                        row * studSize + studSize / 2,
                    );
                }
            }
        }

        if (isGridVisible) {
            drawStudGrid({ context, width: visible.width, height: visible.height, studSize });
        }
        if (plateSize > 0) {
            drawPlateGuides({ context, region: visible, columns, rows, studSize, plateSize, isPlateLabelVisible });
        }
    }

    window.LegoRenderer = { drawMosaic };
})();
