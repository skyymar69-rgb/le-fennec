import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ZoomIn, ZoomOut, Maximize2, MapPin } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { WILAYA_PATHS } from '../../data/wilayaPaths';

interface Props {
  onSelectWilaya?: (code: string, name: string) => void;
  selectedWilaya?:  string | null;
  className?:       string;
  compact?:         boolean;
  listingCounts?:   Record<string, number>;
}

// Preset views (in SVG coordinates 0-1000)
const VIEWS = {
  full:  { x: 0,    y: 0,   scale: 1 },
  north: { x: 250,  y: 0,   scale: 2.2 },  // zoom on coastal north
  east:  { x: 550,  y: 0,   scale: 2.2 },  // east: Constantine, Annaba
  west:  { x: 100,  y: 30,  scale: 2.2 },  // west: Oran, Tlemcen
};

const NORTHERN_WILAYAS = new Set([
  '01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16',
  '17','18','19','20','21','22','23','24','25','26','27','28','29','31','32','34',
  '35','36','38','40','41','42','43','44','45','46','48',
]);

const AlgeriaMap: React.FC<Props> = ({
  onSelectWilaya, selectedWilaya, className = '', compact = false, listingCounts,
}) => {
  const [scale,     setScale]     = useState(2.2);      // default: zoomed north
  const [panX,      setPanX]      = useState(-250);     // default: centered on north
  const [panY,      setPanY]      = useState(0);
  const [hovered,   setHovered]   = useState<string | null>(null);
  const [isDragging,setIsDragging]= useState(false);
  const [view,      setView]      = useState<'north'|'west'|'east'|'full'>('north');

  const svgRef   = useRef<SVGSVGElement>(null);
  const dragStart= useRef<{x:number;y:number;px:number;py:number} | null>(null);
  const navigate = useNavigate();
  const { language } = useLanguage();

  const getName = useCallback((code: string) => {
    const w = WILAYA_PATHS[code];
    if (!w) return code;
    return language === 'ar' ? w.nameAr : language === 'en' ? w.nameEn : w.nameFr;
  }, [language]);

  const maxCount = useMemo(() =>
    listingCounts ? Math.max(1, ...Object.values(listingCounts)) : 1,
  [listingCounts]);

  const getColor = useCallback((code: string) => {
    if (selectedWilaya === code) return '#D21034';
    if (hovered === code)        return '#00C060';
    if (listingCounts) {
      const ratio = (listingCounts[code] || 0) / maxCount;
      const l = Math.round(55 - ratio * 30);
      return `hsl(150, 65%, ${l}%)`;
    }
    return NORTHERN_WILAYAS.has(code) ? '#006233' : '#4CAF50';
  }, [hovered, selectedWilaya, listingCounts, maxCount]);

  // ── Zoom controls ─────────────────────────────────────────────────────
  const zoom = (factor: number) => {
    setScale(s => Math.max(1, Math.min(8, s * factor)));
  };

  const applyView = (v: typeof view) => {
    setView(v);
    const preset = VIEWS[v];
    setScale(preset.scale);
    setPanX(-preset.x * preset.scale);
    setPanY(-preset.y * preset.scale);
  };

  // ── Mouse wheel zoom ──────────────────────────────────────────────────
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.85 : 1.18;
    setScale(s => Math.max(1, Math.min(8, s * factor)));
  }, []);

  // ── Pan (drag) ────────────────────────────────────────────────────────
  const onMouseDown = (e: React.MouseEvent) => {
    dragStart.current = { x: e.clientX, y: e.clientY, px: panX, py: panY };
    setIsDragging(false);
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) setIsDragging(true);
    setPanX(dragStart.current.px + dx);
    setPanY(dragStart.current.py + dy);
  };
  const onMouseUp = () => { dragStart.current = null; };

  // ── Touch (mobile pinch + pan) ────────────────────────────────────────
  const lastTouch = useRef<{x:number;y:number;dist:number} | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, dist: 0 };
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouch.current = { x: 0, y: 0, dist: Math.sqrt(dx*dx + dy*dy) };
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!lastTouch.current) return;
    if (e.touches.length === 1) {
      const dx = e.touches[0].clientX - lastTouch.current.x;
      const dy = e.touches[0].clientY - lastTouch.current.y;
      setPanX(p => p + dx);
      setPanY(p => p + dy);
      lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, dist: 0 };
    } else if (e.touches.length === 2 && lastTouch.current.dist > 0) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const factor = dist / lastTouch.current.dist;
      setScale(s => Math.max(1, Math.min(8, s * factor)));
      lastTouch.current.dist = dist;
    }
  };

  // ── Click on wilaya ───────────────────────────────────────────────────
  const handleClick = (code: string) => {
    if (isDragging) return;
    if (onSelectWilaya) onSelectWilaya(code, getName(code));
    else navigate(`/search?wilaya=${code}`);
  };

  const entries = useMemo(() => Object.entries(WILAYA_PATHS), []);

  // SVG transform: scale around origin then translate
  const transform = `translate(${panX}px, ${panY}px) scale(${scale})`;

  return (
    <div className={`flex flex-col gap-0 ${className}`}>
      {/* ── Controls ── */}
      <div className="flex items-center justify-between px-2 py-1.5 bg-card/80 border-b border-border rounded-t-xl">
        {/* Region presets */}
        <div className="flex gap-1">
          {[
            { id:'north', label:'Nord' },
            { id:'west',  label:'Ouest' },
            { id:'east',  label:'Est' },
            { id:'full',  label:'Tout' },
          ].map(({ id, label }) => (
            <button key={id}
              onClick={() => applyView(id as typeof view)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                view === id
                  ? 'bg-dz-green text-white'
                  : 'bg-muted text-muted-foreground hover:bg-dz-green/10 hover:text-dz-green'
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* Zoom buttons */}
        <div className="flex items-center gap-1">
          <button onClick={() => zoom(1.3)}
            className="w-7 h-7 rounded-lg bg-muted hover:bg-dz-green/10 hover:text-dz-green flex items-center justify-center text-muted-foreground transition-all"
            aria-label="Zoom avant">
            <ZoomIn size={14}/>
          </button>
          <span className="text-[10px] text-muted-foreground w-8 text-center font-mono">
            {Math.round(scale * 100)}%
          </span>
          <button onClick={() => zoom(0.77)}
            className="w-7 h-7 rounded-lg bg-muted hover:bg-dz-green/10 hover:text-dz-green flex items-center justify-center text-muted-foreground transition-all"
            aria-label="Zoom arrière">
            <ZoomOut size={14}/>
          </button>
          <button onClick={() => applyView('north')}
            className="w-7 h-7 rounded-lg bg-muted hover:bg-dz-green/10 hover:text-dz-green flex items-center justify-center text-muted-foreground transition-all ml-0.5"
            aria-label="Réinitialiser la vue" title="Réinitialiser">
            <Maximize2 size={12}/>
          </button>
        </div>
      </div>

      {/* ── Map SVG ── */}
      <div className="relative overflow-hidden rounded-b-xl bg-[#004d26]"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>

        <svg
          ref={svgRef}
          viewBox="0 0 1000 1000"
          className="w-full"
          style={{
            aspectRatio: compact ? '1/0.7' : '1/0.8',
            userSelect: 'none',
            WebkitUserSelect: 'none',
          }}
          onWheel={onWheel}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={() => { lastTouch.current = null; }}
        >
          <defs>
            <filter id="glow">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#00FF88" floodOpacity="0.5"/>
            </filter>
            <filter id="shadow">
              <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.3)"/>
            </filter>
          </defs>

          {/* Sea label */}
          <text x="500" y="20" textAnchor="middle" fontSize="18"
            fontFamily="Inter,sans-serif" fontWeight="600" letterSpacing="4"
            fill="rgba(126,200,227,0.7)">
            {language === 'ar' ? 'البحر الأبيض المتوسط' : 'MÉDITERRANÉE'}
          </text>

          {/* All wilaya paths — transformed together */}
          <g style={{ transform, transformOrigin: '0 0', transition: isDragging ? 'none' : 'transform 0.4s ease' }}>
            {entries.map(([code, data]) => {
              if (!data.path) return null;
              const isSelected = selectedWilaya === code;
              const isHovered  = hovered === code;
              return (
                <g key={code}
                  onClick={() => handleClick(code)}
                  onMouseEnter={() => setHovered(code)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: isDragging ? 'grabbing' : 'pointer' }}
                >
                  <path
                    d={data.path}
                    fill={getColor(code)}
                    stroke={isSelected ? '#fff' : isHovered ? '#fff' : 'rgba(255,255,255,0.5)'}
                    strokeWidth={isSelected ? 3/scale : isHovered ? 2/scale : 0.8/scale}
                    opacity={isSelected || isHovered ? 1 : 0.82}
                    filter={isSelected ? 'url(#glow)' : isHovered ? 'url(#shadow)' : undefined}
                    style={{ transition: 'fill 0.12s, opacity 0.12s' }}
                  />
                  {/* Show label when zoomed enough or selected/hovered */}
                  {(isSelected || isHovered || scale >= 3) && data.cx > 0 && data.cy > 0 && (
                    <text
                      x={data.cx} y={data.cy + 4}
                      textAnchor="middle"
                      fontSize={Math.max(7, 14 / scale)}
                      fontWeight={isSelected || isHovered ? 700 : 600}
                      fontFamily="Inter,sans-serif"
                      fill="rgba(255,255,255,0.95)"
                      style={{ pointerEvents: 'none', transition: 'font-size 0.2s' }}
                    >
                      {scale >= 4 ? getName(code) : code.replace('DZ','')}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* ── Hovered tooltip ── */}
        {hovered && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none z-10 animate-fade-up">
            <div className="bg-card/95 backdrop-blur border border-border px-3 py-1.5 rounded-full text-xs font-bold shadow-lg whitespace-nowrap flex items-center gap-1.5">
              <MapPin size={11} className="text-dz-green"/>
              <span>{getName(hovered)}</span>
              {listingCounts?.[hovered] != null && (
                <span className="text-dz-green font-black ml-1">
                  {listingCounts[hovered]} ann.
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── Mini compass / legend ── */}
        <div className="absolute top-2 right-2 text-[9px] text-white/40 font-mono select-none">
          🖱 glisser · 🔄 molette
        </div>
      </div>

      {/* ── Density legend ── */}
      {listingCounts && (
        <div className="flex items-center justify-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
          <span>Peu d'annonces</span>
          <div className="flex gap-0.5">
            {[55,45,35,25,15].map(l => (
              <div key={l} className="w-5 h-2 rounded-sm" style={{ background:`hsl(150,65%,${l}%)` }}/>
            ))}
          </div>
          <span>Beaucoup</span>
        </div>
      )}
    </div>
  );
};

export default AlgeriaMap;
