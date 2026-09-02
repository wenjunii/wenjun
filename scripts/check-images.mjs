import { readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { works, publications, commissions, homeFeature } from '../src/data/content.js';

// Enforce GitHub Pages' exact filename case even on case-insensitive filesystems.
function isExactFile(root, parts) {
  let directory = root;
  for (let index = 0; index < parts.length; index++) {
    let entries;
    try {
      entries = readdirSync(directory, { withFileTypes: true });
    } catch (error) {
      if (error.code === 'ENOENT' || error.code === 'ENOTDIR') return false;
      throw error;
    }

    const entry = entries.find(candidate => candidate.name === parts[index]);
    if (!entry) return false;
    if (index === parts.length - 1) return entry.isFile();
    if (!entry.isDirectory()) return false;
    directory = join(directory, entry.name);
  }
  return false;
}

export function validateGalleryImages(collections, imagesRoot) {
  const errors = [];
  let checked = 0;
  for (const [section, projects] of Object.entries(collections)) {
    for (const project of projects) {
      for (const image of project.images ?? []) {
        const filename = typeof image === 'string' ? image : image.file;
        const parts = [section, project.id, filename];
        checked++;
        if (!isExactFile(imagesRoot, parts)) {
          errors.push(`Missing image: public/images/${parts.join('/')} (check spelling and capitalization)`);
        }
      }
    }
  }
  return { checked, errors };
}

export function validateHomeFeature(feature, projects, imagesRoot) {
  const work = projects.find(project => project.id === feature.workId);
  if (!work) {
    return { checked: 0, errors: [`Unknown homepage work: ${feature.workId}`] };
  }
  if (typeof feature.image !== 'string' || !feature.image.trim()) {
    return { checked: 0, errors: ['Homepage feature must specify an image filename.'] };
  }

  return validateGalleryImages({ works: [{ id: work.id, images: [feature.image] }] }, imagesRoot);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const imagesRoot = fileURLToPath(new URL('../public/images/', import.meta.url));
  const galleries = validateGalleryImages({ works, books: publications, commission: commissions }, imagesRoot);
  const homepage = validateHomeFeature(homeFeature, works, imagesRoot);
  const errors = [...galleries.errors, ...homepage.errors];
  if (errors.length) {
    for (const error of errors) console.error(error);
    process.exitCode = 1;
  } else {
    console.log(`Validated ${galleries.checked} gallery image references and ${homepage.checked} homepage image reference.`);
  }
}
