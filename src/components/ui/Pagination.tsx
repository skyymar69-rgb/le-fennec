import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  current:   number;
  total:     number;
  perPage:   number;
  onChange:  (page: number) => void;
}

const Pagination: React.FC<Props> = ({ current, total, perPage, onChange }) => {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('...');
      for (let i = Math.max(2, current - 1); i <= Math.min(totalPages - 1, current + 1); i++) {
        pages.push(i);
      }
      if (current < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const go = (p: number) => {
    onChange(p);
    scrollTop();
  };

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1.5 py-8">
      {/* Prev */}
      <button
        onClick={() => go(current - 1)} disabled={current === 1}
        className="flex items-center gap-1 px-3 py-2 rounded-xl border border-border bg-card text-sm font-semibold disabled:opacity-40 hover:bg-muted hover:border-dz-green transition-all"
        aria-label="Page précédente"
      >
        <ChevronLeft size={16}/> Préc.
      </button>

      {/* Pages */}
      {getPages().map((p, i) => (
        p === '...' ? (
          <span key={`dots-${i}`} className="px-2 text-muted-foreground">…</span>
        ) : (
          <button
            key={p}
            onClick={() => go(p as number)}
            aria-current={p === current ? 'page' : undefined}
            className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
              p === current
                ? 'bg-dz-green text-white shadow-brand-sm'
                : 'border border-border bg-card hover:bg-muted hover:border-dz-green'
            }`}
          >
            {p}
          </button>
        )
      ))}

      {/* Next */}
      <button
        onClick={() => go(current + 1)} disabled={current === totalPages}
        className="flex items-center gap-1 px-3 py-2 rounded-xl border border-border bg-card text-sm font-semibold disabled:opacity-40 hover:bg-muted hover:border-dz-green transition-all"
        aria-label="Page suivante"
      >
        Suiv. <ChevronRight size={16}/>
      </button>

      {/* Counter */}
      <span className="ml-2 text-xs text-muted-foreground hidden sm:inline">
        Page {current}/{totalPages} · {total.toLocaleString()} annonces
      </span>
    </nav>
  );
};

export default Pagination;
