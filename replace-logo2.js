const fs = require('fs');

// 1. API Docs replace
let apiDocs = fs.readFileSync('src/app/api-docs/page.js', 'utf8');
apiDocs = apiDocs.replace(
  /<div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">\s*<svg[^>]*>.*?<\/svg>\s*<\/div>/,
  \`<div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
              <img src="/sm-logo.png" alt="Smart Menu Logo" className="w-full h-full object-contain scale-[2.5]" />
            </div>\`
);
fs.writeFileSync('src/app/api-docs/page.js', apiDocs);

// 2. Dashboard replace
let dashboard = fs.readFileSync('src/app/dashboard/page.js', 'utf8');
dashboard = dashboard.replace(
  /<div className="w-9 h-9 rounded-lg flex items-center justify-center shadow-md overflow-hidden bg-white\/5 p-1 border border-white\/10 text-white">\s*<img src="\/sm-logo.png" alt="Smart Menu Logo" className="w-full h-full object-contain scale-\[1.3\]" \/>\s*<\/div>/,
  \`<div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden shadow-none">
                <img src="/sm-logo.png" alt="Smart Menu Logo" className="w-full h-full object-contain scale-[2.5]" />
              </div>\`
);
fs.writeFileSync('src/app/dashboard/page.js', dashboard);

// 3. Other files just replace scale-[1.3] to scale-[2.5]
const files = [
  'src/app/admin/page.js',
  'src/app/faq/page.js',
  'src/app/page.js',
  'src/app/privacy/page.js',
  'src/app/termini/page.js',
  'src/components/Footer.js'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/scale-\[1\.3\]/g, 'scale-[2.5]');
  // Make the wrapper div slightly bigger if it's w-8/h-8 or w-9/h-9 to w-10/h-10 to give more breathing room
  content = content.replace(/className="w-8 h-8 /g, 'className="w-10 h-10 ');
  content = content.replace(/className="w-9 h-9 /g, 'className="w-10 h-10 ');
  fs.writeFileSync(file, content);
});

console.log('Script Executed');
