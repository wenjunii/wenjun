import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { validateGalleryImages } from './check-images.mjs';

function fixture(t, files) {
  const root = mkdtempSync(join(tmpdir(), 'portfolio-images-test-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const file of files) {
    const path = join(root, file);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, 'image fixture');
  }
  return root;
}

test('accepts string and object entries across all gallery sections', t => {
  const root = fixture(t, ['works/hometown-xr/16.jpeg', 'works/hometown-xr/19.GIF', 'books/book/1.jpg', 'commission/studio/1.jpg']);
  const result = validateGalleryImages({
    works: [{ id: 'hometown-xr', images: ['16.jpeg', { file: '19.GIF', caption: 'Projection' }] }],
    books: [{ id: 'book', images: ['1.jpg'] }],
    commission: [{ id: 'studio', images: [{ file: '1.jpg', fullRes: true }] }],
  }, root);
  assert.deepEqual(result, { checked: 4, errors: [] });
});

test('reports a misspelled image folder', t => {
  const root = fixture(t, ['works/honetown-xr/16.jpeg']);
  const result = validateGalleryImages({ works: [{ id: 'hometown-xr', images: ['16.jpeg'] }] }, root);
  assert.equal(result.errors.length, 1);
  assert.match(result.errors[0], /public\/images\/works\/hometown-xr\/16\.jpeg/);
});

test('requires exact filename and folder case on every platform', t => {
  const root = fixture(t, ['works/hometown-xr/19.GIF']);
  const result = validateGalleryImages({ works: [
    { id: 'hometown-xr', images: ['19.gif'] },
    { id: 'Hometown-XR', images: ['19.GIF'] },
  ] }, root);
  assert.equal(result.errors.length, 2);
});

test('reports missing files and does not accept a directory as an image', t => {
  const root = fixture(t, ['works/hometown-xr/16.jpeg']);
  mkdirSync(join(root, 'works/hometown-xr/directory.jpg'));
  const result = validateGalleryImages({ works: [{ id: 'hometown-xr', images: ['missing.jpg', 'directory.jpg'] }] }, root);
  assert.equal(result.errors.length, 2);
});

test('allows projects without gallery images', t => {
  const root = fixture(t, []);
  assert.deepEqual(validateGalleryImages({ works: [{ id: 'empty', images: [] }, { id: 'text-only' }] }, root), { checked: 0, errors: [] });
});
