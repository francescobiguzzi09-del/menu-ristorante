import React from 'react';

const BADGE_MAP = {
  new: { label: 'Novita', style: 'bg-emerald-500 text-white' },
  bestseller: { label: 'Best Seller', style: 'bg-amber-500 text-white' },
  chef: { label: 'Consigliato', style: 'bg-indigo-500 text-white' },
  spicy: { label: 'Piccante', style: 'bg-rose-500 text-white' },
};

// Badge inline - da mettere accanto o sopra al nome
export function ItemBadge({ badge, dark = false }) {
  if (!badge || !BADGE_MAP[badge]) return null;
  const b = BADGE_MAP[badge];
  return (
    <span className={`inline-block px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md mr-2 ${b.style} shadow-sm`}>
      {b.label}
    </span>
  );
}

// Ingredienti - da mettere sotto la descrizione
export function ItemIngredients({ ingredients, dark = false }) {
  if (!ingredients) return null;
  return (
    <p className={`text-[11px] mt-1.5 leading-relaxed italic ${dark ? 'text-white/40' : 'text-slate-400'}`}>
      {ingredients}
    </p>
  );
}

// Varianti prezzo - sostituto del prezzo singolo
export function ItemVariants({ variants, currency = '€', dark = false, className = '' }) {
  if (!variants || variants.length === 0) return null;
  return (
    <div className={`flex flex-wrap gap-x-3 gap-y-0.5 ${className}`}>
      {variants.map((v, i) => (
        <span key={i} className={`text-xs whitespace-nowrap ${dark ? 'text-white/60' : 'text-slate-500'}`}>
          <span className="font-medium">{v.name}</span>{' '}
          <span className={`font-bold ${dark ? 'text-white/80' : 'text-slate-700'}`}>{currency}{v.price.toFixed(2)}</span>
        </span>
      ))}
    </div>
  );
}

// Prezzo helper: mostra varianti se presenti, altrimenti prezzo singolo
export function ItemPrice({ item, currency = '€', className = '', variantsClassName = '' }) {
  if (item.variants && item.variants.length > 0) {
    return (
      <div className={variantsClassName || className}>
        {item.variants.map((v, i) => (
          <div key={i} className="text-right">
            <span className="text-[10px] opacity-60 font-medium">{v.name} </span>
            <span className="font-bold">{currency}{v.price.toFixed(2)}</span>
          </div>
        ))}
      </div>
    );
  }
  return <span className={className}>{currency} {item.price.toFixed(2)}</span>;
}
