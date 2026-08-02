/* Genere les versions autonomes (CSS + JS inlines) a partir des sources.
   - dist/lego-mosaic.html          page complete, a deposer sur n'importe quel hebergement statique
   - dist/lego-mosaic.artifact.html fragment sans doctype/head, pour publication en Artifact
   Usage: node tools/lego-mosaic/build-artifact.js [dossier/de/sortie] */
const fs = require('fs');
const path = require('path');

const sourceDirectory = __dirname;
const outputDirectory = process.argv[2] || path.join(sourceDirectory, 'dist');
const PAGE_TITLE = 'LEGO Mosaic — photo vers tableau de dots';

const read = (fileName) => fs.readFileSync(path.join(sourceDirectory, fileName), 'utf8');

const markup = read('index.html');
const bodyContent = markup
    .slice(markup.indexOf('<body>') + '<body>'.length, markup.indexOf('</body>'))
    // Les scripts externes sont remplaces par leur contenu inline.
    .replace(/[ \t]*<script src="[^"]+"><\/script>\n?/g, '')
    .trim();
const styles = read('styles.css');
const scripts = ['palette.js', 'mosaic.js', 'renderer.js', 'app.js'].map(read).join('\n');

const artifactPage = `<title>${PAGE_TITLE}</title>
<style>
${styles}
</style>
${bodyContent}
<script>
${scripts}
</script>
`;

const standalonePage = `<!doctype html>
<html lang="fr">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Convertit une photo en tableau de dots LEGO: dimensions en tenons, palette limitée, découpage en plaques et liste de pièces. Traitement local, aucune image envoyée." />
        <title>${PAGE_TITLE}</title>
        <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='5' fill='%23ffcf00'/%3E%3Ccircle cx='11' cy='11' r='4' fill='%23e0b400'/%3E%3Ccircle cx='21' cy='11' r='4' fill='%23e0b400'/%3E%3Ccircle cx='11' cy='21' r='4' fill='%23e0b400'/%3E%3Ccircle cx='21' cy='21' r='4' fill='%23e0b400'/%3E%3C/svg%3E" />
        <style>
${styles}
        </style>
    </head>
    <body>
${bodyContent}
        <script>
${scripts}
        </script>
    </body>
</html>
`;

fs.mkdirSync(outputDirectory, { recursive: true });
const written = [
    ['lego-mosaic.html', standalonePage],
    ['lego-mosaic.artifact.html', artifactPage],
];
written.forEach(([fileName, content]) => {
    fs.writeFileSync(path.join(outputDirectory, fileName), content);
    console.log(`${path.join(outputDirectory, fileName)} (${Math.round(content.length / 1024)} Ko)`);
});
