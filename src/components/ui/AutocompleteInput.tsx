import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';

interface Props {
  value:       string;
  onChange:    (val: string) => void;
  suggestions: string[];
  placeholder: string;
  label?:      string;
  required?:   boolean;
  icon?:       React.ReactNode;
  className?:  string;
  onSelect?:   (val: string) => void;
}

const AutocompleteInput: React.FC<Props> = ({
  value, onChange, suggestions, placeholder, label, required, icon, className = '', onSelect,
}) => {
  const [open,     setOpen]     = useState(false);
  const [filtered, setFiltered] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = value.toLowerCase().trim();
    if (!q) { setFiltered(suggestions.slice(0, 8)); return; }
    const f = suggestions.filter(s => s.toLowerCase().includes(q)).slice(0, 10);
    setFiltered(f);
  }, [value, suggestions]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const select = (s: string) => {
    onChange(s);
    onSelect?.(s);
    setOpen(false);
    inputRef.current?.blur();
  };

  const highlight = (text: string) => {
    const q = value.toLowerCase().trim();
    if (!q) return <span>{text}</span>;
    const idx = text.toLowerCase().indexOf(q);
    if (idx === -1) return <span>{text}</span>;
    return (
      <span>
        {text.slice(0, idx)}
        <strong className="text-dz-green">{text.slice(idx, idx + q.length)}</strong>
        {text.slice(idx + q.length)}
      </span>
    );
  };

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      {label && (
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
          {label}{required && <span className="text-dz-red ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</div>}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => { setOpen(true); }}
          placeholder={placeholder}
          autoComplete="off"
          className={`w-full bg-muted border border-border rounded-xl py-3 pr-10 text-sm outline-none focus:border-dz-green transition-all ${icon ? 'pl-9' : 'pl-4'}`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && (
            <button type="button" onClick={() => { onChange(''); setOpen(false); }}
              className="text-muted-foreground hover:text-foreground transition-colors">
              <X size={13}/>
            </button>
          )}
          <ChevronDown size={13} className={`text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}/>
        </div>
      </div>

      {open && filtered.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-xl overflow-hidden max-h-56 overflow-y-auto">
          {filtered.map(s => (
            <button key={s} type="button" onClick={() => select(s)}
              className="w-full px-4 py-2.5 text-left text-sm hover:bg-dz-green/5 hover:text-dz-green transition-colors flex items-center gap-2 border-b border-border/30 last:border-0">
              {icon && <span className="text-muted-foreground shrink-0">{icon}</span>}
              {highlight(s)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;
