const fs = require('fs');

try {
  // Fix MenuRenderer.js
  let text = fs.readFileSync('src/components/MenuRenderer.js', 'utf8');
  text = text.replace(
    /flex items-end sm:items-center justify-center p-0 sm:p-4/gi,
    'flex items-center justify-center p-4 sm:p-6'
  );
  text = text.replace(
    /w-full sm:max-w-lg rounded-t-\[32px\] sm:rounded-3xl/gi,
    'w-full max-w-[360px] md:max-w-[400px] rounded-[2rem] max-h-[85vh] flex flex-col mx-auto'
  );
  text = text.replace(
    /relative h-64 sm:h-72 bg-slate-100/gi,
    'relative h-64 shrink-0 bg-slate-100'
  );
  text = text.replace(
    /<div className="p-8">/gi,
    '<div className="p-6 md:p-8 overflow-y-auto">'
  );
  fs.writeFileSync('src/components/MenuRenderer.js', text);

  // Fix admin/page.js
  let admin = fs.readFileSync('src/app/admin/page.js', 'utf8');
  admin = admin.replace(
    /max-w-\[480px\]/gi,
    'max-w-[375px] h-[812px] max-h-[85vh]'
  );
  admin = admin.replace(
    /"flex-1 overflow-y-auto relative w-full bg-slate-50 iphone-scrollbar"/gi,
    '"flex-1 overflow-y-auto overflow-x-hidden relative w-full bg-slate-50 iphone-scrollbar transform translate-x-0 translate-y-0"'
  );
  fs.writeFileSync('src/app/admin/page.js', admin);
  
  // Fix VibrantMenu.js
  let vib = fs.readFileSync('src/components/templates/VibrantMenu.js', 'utf8');
  vib = vib.replace(/grid grid-cols-1 sm:grid-cols-2/gi, 'grid grid-cols-1');
  vib = vib.replace(/grid grid-cols-1 md:grid-cols-2/gi, 'grid grid-cols-1');
  fs.writeFileSync('src/components/templates/VibrantMenu.js', vib);

  console.log('Fixed files successfully!');
} catch (e) {
  console.error(e);
}
