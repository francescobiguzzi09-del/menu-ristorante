const fs = require('fs');

const files = [
  'src/app/admin/page.js',
  'src/app/dashboard/page.js',
  'src/app/faq/page.js',
  'src/app/page.js',
  'src/app/privacy/page.js',
  'src/app/termini/page.js',
  'src/components/Footer.js'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Simple string replacements for each file structure
  
  // 1. admin/page.js
  content = content.replace(
    /<div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500\/30 shrink-0">\s*<svg[^>]*><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" \/><\/svg>\s*<\/div>/,
    \`<div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
            <img src="/sm-logo.png" alt="SmartMenu Logo" className="w-full h-full object-contain scale-[1.3]" />
          </div>\`
  );

  // 2. dashboard/page.js
  content = content.replace(
    /<div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">\s*<svg[^>]*><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"\/><\/svg>\s*<\/div>/,
    \`<div className="w-9 h-9 rounded-lg flex items-center justify-center shadow-md overflow-hidden bg-white/5 p-1 border border-white/10">
                <img src="/sm-logo.png" alt="SmartMenu Logo" className="w-full h-full object-contain scale-[1.3]" />
              </div>\`
  );

  // 3. faq, privacy, termini
  content = content.replace(
    /<div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">\s*<svg[^>]*><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"\/><\/svg>\s*<\/div>/g,
    \`<div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                <img src="/sm-logo.png" alt="SmartMenu Logo" className="w-full h-full object-contain scale-[1.3]" />
              </div>\`
  );

  // 4. page.js
  content = content.replace(
    /<div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500\/30">\s*<svg[^>]*><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"\/><\/svg>\s*<\/div>/g,
    \`<div className="w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden">
              <img src="/sm-logo.png" alt="SmartMenu Logo" className="w-full h-full object-contain scale-[1.3]" />
            </div>\`
  );

  // 5. Footer.js
  content = content.replace(
    /<div className="w-8 h-8 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500\/30">\s*<svg[^>]*><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"\/><\/svg>\s*<\/div>/g,
    \`<div className="w-8 h-8 rounded-xl flex items-center justify-center overflow-hidden">
                <img src="/sm-logo.png" alt="SmartMenu Logo" className="w-full h-full object-contain scale-[1.3]" />
              </div>\`
  );

  fs.writeFileSync(file, content);
});
console.log('Done!');
