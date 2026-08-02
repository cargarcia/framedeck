/* Coeur de la conversion photo -> grille de dots LEGO. Expose window.LegoMosaic. */
(function () {
    const { rgbToLab, labDistanceSquared, findNearestColorIndex, rgbToHex } = window.LegoPalette;

    function createCanvas(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(width));
        canvas.height = Math.max(1, Math.round(height));
        return canvas;
    }

    // Reduction progressive (division par 2) avant le rendu final: evite l'aliasing des gros downscales.
    function downscaleStepwise({ image, sourceRect, targetWidth, targetHeight }) {
        let currentWidth = sourceRect.width;
        let currentHeight = sourceRect.height;
        let currentCanvas = createCanvas(currentWidth, currentHeight);
        let context = currentCanvas.getContext('2d');
        context.imageSmoothingQuality = 'high';
        context.drawImage(
            image,
            sourceRect.x,
            sourceRect.y,
            sourceRect.width,
            sourceRect.height,
            0,
            0,
            currentWidth,
            currentHeight,
        );

        while (currentWidth > targetWidth * 2 && currentHeight > targetHeight * 2) {
            currentWidth = Math.max(targetWidth, Math.floor(currentWidth / 2));
            currentHeight = Math.max(targetHeight, Math.floor(currentHeight / 2));
            const nextCanvas = createCanvas(currentWidth, currentHeight);
            const nextContext = nextCanvas.getContext('2d');
            nextContext.imageSmoothingQuality = 'high';
            nextContext.drawImage(currentCanvas, 0, 0, currentWidth, currentHeight);
            currentCanvas = nextCanvas;
        }

        const finalCanvas = createCanvas(targetWidth, targetHeight);
        const finalContext = finalCanvas.getContext('2d');
        finalContext.imageSmoothingQuality = 'high';
        finalContext.drawImage(currentCanvas, 0, 0, targetWidth, targetHeight);
        return finalContext.getImageData(0, 0, targetWidth, targetHeight);
    }

    function computeSourceRect({ image, columns, rows, fit }) {
        const imageRatio = image.width / image.height;
        const gridRatio = columns / rows;
        if (fit !== 'cover' || Math.abs(imageRatio - gridRatio) < 0.001) {
            return { x: 0, y: 0, width: image.width, height: image.height };
        }
        if (imageRatio > gridRatio) {
            const width = image.height * gridRatio;
            return { x: (image.width - width) / 2, y: 0, width, height: image.height };
        }
        const height = image.width / gridRatio;
        return { x: 0, y: (image.height - height) / 2, width: image.width, height };
    }

    function applyAdjustments(channels, { brightness, contrast, saturation }) {
        const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        for (let index = 0; index < channels.length; index += 3) {
            let red = channels[index] + brightness;
            let green = channels[index + 1] + brightness;
            let blue = channels[index + 2] + brightness;

            red = contrastFactor * (red - 128) + 128;
            green = contrastFactor * (green - 128) + 128;
            blue = contrastFactor * (blue - 128) + 128;

            const luminance = 0.299 * red + 0.587 * green + 0.114 * blue;
            red = luminance + (red - luminance) * saturation;
            green = luminance + (green - luminance) * saturation;
            blue = luminance + (blue - luminance) * saturation;

            channels[index] = Math.max(0, Math.min(255, red));
            channels[index + 1] = Math.max(0, Math.min(255, green));
            channels[index + 2] = Math.max(0, Math.min(255, blue));
        }
    }

    /* Echantillonne la photo en une grille columns x rows de couleurs moyennes. */
    function sampleGrid({ image, columns, rows, fit, adjustments }) {
        const sourceRect = computeSourceRect({ image, columns, rows, fit });
        const imageData = downscaleStepwise({ image, sourceRect, targetWidth: columns, targetHeight: rows });
        const channels = new Float32Array(columns * rows * 3);
        for (let cellIndex = 0; cellIndex < columns * rows; cellIndex += 1) {
            channels[cellIndex * 3] = imageData.data[cellIndex * 4];
            channels[cellIndex * 3 + 1] = imageData.data[cellIndex * 4 + 1];
            channels[cellIndex * 3 + 2] = imageData.data[cellIndex * 4 + 2];
        }
        applyAdjustments(channels, adjustments);
        return channels;
    }

    /* k-means (init k-means++) dans l'espace Lab pour trouver les couleurs dominantes. */
    function findDominantLabs({ channels, clusterCount, iterations = 12 }) {
        const cellCount = channels.length / 3;
        const labs = new Float32Array(cellCount * 3);
        for (let cellIndex = 0; cellIndex < cellCount; cellIndex += 1) {
            const lab = rgbToLab(channels[cellIndex * 3], channels[cellIndex * 3 + 1], channels[cellIndex * 3 + 2]);
            labs[cellIndex * 3] = lab[0];
            labs[cellIndex * 3 + 1] = lab[1];
            labs[cellIndex * 3 + 2] = lab[2];
        }

        const readLab = (cellIndex) => [labs[cellIndex * 3], labs[cellIndex * 3 + 1], labs[cellIndex * 3 + 2]];
        const centroids = [readLab(Math.floor(cellCount / 2))];
        const distances = new Float32Array(cellCount).fill(Infinity);

        while (centroids.length < Math.min(clusterCount, cellCount)) {
            const lastCentroid = centroids[centroids.length - 1];
            let farthestIndex = 0;
            let farthestDistance = -1;
            for (let cellIndex = 0; cellIndex < cellCount; cellIndex += 1) {
                const distance = labDistanceSquared(readLab(cellIndex), lastCentroid);
                if (distance < distances[cellIndex]) distances[cellIndex] = distance;
                if (distances[cellIndex] > farthestDistance) {
                    farthestDistance = distances[cellIndex];
                    farthestIndex = cellIndex;
                }
            }
            centroids.push(readLab(farthestIndex));
        }

        for (let iteration = 0; iteration < iterations; iteration += 1) {
            const sums = new Float64Array(centroids.length * 3);
            const counts = new Uint32Array(centroids.length);
            for (let cellIndex = 0; cellIndex < cellCount; cellIndex += 1) {
                const lab = readLab(cellIndex);
                let bestIndex = 0;
                let bestDistance = Infinity;
                for (let centroidIndex = 0; centroidIndex < centroids.length; centroidIndex += 1) {
                    const distance = labDistanceSquared(lab, centroids[centroidIndex]);
                    if (distance < bestDistance) {
                        bestDistance = distance;
                        bestIndex = centroidIndex;
                    }
                }
                sums[bestIndex * 3] += lab[0];
                sums[bestIndex * 3 + 1] += lab[1];
                sums[bestIndex * 3 + 2] += lab[2];
                counts[bestIndex] += 1;
            }
            for (let centroidIndex = 0; centroidIndex < centroids.length; centroidIndex += 1) {
                if (!counts[centroidIndex]) continue;
                centroids[centroidIndex] = [
                    sums[centroidIndex * 3] / counts[centroidIndex],
                    sums[centroidIndex * 3 + 1] / counts[centroidIndex],
                    sums[centroidIndex * 3 + 2] / counts[centroidIndex],
                ];
            }
        }

        return centroids;
    }

    /* Selectionne au plus colorCount teintes parmi les couleurs autorisees. */
    function buildPalette({ channels, colorCount, allowedColors, paletteMode }) {
        if (paletteMode === 'manual') return allowedColors.slice(0, Math.max(1, allowedColors.length));

        const dominantLabs = findDominantLabs({ channels, clusterCount: colorCount });
        const selected = [];
        const usedNames = new Set();

        if (paletteMode === 'free') {
            dominantLabs.forEach((lab, index) => {
                const rgb = labToRgb(lab);
                selected.push({ name: `Custom ${index + 1}`, hex: rgbToHex(rgb[0], rgb[1], rgb[2]), rgb, lab });
            });
            return selected;
        }

        dominantLabs.forEach((lab) => {
            const nearest = allowedColors[findNearestColorIndex(lab, allowedColors)];
            if (nearest && !usedNames.has(nearest.name)) {
                usedNames.add(nearest.name);
                selected.push(nearest);
            }
        });

        // Les centroides peuvent tomber sur la meme brique: on complete avec les couleurs les plus utiles.
        if (selected.length < Math.min(colorCount, allowedColors.length)) {
            const usageByName = new Map();
            const cellCount = channels.length / 3;
            for (let cellIndex = 0; cellIndex < cellCount; cellIndex += 1) {
                const lab = rgbToLab(channels[cellIndex * 3], channels[cellIndex * 3 + 1], channels[cellIndex * 3 + 2]);
                const nearest = allowedColors[findNearestColorIndex(lab, allowedColors)];
                usageByName.set(nearest.name, (usageByName.get(nearest.name) || 0) + 1);
            }
            const fallback = allowedColors
                .filter((color) => !usedNames.has(color.name))
                .sort((first, second) => (usageByName.get(second.name) || 0) - (usageByName.get(first.name) || 0));
            for (const color of fallback) {
                if (selected.length >= colorCount) break;
                selected.push(color);
            }
        }

        return selected;
    }

    function labToRgb(lab) {
        const y = (lab[0] + 16) / 116;
        const x = lab[1] / 500 + y;
        const z = y - lab[2] / 200;
        const expand = (component) => (component ** 3 > 0.008856 ? component ** 3 : (component - 16 / 116) / 7.787);
        const linearX = expand(x) * 0.95047;
        const linearY = expand(y);
        const linearZ = expand(z) * 1.08883;

        const toChannel = (value) => {
            const corrected = value <= 0.0031308 ? 12.92 * value : 1.055 * Math.pow(value, 1 / 2.4) - 0.055;
            return Math.max(0, Math.min(255, Math.round(corrected * 255)));
        };
        return [
            toChannel(linearX * 3.2404542 - linearY * 1.5371385 - linearZ * 0.4985314),
            toChannel(-linearX * 0.969266 + linearY * 1.8760108 + linearZ * 0.041556),
            toChannel(linearX * 0.0556434 - linearY * 0.2040259 + linearZ * 1.0572252),
        ];
    }

    /* Associe chaque case a une couleur de la palette, avec tramage Floyd-Steinberg optionnel. */
    function mapCells({ channels, columns, rows, palette, isDitheringEnabled }) {
        const working = Float32Array.from(channels);
        const indices = new Uint8Array(columns * rows);

        const diffuse = (cellIndex, errorRed, errorGreen, errorBlue, factor) => {
            working[cellIndex * 3] += errorRed * factor;
            working[cellIndex * 3 + 1] += errorGreen * factor;
            working[cellIndex * 3 + 2] += errorBlue * factor;
        };

        for (let row = 0; row < rows; row += 1) {
            for (let column = 0; column < columns; column += 1) {
                const cellIndex = row * columns + column;
                const red = working[cellIndex * 3];
                const green = working[cellIndex * 3 + 1];
                const blue = working[cellIndex * 3 + 2];
                const paletteIndex = findNearestColorIndex(rgbToLab(red, green, blue), palette);
                indices[cellIndex] = paletteIndex;

                if (!isDitheringEnabled) continue;
                const chosen = palette[paletteIndex].rgb;
                const errorRed = red - chosen[0];
                const errorGreen = green - chosen[1];
                const errorBlue = blue - chosen[2];
                if (column + 1 < columns) diffuse(cellIndex + 1, errorRed, errorGreen, errorBlue, 7 / 16);
                if (row + 1 < rows) {
                    if (column > 0) diffuse(cellIndex + columns - 1, errorRed, errorGreen, errorBlue, 3 / 16);
                    diffuse(cellIndex + columns, errorRed, errorGreen, errorBlue, 5 / 16);
                    if (column + 1 < columns) diffuse(cellIndex + columns + 1, errorRed, errorGreen, errorBlue, 1 / 16);
                }
            }
        }

        return indices;
    }

    window.LegoMosaic = { sampleGrid, buildPalette, mapCells };
})();
