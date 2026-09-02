import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { validateGalleryImages, validateHomeFeature } from './check-images.mjs';

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

test('validates the homepage image independently of the project gallery', t => {
  const root = fixture(t, ['works/hometown-xr/19.GIF']);
  const result = validateHomeFeature({ workId: 'hometown-xr', image: '19.GIF' }, [{ id: 'hometown-xr', images: [] }], root);
  assert.deepEqual(result, { checked: 1, errors: [] });
});

test('rejects a homepage work that is not registered even if its image exists', t => {
  const root = fixture(t, ['works/hometown-xr/19.GIF']);
  const result = validateHomeFeature({ workId: 'hometown-xr', image: '19.GIF' }, [], root);
  assert.deepEqual(result, { checked: 0, errors: ['Unknown homepage work: hometown-xr'] });
});

test('requires exact homepage image capitalization and an existing file', t => {
  const root = fixture(t, ['works/hometown-xr/19.GIF']);
  for (const image of ['19.gif', 'missing.GIF']) {
    const result = validateHomeFeature({ workId: 'hometown-xr', image }, [{ id: 'hometown-xr' }], root);
    assert.equal(result.checked, 1);
    assert.equal(result.errors.length, 1);
    assert.ok(result.errors[0].includes(`public/images/works/hometown-xr/${image}`));
  }
});

test('requires a nonempty homepage image filename', t => {
  const root = fixture(t, []);
  for (const image of [undefined, null, '', '   ']) {
    const result = validateHomeFeature({ workId: 'hometown-xr', image }, [{ id: 'hometown-xr' }], root);
    assert.deepEqual(result, { checked: 0, errors: ['Homepage feature must specify an image filename.'] });
  }
});
