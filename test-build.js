#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { build } = require('./build.js');

function testBuild() {
  console.log('Testing AA Industrial Awnings build system...');
  
  // Clean any existing builds
  const distServer = path.join(__dirname, 'dist_server');
  const distLocal = path.join(__dirname, 'dist_local');
  
  if (fs.existsSync(distServer)) {
    fs.rmSync(distServer, { recursive: true });
  }
  if (fs.existsSync(distLocal)) {
    fs.rmSync(distLocal, { recursive: true });
  }
  
  // Run build
  console.log('Running build...');
  build();
  
  // Test that directories were created
  console.log('Checking build outputs...');
  
  if (!fs.existsSync(distServer)) {
    throw new Error('dist_server directory not created');
  }
  if (!fs.existsSync(distLocal)) {
    throw new Error('dist_local directory not created');
  }
  
  // Test that key files exist
  const testFiles = [
    'index.html',
    'index_diag.html',
    'assets/app.js',
    'assets/style.css',
    'images/gallery/Set01A.webp'
  ];
  
  for (const file of testFiles) {
    const serverFile = path.join(distServer, file);
    const localFile = path.join(distLocal, file);
    
    if (!fs.existsSync(serverFile)) {
      throw new Error(`Missing file in server build: ${file}`);
    }
    if (!fs.existsSync(localFile)) {
      throw new Error(`Missing file in local build: ${file}`);
    }
  }
  
  // Test URL rewriting in local build
  console.log('Testing URL rewriting...');
  
  const localIndexContent = fs.readFileSync(path.join(distLocal, 'index.html'), 'utf8');
  const localAppJsContent = fs.readFileSync(path.join(distLocal, 'assets/app.js'), 'utf8');
  
  // Should have relative paths in local build
  if (localIndexContent.includes('href="/assets/')) {
    throw new Error('Local build still contains absolute asset paths in HTML');
  }
  if (localAppJsContent.includes("'/images/gallery/")) {
    throw new Error('Local build still contains absolute paths in JavaScript');
  }
  
  // Test URL preservation in server build
  const serverIndexContent = fs.readFileSync(path.join(distServer, 'index.html'), 'utf8');
  const serverAppJsContent = fs.readFileSync(path.join(distServer, 'assets/app.js'), 'utf8');
  
  // Should have absolute paths in server build
  if (!serverIndexContent.includes('href="/assets/')) {
    throw new Error('Server build missing absolute asset paths in HTML');
  }
  if (!serverAppJsContent.includes("'/images/gallery/")) {
    throw new Error('Server build missing absolute paths in JavaScript');
  }
  
  // Test cache-busting versions
  if (!localIndexContent.includes('?v=build')) {
    throw new Error('Local build missing cache-busting version');
  }
  if (!serverIndexContent.includes('?v=build')) {
    throw new Error('Server build missing cache-busting version');
  }
  
  console.log('✅ All tests passed!');
  console.log(`✅ Server build: ${distServer}`);
  console.log(`✅ Local build: ${distLocal}`);
  console.log('✅ URL rewriting working correctly');
  console.log('✅ Cache-busting versions applied');
  console.log('✅ All required files present');
}

if (require.main === module) {
  try {
    testBuild();
    console.log('\n🎉 Build system test completed successfully!');
  } catch (error) {
    console.error('\n❌ Build system test failed:', error.message);
    process.exit(1);
  }
}

module.exports = { testBuild };