import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { WILAYA_PATHS } from '../../data/wilayaPaths';

interface Props {
  onSelectWilaya?: (code: string, name: string) => void;
  selectedWilaya?:  string | null;
  className?:       string;
  compact?:         boolean;
  listingCounts?:   Record<string, number>;
}

const AlgeriaMap: React.FC<Props> = ({
  onSelectWilaya, selectedWilaya, className = '', compact = false, listingCounts,
}) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const navigate              = useNavigate();
  const { language }          = useLanguage();

  const getName = useCallback((code: string) => {
    const w = WILAYA_PATHS[code];
    if (!w) return code;
    return language === 'ar' ? w.nameAr : language === 'en' ? w.nameEn : w.nameFr;
  }, [language]);

  const maxCount = useMemo(() => {
    if (!listingCounts) return 1;
    return Math.max(1, ...Object.values(listingCounts));
  }, [listingCounts]);

  const getColor = useCallback((code: string) => {
    if (selectedWilaya === code) return '#D21034';
    if (hovered === code)        return '#00A050';

    if (listingCounts) {
      const count = listingCounts[code] || 0;
      const ratio = count / maxCount;
      // Gradient: light → dark green
      const lightness = Math.round(55 - ratio * 30);
      return `hsl(150, 65%, ${lightness}%)`;
    }

    // Default coastal vs interior
    const coastal = new Set(['16','31','09','35','42','06','15','21','23','36','41','18','25','43','04','24','02','27']);
    return coastal.has(code) ? '#006233' : '#4CAF50';
  }, [hovered, selectedWilaya, listingCounts, maxCount]);

  const getOpacity = useCallback((code: string) => {
    if (selectedWilaya === code || hovered === code) return 1;
    return listingCounts ? 0.8 : 0.72;
  }, [hovered, selectedWilaya, listingCounts]);

  const entries = useMemo(() => Object.entries(WILAYA_PATHS), []);

  // Show labels for important or hovered wilayas
  const importantCodes = new Set(['16','31','25','23','06','15','05','19','09','35','42']);

  return (
    <div className={`relative select-none ${className}`}>
      <svg
        viewBox="0 0 1000 1000"
        className="w-full h-full"
        role="img"
        aria-label="Carte interactive des 58 wilayas d'Algérie"
      >
        {/* Sea */}
        <defs>
          <linearGradient id="seaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a6b8a" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#1a6b8a" stopOpacity="0.05"/>
          </linearGradient>
          <filter id="hoverShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.3)"/>
          </filter>
        </defs>

        <rect x="0" y="0" width="1000" height="45" fill="url(#seaGrad)"/>
        <text x="500" y="28" textAnchor="middle" fontSize="8"
          fontFamily="Inter,sans-serif" fontWeight="600" letterSpacing="3"
          fill="hsl(200,60%,55%)" opacity="0.8">
          {language === 'ar' ? 'البحر الأبيض المتوسط' : 'MÉDITERRANÉE'}
        </text>

        {/* Wilaya paths */}
        {entries.map(([code, data]) => {
          if (!data.path) return null;
          const isSelected = selectedWilaya === code;
          const isHovered  = hovered === code;
          const color      = getColor(code);
          const opacity    = getOpacity(code);

          return (
            <g
              key={code}
              onClick={() => {
                if (onSelectWilaya) onSelectWilaya(code, getName(code));
                else navigate(`/search?wilaya=${code}`);
              }}
              onMouseEnter={() => setHovered(code)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'pointer' }}
              role="button"
              aria-label={`${getName(code)}${listingCounts?.[code] ? ` — ${listingCounts[code]} annonces` : ''}`}
              aria-pressed={isSelected}
            >
              <path
                d={data.path}
                fill={color}
                stroke="rgba(255,255,255,0.7)"
                strokeWidth={isSelected ? 1.8 : isHovered ? 1.4 : 0.7}
                opacity={opacity}
                filter={isHovered || isSelected ? 'url(#hoverShadow)' : undefined}
                style={{ transition: 'all 0.15s ease' }}
              />
              {/* Label for important/hovered wilayas */}
              {data.cx > 0 && data.cy > 0 &&
                (!compact || isHovered || isSelected) &&
                (importantCodes.has(code) || isHovered || isSelected) && (
                <text
                  x={data.cx} y={data.cy + 3}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={isHovered || isSelected ? 8 : 7}
                  fontWeight={isHovered || isSelected ? 700 : 600}
                  fontFamily="Inter,sans-serif"
                  fill="rgba(255,255,255,0.95)"
                  style={{ pointerEvents: 'none' }}
                >
                  {code}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hovered && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none z-10">
          <div className="bg-card/95 backdrop-blur border border-border px-3 py-1.5 rounded-full text-xs font-bold shadow-lg whitespace-nowrap flex items-center gap-1.5">
            <span>📍</span>
            <span>{getName(hovered)}</span>
            {listingCounts?.[hovered] != null && (
              <span className="text-dz-green font-black ml-1">
                {listingCounts[hovered]} ann.
              </span>
            )}
          </div>
        </div>
      )}

      {/* Density legend */}
      {listingCounts && (
        <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground justify-center">
          <span>Peu</span>
          <div className="flex gap-0.5">
            {[35,30,25,20,15].map(l => (
              <div key={l} className="w-4 h-2 rounded-sm" style={{background:`hsl(150,65%,${l}%)`}}/>
            ))}
          </div>
          <span>Beaucoup</span>
        </div>
      )}
    </div>
  );
};

export default AlgeriaMap;
