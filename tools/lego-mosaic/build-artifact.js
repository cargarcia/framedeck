/* Genere une page autonome (CSS + JS inlines) a partir des sources, pour publication en Artifact.
   Usage: node tools/lego-mosaic/build-artifact.js [chemin/de/sortie.html] */
const fs = require('fs');
const path = require('path');

const sourceDirectory = __dirname;
const outputPath = process.argv[2] || path.join(sourceDirectory, 'dist', 'lego-mosaic.html');

const read = (fileName) => fs.readFileSync(path.join(sourceDirectory, fileName), 'utf8');

const markup = read('index.html');
const bodyContent = markup
    .slice(markup.indexOf('<body>') + '<body>'.length, markup.indexOf('</body>'))
    // Les scripts externes sont remplaces par leur contenu inline plus bas.
    .replace(/[ \t]*<script src="[^"]+"><\/script>\n?/g, '');
const scripts = ['palette.js', 'mosaic.js', 'renderer.js', 'app.js'].map(read).join('\n');

// L'Artifact fournit lui-meme doctype/head/body: on n'emet que le contenu de page.
const page = `<title>LEGO Mosaic — photo vers tableau de dots</title>
<style>
${read('styles.css')}
</style>
${bodyContent.trim()}
<script>
${scripts}
</script>
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, page);
console.log(`Page autonome écrite: ${outputPath} (${Math.round(page.length / 1024)} Ko)`);
