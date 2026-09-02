# 陈文俊 Wenjun Chen — Interdisciplinary Artist Portfolio

Live Website: [chenwenjun.net](https://chenwenjun.net/)

Repository: [github.com/wenjunii/wenjun](https://github.com/wenjunii/wenjun)

Portfolio website of Wenjun Chen, an interdisciplinary artist working on new media, exploring the mixed relationship between real and virtual.

## 🌟 Features

- **Bilingual Experience**: Full support for English and Chinese (Simplified).
- **Bilingual Artist CV**: Selected exhibitions, awards, collections, commissions, and education in both languages, with access to the shared full CV.
- **Modern Layout**: Responsive design optimized for Desktop, Tablet, and Mobile devices.
- **Featured Homepage Work**: Hometown XR's animated `19.GIF`, with its title, year, medium, and project link kept in sync with the portfolio content.
- **High-Resolution Galleries**: Custom-built lightbox component with tap-to-zoom support for viewing artistic details.
- **Portrait Image Layout**: Standard gallery portraits are centered at up to 680px high and scale proportionally on narrow screens. Landscape images and full-resolution views keep their existing sizing.
- **Fast Performance**: Built with Vite for nearly instantaneous loading and smooth transitions.
- **Minimalist Aesthetics**: Clean, typography-focused design that prioritizes the artist's work.

## 🛠️ Technology Stack

- **Build Tool**: [Vite](https://vitejs.dev/)
- **Logic**: Vanilla JavaScript (ES Modules / Component-based structure)
- **Styling**: Vanilla CSS (CSS Variables / Responsive Design System)
- **Deployment**: GitHub Pages via GitHub Actions

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) 24, matching the GitHub Actions environment.

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/wenjunii/wenjun.git
   cd wenjun
   ```
2. Install dependencies:
   ```bash
   npm ci
   ```

### Available Scripts

Start the local development server:
```bash
npm run dev
```

Generate an optimized production bundle:
```bash
npm run build
```

Preview the production build locally:
```bash
npm run preview
```

Audit dependencies, including build tooling, for high-severity vulnerabilities:
```bash
npm run audit
```

Check the portfolio content module's JavaScript syntax:
```bash
npm run check:content
```

Verify the homepage's selected work and check that its image and every gallery image exist with the exact folder and filename capitalization:
```bash
npm run check:images
```

Run the gallery and homepage image-validator regression tests:
```bash
npm test
```

Run the dependency audit, content syntax check, tests, image-path validation, and production build used by GitHub Actions:
```bash
npm run check
```

Run the same checks locally before publishing. This command does not upload the site; GitHub Pages publishes after the pull request is merged into `main`.
```bash
npm run deploy
```

## 📝 Updating Portfolio Content

Portfolio text, CV entries, projects, publications, and contact details are maintained in [`src/data/content.js`](src/data/content.js).

The English `cv` and Chinese `cvCN` objects each define a `fullCvUrl`. Both biography pages currently point to the same shared Google Docs CV. Update the fields independently if separate language-specific documents are introduced later.

### Homepage Feature

The `homeFeature` object in `src/data/content.js` selects the work and image shown on the homepage:

```js
export const homeFeature = {
  workId: 'hometown-xr',
  image: '19.GIF',
};
```

The image resolves to `public/images/works/hometown-xr/19.GIF`. The homepage reads the title, year, and medium from the matching `works` entry and links to `#/works/hometown-xr`, so these details do not need to be duplicated in `src/pages/home.js`. The GIF remains animated and scales proportionally on desktop and mobile.

To feature another work, update `workId` and `image` together. `npm run check:images` rejects unknown work IDs, empty image filenames, missing files, and capitalization mismatches. The social-sharing thumbnail is separate and remains unchanged by this selection.

### Project Images

Image folders must match the project `id` exactly:

| Collection | Image folder |
| --- | --- |
| `works` | `public/images/works/<id>/` |
| `publications` | `public/images/books/<id>/` |
| `commissions` | `public/images/commission/<id>/` |

Hometown XR uses `id: 'hometown-xr'` and seven images in `public/images/works/hometown-xr/`. Keep filenames and extensions identical to the entries in `images`, including the uppercase extension in `19.GIF`. Entries may be filenames or objects with a `file` and optional `caption`.

Portrait orientation is detected when an image loads. Standard portrait galleries are horizontally centered, preserve the original aspect ratio, and use a 680px maximum height. The sizing rule is in `src/styles/pages.css`; images explicitly marked `fullRes` retain their original inline sizing. Lightbox and zoom behavior are unchanged.

Include both the content edit and image files in the same pull request, and run `npm run check` before publishing.

## 🌐 Deployment & Republishing

This website is automatically deployed to **GitHub Pages** using **GitHub Actions**.

### Automatic Deployment
The `main` branch is protected. Publish changes through a pull request:
1. Create a branch and commit the website update.
2. Push the branch and open a pull request targeting `main`.
3. Confirm that the required checks pass.
4. Merge the pull request.

The **Check website** workflow runs `npm run check` on pull requests targeting `main`. Every merge to `main` triggers **Deploy to GitHub Pages**, which repeats the checks, builds the site, and updates the live page.

### Manual Redeployment / Republishing
If you have unpublished the page or want to manually trigger a fresh deploy without changing code:
1. Navigate to your repository on GitHub.
2. Click on the **Actions** tab at the top.
3. In the left-hand sidebar, select **Deploy to GitHub Pages**.
4. Click the **Run workflow** dropdown on the right side.
5. Select the `main` branch and click **Run workflow**.

### Custom Domain Configuration
The website is configured to run under the custom domain **[chenwenjun.net](https://chenwenjun.net/)**.

#### 1. Codebase Configurations
* **CNAME file**: A `CNAME` file is located at `public/CNAME` containing `chenwenjun.net`. During build, Vite copies this file to the root of the `dist` directory.
* **Base Path**: The base path in `vite.config.js` is set to `'/'` to ensure asset URLs resolve correctly from the root of the custom domain.

#### 2. DNS Settings (Domain Registrar)
To route the custom domain to this GitHub Pages site, the following DNS records are configured at the domain registrar:
* **Apex Domain A Records** (pointing `@` or blank to GitHub Pages servers):
  * `185.199.108.153`
  * `185.199.109.153`
  * `185.199.110.153`
  * `185.199.111.153`
* **Subdomain CNAME Record** (routing `www.chenwenjun.net` to the GitHub Pages URL):
  * Host: `www`
  * Value: `wenjunii.github.io`

### Social Sharing Thumbnail (Open Graph)
When sharing the website link (`https://chenwenjun.net`) on messaging apps (iMessage, WhatsApp, Slack, Teams) or social media (X/Twitter, LinkedIn, Facebook), a rich visual preview card is displayed.

#### Codebase Configuration
* **Thumbnail File**: Located at `public/images/og-thumbnail.jpg`. The recommended size is `1200 x 630` pixels (aspect ratio `1.91:1`).
* **HTML Integration**: `index.html` contains the required `<meta>` tags for `og:image` and `twitter:image` pointing to `https://chenwenjun.net/images/og-thumbnail.jpg` as well as the standard `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`.

To change the thumbnail, simply replace the file at `public/images/og-thumbnail.jpg` with a new image of the same name and push the change to GitHub.

## 📜 License
© 2026 Wenjun Chen. All rights reserved.
