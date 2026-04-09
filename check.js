const fs = require('fs');
const { execSync } = require('child_process');

try {
  // Use node to syntactically validate (not perfect for JSX but esbuild is better)
  execSync('npx esbuild src/app/admin/page.js --format=esm --outdir=out', { stdio: 'pipe' });
  console.log("ESBUILD COMPILED SUCCESSFULLY");
} catch (e) {
  console.log("ERROR COMPILING:");
  console.log(e.stderr.toString());
}
