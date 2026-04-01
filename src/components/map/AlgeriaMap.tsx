import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { WILAYA_PATHS, WilayaPath } from '../../data/wilayaPaths';

interface AlgeriaMapProps {
  onSelectWilaya?: (code: string, name: string) => void;
  selectedWilaya?: string | null;
  className?: string;
  compact?: boolean;
  // Optionally pass listing counts per wilaya for density coloring
  listingCounts?: Record<string, number>;
}

// Coastal / high-density wilayas get a slightly different shade
const HIGH_DENSITY = new Set(['16','31','25','09','23','15','35','06','19','05','42','02','22','27','46','13','21','18']);
const MID_DENSITY  = new Set(['26','10','03','17','28','07','29','14','38','44','34','43','04','41','24','40','12','20']);

const AlgeriaMap: React.FC<AlgeriaMapProps> = ({
  onSelectWilaya, selectedWilaya, className = '', compact = false, listingCounts,
}) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const navigate    = useNavigate();
  const { language } = useLanguage();

  const getName = useCallback((code: string): string => {
    const w = WILAYA_PATHS[code];
    if (!w) return code;
    return language === 'ar' ? w.nameAr : language === 'en' ? w.nameEn : w.nameFr;
  }, [language]);

  const handleClick = useCallback((code: string) => {
    if (onSelectWilaya) onSelectWilaya(code, getName(code));
    else navigate(`/search?wilaya=${code}`);
  }, [getName, navigate, onSelectWilaya]);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGGElement>) => {
    const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
    setTooltipPos({
      x: ((e.clientX - rect.left) / rect.width) * 480,
      y: ((e.clientY - rect.top) / rect.height) * 560,
    });
  }, []);

  // Calculate max count for density scale
  const maxCount = useMemo(() => {
    if (!listingCounts) return 1;
    return Math.max(1, ...Object.values(listingCounts));
  }, [listingCounts]);

  const getWilayaFill = useCallback((code: string): string => {
    const isSelected = selectedWilaya === code;
    const isHovered  = hovered === code;

    if (isSelected) return 'var(--dz-red)';
    if (isHovered)  return 'var(--dz-green2)';

    if (listingCounts) {
      const count = listingCounts[code] || 0;
      const ratio = count / maxCount;
      // Green opacity scale: 0.2 → 0.9
      const opacity = 0.2 + ratio * 0.7;
      return `color-mix(in srgb, var(--dz-green) ${Math.round(opacity * 100)}%, transparent)`;
    }

    // Default gradient by density
    if (HIGH_DENSITY.has(code)) return 'var(--dz-green)';
    if (MID_DENSITY.has(code))  return 'hsl(150 80% 28%)';
    return 'hsl(150 60% 35%)';
  }, [hovered, selectedWilaya, listingCounts, maxCount]);

  const getOpacity = useCallback((code: string): number => {
    const isSelected = selectedWilaya === code;
    const isHovered  = hovered === code;
    if (isSelected || isHovered) return 1;
    if (listingCounts) return 0.8;
    if (HIGH_DENSITY.has(code)) return 0.8;
    if (MID_DENSITY.has(code))  return 0.65;
    return 0.5;
  }, [hovered, selectedWilaya, listingCounts]);

  const entries = useMemo(() => Object.entries(WILAYA_PATHS), []);

  return (
    <div className={`relative select-none ${className}`} role="img" aria-label="Carte interactive des wilayas d'Algérie">
      <svg
        viewBox="0 0 480 560"
        className="w-full h-full"
        style={{ filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.12))' }}
        aria-hidden="true"
      >
        <defs>
          <filter id="wglow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>

        {/* Mediterranean Sea */}
        <rect x="0" y="0" width="480" height="22" rx="0" fill="hsl(210 70% 55% / 0.12)"/>
        <text
          x="240" y="15" textAnchor="middle" fontSize="7"
          fontFamily="Inter, sans-serif" fontWeight="600"
          fill="hsl(210 60% 55%)" opacity="0.7" letterSpacing="2"
        >
          {language === 'ar' ? 'البحر الأبيض المتوسط' : 'MÉDITERRANÉE'}
        </text>

        {/* Wilaya shapes */}
        {entries.map(([code, data]) => {
          if (!data.path) return null;
          const isSelected = selectedWilaya === code;
          const isHovered  = hovered === code;

          return (
            <g
              key={code}
              onClick={() => handleClick(code)}
              onMouseEnter={() => setHovered(code)}
              onMouseLeave={() => setHovered(null)}
              onMouseMove={handleMouseMove}
              style={{ cursor: 'pointer' }}
              role="button"
              aria-label={`${getName(code)}${listingCounts?.[code] ? ` — ${listingCounts[code]} annonces` : ''}`}
              aria-pressed={isSelected}
            >
              {/* Drop shadow on hover */}
              {(isHovered || isSelected) && (
                <path
                  d={data.path}
                  fill="rgba(0,0,0,0.18)"
                  transform="translate(1.5, 2.5)"
                  aria-hidden="true"
                />
              )}

              <path
                d={data.path}
                fill={getWilayaFill(code)}
                stroke="hsl(var(--background))"
                strokeWidth={isSelected ? 1.8 : isHovered ? 1.4 : 0.7}
                opacity={getOpacity(code)}
                style={{
                  transform:  isHovered || isSelected ? 'translateY(-1.5px)' : undefined,
                  transition: 'all 0.15s ease',
                  filter:     isHovered || isSelected ? 'url(#wglow)' : undefined,
                }}
              />

              {/* Code label — show for important wilayas or on hover */}
              {data.cx > 0 && (!compact || isHovered || isSelected) &&
                (HIGH_DENSITY.has(code) || isHovered || isSelected) && (
                <text
                  x={data.cx}
                  y={data.cy}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={isHovered || isSelected ? 8 : 6.5}
                  fontWeight={isHovered || isSelected ? 700 : 600}
                  fontFamily="Inter, sans-serif"
                  fill="rgba(255,255,255,0.95)"
                  style={{ pointerEvents: 'none', transition: 'all 0.15s' }}
                  aria-hidden="true"
                >
                  {code}
                </text>
              )}
            </g>
          );
        })}

        {/* Tooltip inside SVG (avoids overflow issues) */}
        {hovered && (() => {
          const w = WILAYA_PATHS[hovered];
          if (!w) return null;
          const name  = getName(hovered);
          const count = listingCounts?.[hovered];
          const label = `${name}${count != null ? ` · ${count} ann.` : ''}`;
          const tw    = Math.max(label.length * 5.5 + 24, 80);
          const tx    = Math.min(Math.max(tooltipPos.x - tw / 2, 4), 480 - tw - 4);
          const ty    = tooltipPos.y > 480 ? tooltipPos.y - 30 : tooltipPos.y + 12;

          return (
            <g aria-hidden="true" style={{ pointerEvents: 'none' }}>
              <rect x={tx} y={ty} width={tw} height={20} rx="6"
                fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="0.8"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }} />
              <text x={tx + tw / 2} y={ty + 13} textAnchor="middle"
                fontSize="9" fontWeight="600" fontFamily="Inter, sans-serif"
                fill="hsl(var(--foreground))">
                {label}
              </text>
            </g>
          );
        })()}
      </svg>

      {/* Legend (optional) */}
      {listingCounts && (
        <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground justify-center">
          <div className="flex items-center gap-1">
            <span className="w-3 h-2 rounded-sm inline-block opacity-30" style={{ background: 'var(--dz-green)' }} />
            <span>0</span>
          </div>
          <div className="flex-1 h-1.5 rounded-full" style={{
            background: 'linear-gradient(to right, color-mix(in srgb, var(--dz-green) 20%, transparent), var(--dz-green))'
          }} />
          <div className="flex items-center gap-1">
            <span className="w-3 h-2 rounded-sm inline-block" style={{ background: 'var(--dz-green)' }} />
            <span>{maxCount}+</span>
          </div>
          <span className="ml-1">annonces</span>
        </div>
      )}
    </div>
  );
};

export default AlgeriaMap;
