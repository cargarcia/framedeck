/* Palette LEGO + utilitaires couleur (sRGB <-> Lab). Script classique: expose window.LegoPalette. */
(function () {
    const LEGO_COLORS = [
        { name: 'White', hex: '#F2F3F2' },
        { name: 'Very Light Bluish Gray', hex: '#E6E3DA' },
        { name: 'Light Bluish Gray', hex: '#A0A5A9' },
        { name: 'Dark Bluish Gray', hex: '#6C6E68' },
        { name: 'Black', hex: '#05131D' },
        { name: 'Flat Silver', hex: '#898788' },
        { name: 'Pearl Gold', hex: '#AA7F2E' },
        { name: 'Red', hex: '#C91A09' },
        { name: 'Dark Red', hex: '#720E0F' },
        { name: 'Sand Red', hex: '#D67572' },
        { name: 'Coral', hex: '#FF698F' },
        { name: 'Salmon', hex: '#F6A9BB' },
        { name: 'Pink', hex: '#FC97AC' },
        { name: 'Bright Pink', hex: '#E4ADC8' },
        { name: 'Dark Pink', hex: '#C870A0' },
        { name: 'Magenta', hex: '#923978' },
        { name: 'Purple', hex: '#81007B' },
        { name: 'Medium Lavender', hex: '#A06EB9' },
        { name: 'Lavender', hex: '#CDA4DE' },
        { name: 'Dark Purple', hex: '#3F3691' },
        { name: 'Dark Blue', hex: '#0A3463' },
        { name: 'Blue', hex: '#0055BF' },
        { name: 'Medium Blue', hex: '#5A93DB' },
        { name: 'Bright Light Blue', hex: '#9FC3E9' },
        { name: 'Sand Blue', hex: '#6074A1' },
        { name: 'Dark Azure', hex: '#078BC9' },
        { name: 'Medium Azure', hex: '#36AEBF' },
        { name: 'Dark Turquoise', hex: '#008F9B' },
        { name: 'Light Aqua', hex: '#ADC3C0' },
        { name: 'Aqua', hex: '#B3D7D1' },
        { name: 'Dark Green', hex: '#184632' },
        { name: 'Green', hex: '#237841' },
        { name: 'Bright Green', hex: '#4B9F4A' },
        { name: 'Medium Green', hex: '#7FC475' },
        { name: 'Sand Green', hex: '#A0BCAC' },
        { name: 'Olive Green', hex: '#9B9A5A' },
        { name: 'Lime', hex: '#BBE90B' },
        { name: 'Yellowish Green', hex: '#DFEEA5' },
        { name: 'Yellow', hex: '#F2CD37' },
        { name: 'Bright Light Yellow', hex: '#FFF03A' },
        { name: 'Bright Light Orange', hex: '#F8BB3D' },
        { name: 'Medium Orange', hex: '#FFA70B' },
        { name: 'Orange', hex: '#FE8A18' },
        { name: 'Dark Orange', hex: '#A95500' },
        { name: 'Light Nougat', hex: '#F6D7B3' },
        { name: 'Nougat', hex: '#D09168' },
        { name: 'Medium Nougat', hex: '#AA7D55' },
        { name: 'Tan', hex: '#E4CD9E' },
        { name: 'Dark Tan', hex: '#958A73' },
        { name: 'Reddish Brown', hex: '#582A12' },
        { name: 'Dark Brown', hex: '#352100' },
    ];

    function hexToRgb(hex) {
        const value = parseInt(hex.slice(1), 16);
        return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
    }

    function rgbToHex(red, green, blue) {
        const toPair = (channel) => Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, '0');
        return `#${toPair(red)}${toPair(green)}${toPair(blue)}`.toUpperCase();
    }

    // sRGB -> CIE Lab (D65), pour une distance perceptuelle bien plus fiable que la distance RGB.
    function rgbToLab(red, green, blue) {
        const linearize = (channel) => {
            const normalized = channel / 255;
            return normalized <= 0.04045 ? normalized / 12.92 : Math.pow((normalized + 0.055) / 1.055, 2.4);
        };
        const linearRed = linearize(red);
        const linearGreen = linearize(green);
        const linearBlue = linearize(blue);

        const x = (linearRed * 0.4124564 + linearGreen * 0.3575761 + linearBlue * 0.1804375) / 0.95047;
        const y = linearRed * 0.2126729 + linearGreen * 0.7151522 + linearBlue * 0.072175;
        const z = (linearRed * 0.0193339 + linearGreen * 0.119192 + linearBlue * 0.9503041) / 1.08883;

        const pivot = (component) =>
            component > 0.008856 ? Math.cbrt(component) : 7.787 * component + 16 / 116;
        const pivotX = pivot(x);
        const pivotY = pivot(y);
        const pivotZ = pivot(z);

        return [116 * pivotY - 16, 500 * (pivotX - pivotY), 200 * (pivotY - pivotZ)];
    }

    function labDistanceSquared(firstLab, secondLab) {
        const deltaL = firstLab[0] - secondLab[0];
        const deltaA = firstLab[1] - secondLab[1];
        const deltaB = firstLab[2] - secondLab[2];
        return deltaL * deltaL + deltaA * deltaA + deltaB * deltaB;
    }

    function findNearestColorIndex(lab, colors) {
        let bestIndex = 0;
        let bestDistance = Infinity;
        for (let index = 0; index < colors.length; index += 1) {
            const distance = labDistanceSquared(lab, colors[index].lab);
            if (distance < bestDistance) {
                bestDistance = distance;
                bestIndex = index;
            }
        }
        return bestIndex;
    }

    // Luminance relative, utilisée pour choisir un texte lisible sur une pastille de couleur.
    function isLightColor(rgb) {
        return 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2] > 150;
    }

    const catalog = LEGO_COLORS.map((color) => {
        const rgb = hexToRgb(color.hex);
        return { name: color.name, hex: color.hex, rgb, lab: rgbToLab(rgb[0], rgb[1], rgb[2]) };
    });

    window.LegoPalette = {
        catalog,
        hexToRgb,
        rgbToHex,
        rgbToLab,
        labDistanceSquared,
        findNearestColorIndex,
        isLightColor,
    };
})();
