const fs = require('fs');
const path = require('path');

const root = process.cwd();

const LOGO_MARKUP = `<img src="/sm-logo.png" alt="SmartMenu Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'scale(2.5)' }} />`;
const LUCIDE_DIV_REGEX = /<div style={{[^}]*width: 36, height: 36, borderRadius: 8, background: [^,]+, display: 'flex', alignItems: 'center', justifyContent: 'center'[^}]*}}>\s*<QrCode[^>]*>\s*<\/div>/g;

const filesToUpdate = [
  'src/app/page.js',
  'src/app/dashboard/page.js',
  'src/app/login/page.js',
  'src/app/update-password/page.js',
  'src/app/faq/page.js',
  'src/app/termini/page.js',
  'src/app/privacy/page.js',
  'src/components/Footer.js',
];

for (const file of filesToUpdate) {
  let p = path.join(root, file);
  if (!fs.existsSync(p)) continue;
  let content = fs.readFileSync(p, 'utf-8');
  
  // 1. ADD 'use client' TO FOOTER
  if (file.endsWith('Footer.js') && !content.includes('"use client"')) {
    content = `"use client";\n\n` + content;
  }
  
  // 2. REVERT LOGO
  const newLogoContainer = `<div style={{ width: 40, height: 40, borderRadius: 12, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              ${LOGO_MARKUP}
            </div>`;
  content = content.replace(LUCIDE_DIV_REGEX, newLogoContainer);
  fs.writeFileSync(p, content);
}

// 3. ADMIN PAGE COLORS
const adminPath = path.join(root, 'src/app/admin/page.js');
if (fs.existsSync(adminPath)) {
  let admin = fs.readFileSync(adminPath, 'utf8');

  admin = admin.replace(/bg-slate-950/g, 'bg-[#2D2016]'); // Espresso
  admin = admin.replace(/bg-slate-50/g, 'bg-[#FAF8F5]'); // Soft crema
  admin = admin.replace(/text-slate-800/g, 'text-[#2D2016]'); // Espresso text
  admin = admin.replace(/border-slate-800/g, 'border-[#F5F0E8]/10'); // Soft border inside dark side
  admin = admin.replace(/border-slate-200/g, 'border-[#2D2016]/10'); 
  admin = admin.replace(/bg-slate-800/g, 'bg-[#F5F0E8]/10'); // hover:bg in dark side
  admin = admin.replace(/text-slate-400 hover:text-white/g, 'text-[#F5F0E8]/50 hover:text-[#F5F0E8]');
  admin = admin.replace(/text-white/g, 'text-[#F5F0E8]'); // Crema for text
  admin = admin.replace(/bg-indigo-500/g, 'bg-[#C4622D]'); // Terracotta
  admin = admin.replace(/text-indigo-500/g, 'text-[#C4622D]'); // Terracotta
  admin = admin.replace(/shadow-indigo-500\/20/g, 'shadow-[#C4622D]/20');
  admin = admin.replace(/text-indigo-300\/80/g, 'text-[#E8A84A]/80'); // Ambra
  admin = admin.replace(/bg-indigo-400/g, 'bg-[#E8A84A]'); // Ambra pulse

  admin = admin.replace(/bg-indigo-50/g, 'bg-[#C4622D]/10');
  admin = admin.replace(/border-indigo-100( hover:border-indigo-300)?/g, 'border-[#C4622D]/20 hover:border-[#C4622D]/40');
  admin = admin.replace(/text-indigo-700/g, 'text-[#C4622D]');
  admin = admin.replace(/hover:bg-indigo-100/g, 'hover:bg-[#C4622D]/20');

  admin = admin.replace(/bg-fuchsia-600/g, 'bg-[#4A7C59]'); // Oliva
  admin = admin.replace(/bg-fuchsia-700/g, 'bg-[#3d664a]');
  admin = admin.replace(/shadow-fuchsia-500\/30/g, 'shadow-[#4A7C59]/30');
  admin = admin.replace(/bg-fuchsia-50/g, 'bg-[#4A7C59]/5');
  admin = admin.replace(/to-purple-50/g, 'to-[#4A7C59]/10');
  admin = admin.replace(/border-fuchsia-100/g, 'border-[#4A7C59]/20');
  admin = admin.replace(/text-fuchsia-700/g, 'text-[#4A7C59]');
  admin = admin.replace(/border-fuchsia-200/g, 'border-[#4A7C59]/30');
  
  // Dashboard back button inside admin
  admin = admin.replace(/bg-slate-800 hover:bg-slate-700/g, 'bg-[#C4622D]/10 hover:bg-[#C4622D]/20 text-[#C4622D]');
  
  fs.writeFileSync(adminPath, admin);
}

// 4. FIX DASHBOARD BACKGROUND 
const dashPath = path.join(root, 'src/app/dashboard/page.js');
if (fs.existsSync(dashPath)) {
  let dash = fs.readFileSync(dashPath, 'utf8');
  dash = dash.replace(/crema: '#F5F0E8'/g, `crema: '#FAF8F5'`);
  dash = dash.replace(/background: B\.crema/g, `background: '#FAF8F5'`);
  fs.writeFileSync(dashPath, dash);
}

// 5. RESTORE HOVER ANIMATIONS IN ONBOARDING PAGE
const onboardingPath = path.join(root, 'src/app/onboarding/page.js');
if (fs.existsSync(onboardingPath)) {
  let onboarding = fs.readFileSync(onboardingPath, 'utf8');
  // hover css scale
  onboarding = onboarding.replace(/transition: 'all \.2s'/g, `transition: 'all .25s cubic-bezier(0.4, 0, 0.2, 1)'`);
  
  // AI button hover
  onboarding = onboarding.replace(
    /onClick=\{\(\) => \{ setUseAI\(true\); triggerFileInput\(\); \}\}[^>]*style={{/g,
    `$&\n                  transform: 'translateY(0) scale(1)',\n                }} \n                onMouseEnter={e => {e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(196,98,45,0.2)';}}\n                onMouseLeave={e => {e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = 'none';}}`
  );
  
  // Manual button hover
  onboarding = onboarding.replace(
    /onClick=\{\(\) => \{ setUseAI\(false\); handleNext\(\); \}\}[^>]*style={{/g,
    `$&\n                  transform: 'translateY(0) scale(1)',\n                }} \n                onMouseEnter={e => {e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(245,240,232,0.05)';}}\n                onMouseLeave={e => {e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = 'none';}}`
  );

  // Template options hover
  onboarding = onboarding.replace(
    /onClick=\{\(\) => setTemplate\(t\.id\)\}[^>]*style={{/g,
    `$&\n                    transform: 'scale(1)',\n                  }}\n                  onMouseEnter={e => {e.currentTarget.style.transform = 'scale(1.03)';}}\n                  onMouseLeave={e => {e.currentTarget.style.transform = 'scale(1)';}}`
  );

  // Fix Success Step - Remove video, add emoji
  const videoRegex = /<div style={{ width: 'clamp\(200px, 50vw, 320px\)', marginBottom: 24 }}>[\s\S]*?<video[\s\S]*?src="\/success-video\.webm"[\s\S]*?<\/video>[\s\S]*?<\/div>/m;
  const bounceEmoji = `<div style={{ fontSize: 96, animation: 'bounce 2s infinite', marginBottom: 20 }}>🎉</div><style>{\`@keyframes bounce { 0%, 20%, 50%, 80%, 100% {transform: translateY(0);} 40% {transform: translateY(-30px);} 60% {transform: translateY(-15px);} }\`}</style>`;
  
  if (videoRegex.test(onboarding)) {
    onboarding = onboarding.replace(videoRegex, bounceEmoji);
  } else {
    // try looser replace
     const videoRegexLoose = /<video[^>]*src="\/success-video\.webm"[^>]*>[\s\S]*?<\/video>/;
     onboarding = onboarding.replace(videoRegexLoose, bounceEmoji);
  }

  // Also remove the explicit redirect in the video onEnded event which is now lost!
  // We need to add the redirect using useEffect if step == 4
  const redirectEffect = `
  useEffect(() => {
    if (step === 4 && createdMenuId) {
      const timer = setTimeout(() => {
        router.push(\`/admin?id=\${createdMenuId}\`);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step, createdMenuId, router]);`;
  
  if (!onboarding.includes('if (step === 4 && createdMenuId)')) {
    onboarding = onboarding.replace(/const finishOnboarding = async \(\) => {/, redirectEffect + '\n\n  const finishOnboarding = async () => {');
  }

  fs.writeFileSync(onboardingPath, onboarding);
}

console.log("Fixes applied successfully.");
