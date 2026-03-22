const fs = require('fs');

try {
  let admin = fs.readFileSync('src/app/admin/page.js', 'utf8');

  // 1. Remove Premium from Cinematic
  admin = admin.replace(
    /<span className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-\[9px\] font-black tracking-widest uppercase px-2 py-0\.5 rounded shadow-sm z-20">Premium<\/span>\s*<div className="absolute inset-0 bg-slate-950 -z-10"><\/div>/g,
    '<div className="absolute inset-0 bg-slate-950 -z-10"></div>'
  );

  // 2. Add Premium to Vibrant if not present
  if (!admin.includes('Premium</span>\n                 <div className="absolute inset-0 bg-pink-50 -z-10"></div>')) {
    admin = admin.replace(
      /<div className="absolute inset-0 bg-pink-50 -z-10"><\/div>/g,
      '<span className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded shadow-sm z-20">Premium</span>\n                 <div className="absolute inset-0 bg-pink-50 -z-10"></div>'
    );
  }

  // 3. Replace Supreme with Luxury
  admin = admin.replace(
    /{\/\* Supreme \(Premium\) \*\/}[\s\S]*?{\/\* PALETTE SCELTA/g,
    `{/* Luxury (Premium) */}
              <div 
                onClick={() => setSettings({...settings, template: 'luxury', palette: 'default'})}
                className={\`relative cursor-pointer rounded-2xl border-[3px] transition-all overflow-hidden aspect-[4/5] flex flex-col items-center justify-end p-4 \${settings.template === 'luxury' ? 'border-stone-800 shadow-2xl scale-[1.02] z-10' : 'border-slate-200 hover:border-stone-400 opacity-70 hover:opacity-100'}\`}
              >
                 <span className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded shadow-sm z-20">Premium</span>
                 <div className="absolute inset-0 bg-stone-100 -z-10"></div>
                 <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-stone-200 to-transparent -z-10"></div>
                 <div className="w-10 h-14 mb-auto mt-2 border border-stone-800 flex items-center justify-center bg-transparent">
                    <span className="text-stone-800 font-serif text-xl">L</span>
                 </div>
                 <h4 className="text-stone-800 font-serif tracking-widest text-sm uppercase mb-1">Luxury</h4>
                 <div className="h-[1px] w-6 bg-stone-800"></div>
                 {settings.template === 'luxury' && <div className="absolute top-3 left-3 w-6 h-6 bg-stone-800 rounded-full flex items-center justify-center text-white"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>}
              </div>

            </div>

            {/* PALETTE SCELTA`
  );

  // 4. Update preview modal container to capture fixed correctly
  admin = admin.replace(
    /className="bg-slate-950 w-full max-w-\[375px\] h-\[812px\] max-h-\[85vh\] mx-auto rounded-\[3rem\] shadow-\[0_0_50px_rgba\(0,0,0,0\.5\)\] flex flex-col overflow-hidden relative border-\[12px\] border-slate-800 animate-in zoom-in-95 duration-300"/g,
    'className="bg-slate-950 w-full max-w-[375px] h-[812px] max-h-[85vh] mx-auto rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden relative border-[12px] border-slate-800 animate-in zoom-in-95 duration-300 transform translate-x-0 translate-y-0"'
  );
  
  admin = admin.replace(
    /className="flex-1 overflow-y-auto overflow-x-hidden relative w-full bg-slate-50 iphone-scrollbar transform translate-x-0 translate-y-0"/g,
    'className="flex-1 overflow-y-auto overflow-x-hidden relative w-full bg-slate-50 iphone-scrollbar"'
  );

  fs.writeFileSync('src/app/admin/page.js', admin);

  // 5. Fix text overflow in templates
  let elegant = fs.readFileSync('src/components/templates/ElegantMenu.js', 'utf8');
  elegant = elegant.replace(/truncate/g, 'break-words whitespace-normal');
  fs.writeFileSync('src/components/templates/ElegantMenu.js', elegant);

  let luxury = fs.readFileSync('src/components/templates/LuxuryMenu.js', 'utf8');
  luxury = luxury.replace(/truncate/g, 'break-words whitespace-normal');
  fs.writeFileSync('src/components/templates/LuxuryMenu.js', luxury);

  console.log('Fixed UI grid, transformed preview boundary, and text overflows!');
} catch (e) {
  console.error(e);
}
