// ========================================
// Gallery & Lightbox Component
// ========================================

let lightboxEl = null;
let currentImages = [];
let currentIndex = 0;

function ensureLightbox() {
  if (lightboxEl) return;

  lightboxEl = document.createElement('div');
  lightboxEl.className = 'lightbox';
  lightboxEl.id = 'lightbox';
  lightboxEl.innerHTML = `
    <button class="lightbox__close" id="lightbox-close">✕</button>
    <button class="lightbox__nav lightbox__nav--prev" id="lightbox-prev">‹</button>
    <button class="lightbox__nav lightbox__nav--next" id="lightbox-next">›</button>
    <img class="lightbox__image" id="lightbox-image" src="" alt="" />
    <div class="lightbox__counter" id="lightbox-counter"></div>
  `;
  document.body.appendChild(lightboxEl);

  const img = lightboxEl.querySelector('#lightbox-image');
  img.addEventListener('click', (e) => {
    e.stopPropagation(); // Don't close lightbox when clicking image
    lightboxEl.classList.toggle('lightbox--zoomed');
  });

  lightboxEl.querySelector('#lightbox-close').addEventListener('click', closeLightbox);
  lightboxEl.querySelector('#lightbox-prev').addEventListener('click', (e) => {
    e.stopPropagation();
    navigateLightbox(-1);
  });
  lightboxEl.querySelector('#lightbox-next').addEventListener('click', (e) => {
    e.stopPropagation();
    navigateLightbox(1);
  });
  lightboxEl.addEventListener('click', (e) => {
    if (e.target === lightboxEl || e.target.classList.contains('lightbox__scroll-area')) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightboxEl.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
  });
}

function openLightbox(images, index, fullRes = false) {
  ensureLightbox();
  currentImages = images;
  currentIndex = index;
  lightboxEl.classList.toggle('lightbox--full-res', fullRes);
  updateLightboxImage();
  lightboxEl.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  if (!lightboxEl) return;
  lightboxEl.classList.remove('active');
  document.body.style.overflow = '';
}

function navigateLightbox(dir) {
  currentIndex = (currentIndex + dir + currentImages.length) % currentImages.length;
  updateLightboxImage();
}

function updateLightboxImage() {
  const img = lightboxEl.querySelector('#lightbox-image');
  const counter = lightboxEl.querySelector('#lightbox-counter');
  img.src = currentImages[currentIndex];
  img.alt = `Image ${currentIndex + 1} of ${currentImages.length}`;
  counter.textContent = `${currentIndex + 1} / ${currentImages.length}`;

  // Hide nav if only one image
  lightboxEl.querySelector('#lightbox-prev').style.display = currentImages.length <= 1 ? 'none' : '';
  lightboxEl.querySelector('#lightbox-next').style.display = currentImages.length <= 1 ? 'none' : '';
  lightboxEl.querySelector('#lightbox-counter').style.display = currentImages.length <= 1 ? 'none' : '';
}

// Each entry in imageItems can be:
//   - a string: just the filename (e.g. '01.jpg')
//   - an object: { file: '01.jpg', caption: 'Title here' }
// options.fullResolution: if true, clicking opens image in new tab at original size
export function renderGallery(imageItems, basePath = '/images/', options = {}) {
  const container = document.createElement('div');
  container.className = 'work-gallery';

  if (!imageItems || imageItems.length === 0) {
    return container;
  }

  // Normalize to objects
  const items = imageItems.map(item =>
    typeof item === 'string' ? { file: item, caption: '' } : item
  );

  const fullPaths = items.map(item => `${basePath}${item.file}`);

  items.forEach((item, index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'work-gallery__item reveal';

    const img = document.createElement('img');
    img.addEventListener('load', () => {
      if (img.naturalHeight > img.naturalWidth) {
        wrapper.classList.add('work-gallery__item--portrait');
        wrapper.style.setProperty('--image-aspect-ratio', img.naturalWidth / img.naturalHeight);
      }
    }, { once: true });
    img.src = `${basePath}${item.file}`;
    img.alt = item.caption || `Artwork ${index + 1}`;
    img.loading = 'lazy';

    wrapper.appendChild(img);

    if (item.caption) {
      const caption = document.createElement('div');
      caption.className = 'work-gallery__caption';
      caption.textContent = item.caption;
      wrapper.appendChild(caption);
    }

    if (item.fullRes) {
      wrapper.classList.add('work-gallery__item--full-res');
    }

    const openFullRes = options.fullResolution || item.lightboxFullRes || item.fullRes;
    if (openFullRes) {
      wrapper.addEventListener('click', () => {
        openLightbox(fullPaths, index, true);
      });
    } else {
      wrapper.addEventListener('click', () => openLightbox(fullPaths, index));
    }

    container.appendChild(wrapper);
  });

  return container;
}

// Intersection Observer for reveal animations
export function initRevealObserver() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach((el) => {
    observer.observe(el);
  });
}
