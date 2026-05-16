import React from 'react';
import { Category } from '../types';
import { Check } from 'lucide-react';

interface FilterBarProps {
  categories: Category[];
  selected: Category[];
  onChange: (selected: Category[]) => void;
}

export default function FilterBar({ categories, selected, onChange }: FilterBarProps) {
  const toggleSelection = (cat: Category) => {
    if (selected.includes(cat)) {
      if (selected.length === 1) return; // Must have at least one
      onChange(selected.filter(c => c !== cat));
    } else {
      onChange([...selected, cat]);
    }
  };

  const selectAll = () => onChange(categories);
  const selectNone = () => onChange([]); // Not recommended for UX but possible

  return (
    <div className="flex flex-col gap-3">
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => toggleSelection(cat)}
          className={`flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-black transition-all border-[3px] shadow-[3px_3px_0_#2D3436] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
            selected.includes(cat) 
              ? 'bg-vibrant-red text-white border-vibrant-dark' 
              : 'bg-white text-vibrant-dark/40 border-vibrant-dark hover:text-vibrant-dark'
          }`}
        >
          {cat.toUpperCase()}
          {selected.includes(cat) && <Check size={16} strokeWidth={4} />}
        </button>
      ))}
      <button 
        onClick={selectAll}
        className="text-[9px] text-vibrant-red hover:text-vibrant-dark/80 font-black uppercase tracking-[0.2em] mt-4 px-1 transition-colors flex items-center gap-2 italic"
      >
        <span className="text-lg">★</span> Pilih Semua Filter
      </button>
    </div>
  );
}
