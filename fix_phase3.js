const fs = require('fs');
const path = require('path');

// --- 1. Fix admin/page.js ---
let adminCode = fs.readFileSync('src/app/admin/page.js', 'utf8');

// Find the Block Categories chunk
const blockStart = adminCode.indexOf('{/* NAVIGAZIONE A BLOCCHI E IMMAGINI CATEGORIA */}');
const blockEnd = adminCode.indexOf('</section>', blockStart);

if (blockStart > -1 && blockEnd > -1) {
    let blockChunkRaw = adminCode.substring(blockStart, adminCode.indexOf('</div>\n          </div>', blockStart) + 14);
    
    // Add remove button
    let blockChunkFix = blockChunkRaw.replace(
        /<button \n\s*onClick=\{.*?\.click\(\)\}\n\s*className="cursor-pointer absolute top-1\/2.*?<\/button>/s,
        `<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-40">
           <button 
             onClick={() => document.getElementById(\`cat-img-\${cat}\`).click()}
             className="cursor-pointer bg-white/20 backdrop-blur-md text-white border border-white/50 text-[10px] sm:text-xs font-bold px-3 py-1.5 uppercase rounded-lg hover:bg-white/30 transition-colors"
           >
             {catMeta.image ? 'Cambia' : 'Carica'}
           </button>
           {catMeta.image && (
             <button
               onClick={() => {
                 const newMeta = { ...(settings.categoryMetadata || {}) };
                 delete newMeta[cat].image;
                 setSettings({ ...settings, categoryMetadata: newMeta });
               }}
               className="cursor-pointer bg-rose-500/80 backdrop-blur-md text-white border border-rose-400 text-[10px] sm:text-xs font-bold px-3 py-1.5 uppercase rounded-lg hover:bg-rose-500 transition-colors shadow-lg"
             >
               Rimuovi
             </button>
           )}
         </div>`
    );

    // Remove old chunk
    adminCode = adminCode.substring(0, blockStart) + adminCode.substring(adminCode.indexOf('</div>\n          </div>\n        </section>', blockStart) + 22);

    // Insert at the beginning of 'menu' tab
    const menuTabRegex = /\{activeTab === 'menu' && \(\s*<>/;
    const menuTabMatch = adminCode.match(menuTabRegex);
    if (menuTabMatch) {
       const insertPos = menuTabMatch.index + menuTabMatch[0].length;
       adminCode = adminCode.substring(0, insertPos) + '\n        <section className="mb-4">\n          ' + blockChunkFix + '\n        </section>' + adminCode.substring(insertPos);
    }
    
    fs.writeFileSync('src/app/admin/page.js', adminCode);
    console.log('Fixed admin/page.js');
}

// --- 2. Fix MenuRenderer.js ---
let menuCode = fs.readFileSync('src/components/MenuRenderer.js', 'utf8');

// Undo the huge block logic I generated earlier
menuCode = menuCode.replace(
    /if \(settings\?\.blockCategories && !activeCategory\) \{[\s\S]*?(?=const TemplateComponent =)/,
    `const allCategories = [...new Set(filteredMenu.map(i => {
      const isTranslating = activeLang !== 'it' && i.translations && i.translations[activeLang];
      return isTranslating && i.translations[activeLang].category ? i.translations[activeLang].category : i.category;
  }).filter(Boolean))];
  
  if (settings?.blockCategories && !activeCategory) {
      // Allow template to handle block rendering via props
      // Non usciamo più con un early return! Renderizziamo TemplateComponent
  }
  
  `
);

// Add props to TemplateComponent
menuCode = menuCode.replace(
    /switch \(templateStyle\) \{[\s\S]*?default: return <ElegantMenu menuByCategory=\{menuByCategory\} settings=\{settings\} onItemClick=\{handleItemClick\} \/>;\n\s*\}/,
    `const commonProps = { 
        menuByCategory, settings, onItemClick, 
        activeCategory, onCategoryClick: setActiveCategory, allCategories, 
        activeLang, filteredMenu 
      };
      switch (templateStyle) {
        case 'modern': return <ModernMenu {...commonProps} />;
        case 'rustic': return <RusticMenu {...commonProps} />;
        case 'vibrant': return <VibrantMenu {...commonProps} />;
        case 'cinematic': return <CinematicMenu {...commonProps} />;
        case 'luxury': return <LuxuryMenu {...commonProps} />;
        case 'sushi': return <SushiMenu {...commonProps} />;
        case 'taverna': return <TavernaMenu {...commonProps} />;
        case 'brunch': return <BrunchMenu {...commonProps} />;
        case 'elegant':
        default: return <ElegantMenu {...commonProps} />;
      }`
);

fs.writeFileSync('src/components/MenuRenderer.js', menuCode);
console.log('Fixed MenuRenderer.js');

// --- 3. Modify Templates (ElegantMenu example) ---
const templatesDir = 'src/components/templates';
const files = fs.readdirSync(templatesDir);
files.forEach(f => {
    if (f === 'ItemExtras.js') return;
    let code = fs.readFileSync(path.join(templatesDir, f), 'utf8');

    // Add props
    code = code.replace(/\{ menuByCategory, settings, onItemClick \}/, '{ menuByCategory, settings, onItemClick, activeCategory, onCategoryClick, allCategories, activeLang, filteredMenu }');

    // Replace Object.entries map with condition
    let replaceMatch = null;
    if (f === 'ElegantMenu.js') {
        replaceMatch = /\{Object\.entries\(menuByCategory\)\.map\(\(\[category, items\]\) => \([\s\S]*?(?=\{\/\* PREZZO COPERTO \*\/)/;
    } else {
        // Just general generic replacements for simplicity (focusing on Elegant first based on user request)
    }

    if (replaceMatch && f === 'ElegantMenu.js') {
        const loopCodeMatch = code.match(replaceMatch);
        if (loopCodeMatch) {
            const loopCode = loopCodeMatch[0];
            const newCode = `
        {settings?.blockCategories && !activeCategory ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {allCategories.map(cat => {
               const originalCat = filteredMenu?.find(i => {
                  const isTranslating = activeLang !== 'it' && i.translations && i.translations[activeLang];
                  const c = isTranslating && i.translations[activeLang].category ? i.translations[activeLang].category : i.category;
                  return c === cat;
               })?.category;
               const catMeta = (settings.categoryMetadata || {})[originalCat] || {};
               return (
                 <div key={cat} onClick={() => onCategoryClick(cat)} className="relative aspect-video sm:aspect-square rounded-3xl overflow-hidden cursor-pointer group shadow-2xl border border-[#222] bg-[#111]">
                   {catMeta.image ? (
                     <img src={catMeta.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60 group-hover:opacity-100" alt={cat} />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-[#333] opacity-30">
                        <span className="text-6xl">&#127869;</span>
                     </div>
                   )}
                   <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b]/40 to-transparent flex flex-col justify-end p-8">
                     <h3 className={\`text-3xl font-serif text-white tracking-wide mb-2 \${theme.text}\`}>{cat}</h3>
                     <p className="text-[#a19f9b] text-sm">Tocca per scoprire i nostri piatti</p>
                   </div>
                 </div>
               );
            })}
          </div>
        ) : (
          <>
            ${loopCode}
          </>
        )}
        `;
            code = code.replace(replaceMatch, newCode);
        }
    }
    
    fs.writeFileSync(path.join(templatesDir, f), code);
});
console.log('Fixed Templates');
