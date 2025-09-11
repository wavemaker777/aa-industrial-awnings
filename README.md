# AA Industrial Awnings

Factory-Direct Commercial Awnings & Enclosures website with dual build system.

## Build System

This project implements a dual build system that generates two distributions:

### Server Build (`dist_server/`)
- Uses absolute paths (`/assets/`, `/images/`)
- Optimized for web server deployment
- All asset URLs start with `/` for root-relative paths

### Local Build (`dist_local/`)
- Uses relative paths (`assets/`, `images/`)
- Optimized for local file system or CDN deployment
- All asset URLs are relative to the current directory

## Usage

### Build the project
```bash
npm run build
# or
node build.js
```

### Test the build system
```bash
npm test
# or
node test-build.js
```

## Features

- **Dual Path System**: Automatically converts between absolute and relative asset paths
- **Cache Busting**: Appends unique version strings (`?v=build1234567890`) to CSS and JS files
- **Complete Asset Processing**: Handles HTML, CSS, and JavaScript files
- **Gallery Validation**: All gallery images (Set01A.webp - Set12B.webp) are verified to exist
- **Diagnostics Page**: `/index_diag.html` for testing resource loading

## File Structure

```
/
├── assets/
│   ├── app.js          # Main JavaScript with gallery functionality
│   └── style.css       # Site styles
├── images/
│   ├── gallery/        # Gallery images (Set01A.webp - Set12B.webp)
│   ├── award/          # Award assets
│   └── workshop/       # Process images
├── index.html          # Main site page
├── index_diag.html     # Diagnostics page
├── build.js           # Build system script
├── test-build.js      # Build system tests
└── package.json       # Node.js configuration
```

## Asset Management

All asset references in the codebase are automatically rewritten during build:
- HTML `src` and `href` attributes
- JavaScript string literals for image paths
- CSS `url()` references
- Cache-busting versions for `.css` and `.js` files

The build system ensures both distributions work correctly in their respective deployment environments.