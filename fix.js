const fs = require('fs');

let code = fs.readFileSync('src/app/admin/page.js', 'utf8');

// 1. Fix missing closing div in items.map
code = code.replace(
  /Aggiungi Variante \(es\. Piccola\/Media\/Grande\)\s*<\/button>\s*<\/div>\s*<\/div>\s*<div className="flex items-center gap-4 w-full md:w-auto shrink-0 justify-between md:justify-end border-t md:border-none pt-4 md:pt-0 border-slate-100">/,
  `Aggiungi Variante (es. Piccola/Media/Grande)
                        </button>
                      </div>
                    </div>
                  )}
                  </div>
                  
                  <div className="flex items-center gap-4 w-full md:w-auto shrink-0 justify-between md:justify-end border-t md:border-none pt-4 md:pt-0 border-slate-100">`
);

// 2. Fix missing closing div in new item form
code = code.replace(
  /Aggiungi Variante\s*<\/button>\s*<\/div>\s*<\/div>\s*\)\}\s*<div className="md:col-span-6 flex justify-end mt-2">/,
  `Aggiungi Variante
                  </button>
                </div>
              </div>
            )}
            <div className="md:col-span-6 flex justify-end mt-2">`
);

fs.writeFileSync('src/app/admin/page.js', code);
console.log('Fix applied.');
