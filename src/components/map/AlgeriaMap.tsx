import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { WILAYA_PATHS } from '../../data/wilayaPaths';

interface AlgeriaMapProps {
  onSelectWilaya?: (code: string, name: string) => void;
  selectedWilaya?: string | null;
  className?: string;
  compact?: boolean;
  showLegend?: boolean;
}

const AlgeriaMap: React.FC<AlgeriaMapProps> = ({
  onSelectWilaya, selectedWilaya, className = '', compact = false,
}) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const navigate   = useNavigate();
  const { language } = useLanguage();

  const getName = (code: string) => {
    const w = WILAYA_PATHS[code];
    if (!w) return code;
    return language === 'ar' ? w.nameAr : language === 'en' ? w.nameEn : w.nameFr;
  };

  const handleClick = useCallback((code: string) => {
    if (onSelectWilaya) onSelectWilaya(code, getName(code));
    else navigate(`/search?wilaya=${code}`);
  }, [language, navigate, onSelectWilaya]);

  // Group wilayas by density for color coding
  const highDensity = ['16','31','25','09','23','15','35','06','19','05','42'];

  return (
    <div className={`relative select-none ${className}`}>
      <svg
        viewBox="0 0 480 560"
        className="w-full h-full"
        style={{ filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.12))' }}
      >
        {/* Sea */}
        <rect x="0" y="0" width="480" height="28" rx="4"
          fill="hsl(200 60% 60% / 0.15)" />
        <text x="240" y="18" textAnchor="middle" fontSize="7"
          fontFamily="Inter,sans-serif" fontWeight="600" letterSpacing="2"
          fill="hsl(200 50% 55%)" opacity="0.7">
          {language === 'ar' ? 'البحر الأبيض المتوسط' : 'MÉDITERRANÉE'}
        </text>

        {/* Wilaya paths */}
        {Object.entries(WILAYA_PATHS).map(([code, data]) => {
          if (!data.path) return null;
          const isHovered  = hovered === code;
          const isSelected = selectedWilaya === code;
          const isDense    = highDensity.includes(code);

          let fill = isDense ? 'var(--dz-green)' : 'hsl(var(--primary) / 0.55)';
          let opacity = isDense ? 0.75 : 0.5;
          if (isHovered)  { fill = 'var(--dz-green2)'; opacity = 1; }
          if (isSelected) { fill = 'var(--dz-red)';    opacity = 1; }

          return (
            <g key={code}
              onClick={() => handleClick(code)}
              onMouseEnter={() => setHovered(code)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Hover shadow */}
              {(isHovered || isSelected) && (
                <path d={data.path} fill="rgba(0,0,0,0.2)" transform="translate(1.5,2.5)" />
              )}
              <path d={data.path}
                fill={fill}
                stroke="hsl(var(--background))"
                strokeWidth={isSelected ? 1.5 : isHovered ? 1.2 : 0.6}
                opacity={opacity}
                style={{
                  transform:  isHovered || isSelected ? 'translateY(-1px)' : undefined,
                  transition: 'all 0.15s ease',
                }}
              />
              {/* Code label - only for dense/important wilayas or hovered */}
              {(!compact && (isDense || isHovered || isSelected)) && data.cx > 0 && (
                <text x={data.cx} y={data.cy}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={isHovered || isSelected ? 7.5 : 6}
                  fontWeight={isHovered || isSelected ? 700 : 600}
                  fontFamily="Inter,sans-serif"
                  fill="rgba(255,255,255,0.95)"
                  style={{ pointerEvents: 'none', transition: 'all 0.15s' }}>
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
          <div className="bg-card/95 backdrop-blur border border-border px-3 py-1.5 rounded-full text-xs font-bold shadow-lg whitespace-nowrap">
            📍 {getName(hovered)}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlgeriaMap;
