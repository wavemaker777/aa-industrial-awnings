#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Generate cache-busting version string
const generateVersion = () => {
  const timestamp = Date.now();
  return `build${timestamp}`;
};

// Copy directory recursively
const copyDir = (src, dest) => {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    // Skip build outputs, git, and build script itself
    if (entry.name.startsWith('dist_') || entry.name === '.git' || entry.name === 'build.js') {
      continue;
    }
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
};

// Rewrite asset URLs in content
const rewriteAssetUrls = (content, useRelativePaths = false, version = '') => {
  let result = content;
  
  if (useRelativePaths) {
    // For relative paths, replace all absolute paths with relative ones
    // HTML attributes: href="/assets/" or src="/images/" etc
    result = result.replace(/(\bhref="|src=")\/assets\//g, '$1assets/');
    result = result.replace(/(\bhref="|src=")\/images\//g, '$1images/');
    
    // JavaScript string literals: '/images/gallery/...' 
    result = result.replace(/'\/images\//g, "'images/");
    result = result.replace(/"\/images\//g, '"images/');
    
    // CSS url() references
    result = result.replace(/url\(['"]?\/assets\//g, "url('assets/");
    result = result.replace(/url\(['"]?\/images\//g, "url('images/");
  } else {
    // For absolute paths, ensure they start with / (should already be correct)
    // This preserves existing absolute paths and adds cache-busting
  }
  
  // Add cache-busting version to CSS and JS files if version provided
  if (version) {
    // Match existing version parameters and replace or add new ones
    result = result.replace(/(\.(css|js))(\?v=[^"'\s]*)?/g, `$1?v=${version}`);
  }
  
  return result;
};

// Main build function
const build = () => {
  console.log('Starting AA Industrial Awnings dual build...');
  
  const version = generateVersion();
  console.log(`Cache-busting version: ${version}`);
  
  const rootDir = __dirname;
  const distServerDir = path.join(rootDir, 'dist_server');
  const distLocalDir = path.join(rootDir, 'dist_local');
  
  // Clean existing dist directories
  if (fs.existsSync(distServerDir)) {
    fs.rmSync(distServerDir, { recursive: true });
  }
  if (fs.existsSync(distLocalDir)) {
    fs.rmSync(distLocalDir, { recursive: true });
  }
  
  console.log('Copying files...');
  
  // Copy files to both distributions
  copyDir(rootDir, distServerDir);
  copyDir(rootDir, distLocalDir);
  
  console.log('Rewriting URLs for server build (absolute paths)...');
  
  // Process server build (absolute paths)
  const serverIndexPath = path.join(distServerDir, 'index.html');
  const serverAppJsPath = path.join(distServerDir, 'assets', 'app.js');
  const serverDiagPath = path.join(distServerDir, 'index_diag.html');
  
  if (fs.existsSync(serverIndexPath)) {
    const indexContent = fs.readFileSync(serverIndexPath, 'utf8');
    const rewrittenIndex = rewriteAssetUrls(indexContent, false, version);
    fs.writeFileSync(serverIndexPath, rewrittenIndex);
  }
  
  if (fs.existsSync(serverAppJsPath)) {
    const appJsContent = fs.readFileSync(serverAppJsPath, 'utf8');
    const rewrittenAppJs = rewriteAssetUrls(appJsContent, false, version);
    fs.writeFileSync(serverAppJsPath, rewrittenAppJs);
  }
  
  if (fs.existsSync(serverDiagPath)) {
    const diagContent = fs.readFileSync(serverDiagPath, 'utf8');
    const rewrittenDiag = rewriteAssetUrls(diagContent, false, version);
    fs.writeFileSync(serverDiagPath, rewrittenDiag);
  }
  
  console.log('Rewriting URLs for local build (relative paths)...');
  
  // Process local build (relative paths)
  const localIndexPath = path.join(distLocalDir, 'index.html');
  const localAppJsPath = path.join(distLocalDir, 'assets', 'app.js');
  const localDiagPath = path.join(distLocalDir, 'index_diag.html');
  
  if (fs.existsSync(localIndexPath)) {
    const indexContent = fs.readFileSync(localIndexPath, 'utf8');
    const rewrittenIndex = rewriteAssetUrls(indexContent, true, version);
    fs.writeFileSync(localIndexPath, rewrittenIndex);
  }
  
  if (fs.existsSync(localAppJsPath)) {
    const appJsContent = fs.readFileSync(localAppJsPath, 'utf8');
    const rewrittenAppJs = rewriteAssetUrls(appJsContent, true, version);
    fs.writeFileSync(localAppJsPath, rewrittenAppJs);
  }
  
  if (fs.existsSync(localDiagPath)) {
    const diagContent = fs.readFileSync(localDiagPath, 'utf8');
    const rewrittenDiag = rewriteAssetUrls(diagContent, true, version);
    fs.writeFileSync(localDiagPath, rewrittenDiag);
  }
  
  console.log('Build completed successfully!');
  console.log(`Server build (absolute paths): ${distServerDir}`);
  console.log(`Local build (relative paths): ${distLocalDir}`);
  console.log(`Cache-busting version: ${version}`);
};

// Run build if called directly
if (require.main === module) {
  build();
}

module.exports = { build, rewriteAssetUrls, generateVersion };