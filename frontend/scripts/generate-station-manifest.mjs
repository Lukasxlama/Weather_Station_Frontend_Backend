// scripts/generate-station-manifest.mjs
import { globby } from 'globby';
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');         // <repo>/frontend
const srcDir = join(root, 'src');
const stationDir = join(srcDir, 'assets', 'station');

await mkdir(stationDir, { recursive: true }); // ensure folder exists

// <<< KEY CHANGE: search relative to srcDir with POSIX-like pattern >>>
const images = await globby(
    ['assets/station/**/*.{jpg,jpeg,png,webp,avif,gif}'],
    { cwd: srcDir, onlyFiles: true, caseSensitiveMatch: false }
);

const manifest = {
    generatedAt: new Date().toISOString(),
    images: images.sort().map(src => ({ src, alt: '' }))
};

await writeFile(join(stationDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

console.log(`📁 stationDir: ${stationDir}`);
console.log(`🖼️ images: ${manifest.images.length}`);
console.log(`📝 wrote: ${join(stationDir, 'manifest.json')}`);
