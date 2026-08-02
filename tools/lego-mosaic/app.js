/* Cablage de l'interface: lecture de la photo, parametres, rendu et exports. */
(function () {
    const { catalog, isLightColor } = window.LegoPalette;
    const { sampleGrid, buildPalette, mapCells } = window.LegoMosaic;
    const { drawMosaic } = window.LegoRenderer;

    const STUD_SIZE_MM = 8;
    const elements = {};
    [
        'fileInput', 'pickFileButton', 'dropzone', 'fileName', 'fitSelect',
        'columnsInput', 'rowsInput', 'lockAspectInput', 'physicalSize',
        'paletteModeSelect', 'colorCountInput', 'colorCountValue', 'colorCountField', 'ditherInput',
        'swatchGrid', 'allowedCount', 'selectAllColors', 'clearAllColors',
        'brightnessInput', 'brightnessValue', 'contrastInput', 'contrastValue',
        'saturationInput', 'saturationValue', 'studStyleSelect', 'gridInput', 'labelInput',
        'mosaicCanvas', 'emptyState', 'bomList', 'totalPieces', 'exportPngButton', 'exportPlanButton',
    ].forEach((id) => {
        elements[id] = document.getElementById(id);
    });

    const state = {
        sourceImage: null,
        fileLabel: '',
        allowedColorNames: new Set(catalog.map((color) => color.name)),
        lastResult: null,
    };

    function renderSwatchGrid() {
        elements.swatchGrid.innerHTML = '';
        catalog.forEach((color) => {
            const swatch = document.createElement('button');
            swatch.type = 'button';
            swatch.className = 'swatch';
            swatch.style.background = color.hex;
            swatch.title = `${color.name} (${color.hex})`;
            swatch.addEventListener('click', () => {
                if (state.allowedColorNames.has(color.name)) state.allowedColorNames.delete(color.name);
                else state.allowedColorNames.add(color.name);
                syncSwatchStates();
                scheduleRegenerate();
            });
            elements.swatchGrid.appendChild(swatch);
        });
        syncSwatchStates();
    }

    function syncSwatchStates() {
        Array.from(elements.swatchGrid.children).forEach((swatch, index) => {
            swatch.classList.toggle('is-active', state.allowedColorNames.has(catalog[index].name));
        });
        elements.allowedCount.textContent = String(state.allowedColorNames.size);
    }

    function readParams() {
        const columns = clampInt(elements.columnsInput.value, 8, 256);
        const rows = clampInt(elements.rowsInput.value, 8, 256);
        return {
            columns,
            rows,
            fit: elements.fitSelect.value,
            paletteMode: elements.paletteModeSelect.value,
            colorCount: clampInt(elements.colorCountInput.value, 2, 32),
            isDitheringEnabled: elements.ditherInput.checked,
            studStyle: elements.studStyleSelect.value,
            isGridVisible: elements.gridInput.checked,
            isLabelVisible: elements.labelInput.checked,
            adjustments: {
                brightness: Number(elements.brightnessInput.value),
                contrast: Number(elements.contrastInput.value),
                saturation: Number(elements.saturationInput.value),
            },
        };
    }

    function clampInt(value, minimum, maximum) {
        const parsed = Math.round(Number(value));
        if (!Number.isFinite(parsed)) return minimum;
        return Math.max(minimum, Math.min(maximum, parsed));
    }

    function computePreviewStudSize(columns, rows) {
        const availableWidth = Math.min(1100, elements.mosaicCanvas.parentElement.clientWidth - 24);
        return Math.max(4, Math.min(28, Math.floor(availableWidth / Math.max(columns, rows * 0.6))));
    }

    function regenerate() {
        if (!state.sourceImage) return;
        const params = readParams();
        const allowedColors = catalog.filter((color) => state.allowedColorNames.has(color.name));
        if (!allowedColors.length) {
            elements.emptyState.textContent = 'Active au moins une couleur LEGO.';
            elements.emptyState.style.display = 'block';
            elements.mosaicCanvas.style.display = 'none';
            return;
        }

        const channels = sampleGrid({
            image: state.sourceImage,
            columns: params.columns,
            rows: params.rows,
            fit: params.fit,
            adjustments: params.adjustments,
        });
        const palette = buildPalette({
            channels,
            colorCount: params.colorCount,
            allowedColors,
            paletteMode: params.paletteMode,
        });
        const indices = mapCells({
            channels,
            columns: params.columns,
            rows: params.rows,
            palette,
            isDitheringEnabled: params.isDitheringEnabled,
        });

        state.lastResult = { ...params, palette, indices };
        elements.emptyState.style.display = 'none';
        elements.mosaicCanvas.style.display = 'block';
        drawMosaic({
            canvas: elements.mosaicCanvas,
            columns: params.columns,
            rows: params.rows,
            indices,
            palette,
            studSize: computePreviewStudSize(params.columns, params.rows),
            studStyle: params.studStyle,
            isGridVisible: params.isGridVisible,
            isLabelVisible: params.isLabelVisible,
        });
        renderBillOfMaterials();
        updatePhysicalSize(params.columns, params.rows);
    }

    let regenerateTimer = null;
    function scheduleRegenerate() {
        window.clearTimeout(regenerateTimer);
        regenerateTimer = window.setTimeout(regenerate, 80);
    }

    function countPieces() {
        const counts = new Map();
        state.lastResult.indices.forEach((paletteIndex) => {
            counts.set(paletteIndex, (counts.get(paletteIndex) || 0) + 1);
        });
        return Array.from(counts.entries())
            .map(([paletteIndex, count]) => ({ paletteIndex, count, color: state.lastResult.palette[paletteIndex] }))
            .sort((first, second) => second.count - first.count);
    }

    function renderBillOfMaterials() {
        const entries = countPieces();
        const total = state.lastResult.indices.length;
        elements.totalPieces.textContent = `— ${total} dots, ${entries.length} couleurs`;
        elements.bomList.innerHTML = '';
        entries.forEach(({ paletteIndex, count, color }) => {
            const item = document.createElement('li');
            const swatch = document.createElement('span');
            swatch.className = 'bom-swatch';
            swatch.style.background = color.hex;
            swatch.style.color = isLightColor(color.rgb) ? '#000' : '#fff';
            swatch.textContent = String(paletteIndex + 1);
            const name = document.createElement('span');
            name.className = 'bom-name';
            name.textContent = color.name;
            name.title = `${color.name} ${color.hex}`;
            const countLabel = document.createElement('span');
            countLabel.className = 'bom-count';
            countLabel.textContent = `${count} (${Math.round((count / total) * 100)}%)`;
            item.append(swatch, name, countLabel);
            elements.bomList.appendChild(item);
        });
    }

    function updatePhysicalSize(columns, rows) {
        const width = ((columns * STUD_SIZE_MM) / 10).toFixed(1);
        const height = ((rows * STUD_SIZE_MM) / 10).toFixed(1);
        elements.physicalSize.textContent = `Format réel ≈ ${width} × ${height} cm (${columns * rows} dots)`;
    }

    function loadImageFile(file) {
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = () => {
            const image = new Image();
            image.onload = () => {
                state.sourceImage = image;
                state.fileLabel = file.name.replace(/\.[^.]+$/, '');
                elements.fileName.textContent = file.name;
                if (elements.lockAspectInput.checked) syncRowsFromColumns();
                regenerate();
            };
            image.src = reader.result;
        };
        // DataURL plutot que blob: pour que le canvas reste exploitable meme en ouverture file://.
        reader.readAsDataURL(file);
    }

    function syncRowsFromColumns() {
        if (!state.sourceImage) return;
        const columns = clampInt(elements.columnsInput.value, 8, 256);
        elements.rowsInput.value = String(
            clampInt(Math.round((columns * state.sourceImage.height) / state.sourceImage.width), 8, 256),
        );
    }

    function syncColumnsFromRows() {
        if (!state.sourceImage) return;
        const rows = clampInt(elements.rowsInput.value, 8, 256);
        elements.columnsInput.value = String(
            clampInt(Math.round((rows * state.sourceImage.width) / state.sourceImage.height), 8, 256),
        );
    }

    function downloadBlob(blob, fileName) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
    }

    function exportPng() {
        if (!state.lastResult) return;
        const exportCanvas = document.createElement('canvas');
        drawMosaic({
            canvas: exportCanvas,
            columns: state.lastResult.columns,
            rows: state.lastResult.rows,
            indices: state.lastResult.indices,
            palette: state.lastResult.palette,
            studSize: 30,
            studStyle: state.lastResult.studStyle,
            isGridVisible: state.lastResult.isGridVisible,
            isLabelVisible: state.lastResult.isLabelVisible,
        });
        exportCanvas.toBlob((blob) => downloadBlob(blob, `${state.fileLabel || 'mosaic'}-lego.png`), 'image/png');
    }

    function exportPlan() {
        if (!state.lastResult) return;
        const { columns, rows, indices, palette } = state.lastResult;
        const lines = [
            `Plan de montage LEGO — ${columns} x ${rows} dots`,
            '',
            'Légende:',
            ...countPieces().map(
                ({ paletteIndex, count, color }) =>
                    `  ${String(paletteIndex + 1).padStart(2, ' ')} = ${color.name} (${color.hex}) x${count}`,
            ),
            '',
            'Grille (ligne 1 = haut):',
        ];
        for (let row = 0; row < rows; row += 1) {
            const cells = [];
            for (let column = 0; column < columns; column += 1) {
                cells.push(String(indices[row * columns + column] + 1).padStart(2, ' '));
            }
            lines.push(`${String(row + 1).padStart(3, ' ')} | ${cells.join(' ')}`);
        }
        downloadBlob(new Blob([lines.join('\n')], { type: 'text/plain' }), `${state.fileLabel || 'mosaic'}-plan.txt`);
    }

    function bindEvents() {
        elements.pickFileButton.addEventListener('click', () => elements.fileInput.click());
        elements.fileInput.addEventListener('change', (event) => loadImageFile(event.target.files[0]));
        ['dragenter', 'dragover'].forEach((eventName) =>
            elements.dropzone.addEventListener(eventName, (event) => {
                event.preventDefault();
                elements.dropzone.classList.add('is-dragover');
            }),
        );
        ['dragleave', 'drop'].forEach((eventName) =>
            elements.dropzone.addEventListener(eventName, (event) => {
                event.preventDefault();
                elements.dropzone.classList.remove('is-dragover');
            }),
        );
        elements.dropzone.addEventListener('drop', (event) => loadImageFile(event.dataTransfer.files[0]));

        elements.columnsInput.addEventListener('input', () => {
            if (elements.lockAspectInput.checked) syncRowsFromColumns();
            scheduleRegenerate();
        });
        elements.rowsInput.addEventListener('input', () => {
            if (elements.lockAspectInput.checked) syncColumnsFromRows();
            scheduleRegenerate();
        });
        elements.lockAspectInput.addEventListener('change', () => {
            if (elements.lockAspectInput.checked) syncRowsFromColumns();
            scheduleRegenerate();
        });
        document.querySelectorAll('[data-preset]').forEach((button) =>
            button.addEventListener('click', () => {
                const [columns, rows] = button.dataset.preset.split('x');
                elements.columnsInput.value = columns;
                elements.rowsInput.value = rows;
                elements.lockAspectInput.checked = false;
                scheduleRegenerate();
            }),
        );

        elements.paletteModeSelect.addEventListener('change', () => {
            const isManual = elements.paletteModeSelect.value === 'manual';
            elements.colorCountField.style.display = isManual ? 'none' : 'flex';
            // En mode manuel la palette autorisee EST la palette finale: on ouvre le panneau.
            if (isManual) document.querySelector('.swatch-panel').open = true;
            scheduleRegenerate();
        });
        elements.colorCountInput.addEventListener('input', () => {
            elements.colorCountValue.textContent = elements.colorCountInput.value;
            scheduleRegenerate();
        });
        elements.selectAllColors.addEventListener('click', () => {
            catalog.forEach((color) => state.allowedColorNames.add(color.name));
            syncSwatchStates();
            scheduleRegenerate();
        });
        elements.clearAllColors.addEventListener('click', () => {
            state.allowedColorNames.clear();
            syncSwatchStates();
            scheduleRegenerate();
        });

        elements.brightnessInput.addEventListener('input', () => {
            elements.brightnessValue.textContent = elements.brightnessInput.value;
            scheduleRegenerate();
        });
        elements.contrastInput.addEventListener('input', () => {
            elements.contrastValue.textContent = elements.contrastInput.value;
            scheduleRegenerate();
        });
        elements.saturationInput.addEventListener('input', () => {
            elements.saturationValue.textContent = Number(elements.saturationInput.value).toFixed(2);
            scheduleRegenerate();
        });

        [elements.fitSelect, elements.ditherInput, elements.studStyleSelect, elements.gridInput, elements.labelInput].forEach(
            (element) => element.addEventListener('change', scheduleRegenerate),
        );
        window.addEventListener('resize', scheduleRegenerate);
        elements.exportPngButton.addEventListener('click', exportPng);
        elements.exportPlanButton.addEventListener('click', exportPlan);
    }

    renderSwatchGrid();
    bindEvents();
    updatePhysicalSize(clampInt(elements.columnsInput.value, 8, 256), clampInt(elements.rowsInput.value, 8, 256));
})();
