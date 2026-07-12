import React, { useState, useRef, useCallback, useMemo } from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { WILAYAS } from '../../data/wilayas';
import { ALGERIA_SVG_PATHS, ALGERIA_SVG_VIEWBOX } from '../../data/algeriaSvgPaths';

interface Props {
  onSelectWilaya?: (code: string, name: string) => void;
  selectedWilaya?:  string | null;
  className?:       string;
  compact?:         boolean;
  listingCounts?:   Record<string, number>;
}

// Dimensions du viewBox de la carte source (algeria-interractive-map)
const VB_W = 286.086;
const VB_H = 298.332;

// Couleurs — fond de carte vert Algérie
const BG_GREEN       = '#006233';  // vert du drapeau algérien (fond)
const HOVER_GREEN    = '#00E070';
const SELECTED_GOLD  = '#FFD700';

const NAME_BY_CODE: Record<string, { fr: string; ar: string; en: string }> = {};
WILAYAS.forEach(w => { NAME_BY_CODE[w.code] = { fr: w.nameFr, ar: w.nameAr, en: w.nameEn }; });

const AlgeriaMap: React.FC<Props> = ({
  onSelectWilaya, selectedWilaya, className = '', compact = false, listingCounts,
}) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null);
  const [scale,   setScale]   = useState(1);
  const [pan,     setPan]     = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ x: number; y: number; px: number; py: number; moved: boolean } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();

  const getName = useCallback((code: string, fallback: string) => {
    const n = NAME_BY_CODE[code];
    if (!n) return fallback;
    return language === 'ar' ? n.ar : language === 'en' ? n.en : n.fr;
  }, [language]);

  const maxCount = useMemo(() =>
    listingCounts ? Math.max(1, ...Object.values(listingCounts)) : 1,
  [listingCounts]);

  // Remplissage des wilayas : dégradé de verts (clair = plus d'annonces) sur fond vert Algérie
  const getFill = useCallback((code: string) => {
    if (selectedWilaya === code) return SELECTED_GOLD;
    if (hovered === code)        return HOVER_GREEN;
    const ratio = listingCounts ? (listingCounts[code] || 0) / maxCount : 0;
    // hsl(150) : de 28% (peu d'annonces) à 46% (beaucoup) — lisible sur #006233
    return `hsl(150, 62%, ${Math.round(28 + ratio * 18)}%)`;
  }, [hovered, selectedWilaya, listingCounts, maxCount]);

  // ── Zoom / pan ──────────────────────────────────────────────────────────
  const clampPan = (p: { x: number; y: number }, s: number) => ({
    x: Math.max(-VB_W * (s - 1), Math.min(0, p.x)),
    y: Math.max(-VB_H * (s - 1), Math.min(0, p.y)),
  });

  const zoomBy = (f: number) => {
    setScale(s => {
      const ns = Math.max(1, Math.min(6, s * f));
      setPan(p => clampPan(p, ns));
      return ns;
    });
  };

  const reset = () => { setScale(1); setPan({ x: 0, y: 0 }); };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    zoomBy(e.deltaY < 0 ? 1.2 : 1 / 1.2);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y, moved: false };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    // Tooltip qui suit le curseur
    const rect = wrapRef.current?.getBoundingClientRect();
    if (rect) setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top });

    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) dragRef.current.moved = true;
    if (scale > 1 && rect) {
      const k = VB_W / rect.width / scale;
      setPan(clampPan({ x: dragRef.current.px + dx * k * scale, y: dragRef.current.py + dy * k * scale }, scale));
    }
  };

  const onPointerUp = () => { setTimeout(() => { dragRef.current = null; }, 0); };

  const handleClick = (code: string, name: string) => {
    if (dragRef.current?.moved) return; // c'était un drag, pas un clic
    onSelectWilaya?.(code, name);
  };

  const hoveredData = hovered ? ALGERIA_SVG_PATHS.find(w => w.code === hovered) : null;

  return (
    <div ref={wrapRef} className={`relative select-none ${className}`}>
      <svg
        viewBox={ALGERIA_SVG_VIEWBOX}
        className="w-full h-auto rounded-2xl"
        style={{ background: `radial-gradient(120% 120% at 30% 15%, #0a7a43 0%, ${BG_GREEN} 55%, #004a26 100%)`, touchAction: 'none', cursor: scale > 1 ? 'grab' : 'pointer' }}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={() => { setHovered(null); setTooltip(null); dragRef.current = null; }}
        role="img"
        aria-label="Carte interactive de l'Algérie — 48 wilayas"
      >
        <g transform={`translate(${pan.x} ${pan.y}) scale(${scale})`}>
          {ALGERIA_SVG_PATHS.map(w => {
            const name = getName(w.code, w.name);
            return (
              <path
                key={w.code}
                d={w.d}
                fill={getFill(w.code)}
                stroke="#ffffff"
                strokeWidth={0.4 / scale}
                strokeLinejoin="round"
                style={{ transition: 'fill 0.15s ease' }}
                onPointerEnter={() => setHovered(w.code)}
                onClick={() => handleClick(w.code, name)}
                role="button"
                aria-label={`${w.code} — ${name}`}
              >
                <title>{`${w.code} — ${name}`}</title>
              </path>
            );
          })}
        </g>
      </svg>

      {/* Contrôles zoom */}
      {!compact && (
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <button onClick={() => zoomBy(1.4)} aria-label="Zoomer"
            className="w-7 h-7 rounded-lg bg-white/90 hover:bg-white text-dz-green shadow flex items-center justify-center">
            <ZoomIn size={14}/>
          </button>
          <button onClick={() => zoomBy(1 / 1.4)} aria-label="Dézoomer"
            className="w-7 h-7 rounded-lg bg-white/90 hover:bg-white text-dz-green shadow flex items-center justify-center">
            <ZoomOut size={14}/>
          </button>
          <button onClick={reset} aria-label="Vue complète"
            className="w-7 h-7 rounded-lg bg-white/90 hover:bg-white text-dz-green shadow flex items-center justify-center">
            <Maximize2 size={14}/>
          </button>
        </div>
      )}

      {/* Tooltip */}
      {hoveredData && tooltip && (
        <div
          className="absolute z-10 pointer-events-none px-2.5 py-1.5 rounded-lg bg-black/85 text-white text-xs shadow-lg whitespace-nowrap"
          style={{
            left: Math.min(tooltip.x + 12, (wrapRef.current?.clientWidth ?? 300) - 130),
            top:  Math.max(tooltip.y - 38, 4),
          }}
        >
          <span className="font-bold">{hoveredData.code} — {getName(hoveredData.code, hoveredData.name)}</span>
          {listingCounts && (
            <span className="block text-white/70">
              {(listingCounts[hoveredData.code] || 0).toLocaleString()} annonces
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default AlgeriaMap;
