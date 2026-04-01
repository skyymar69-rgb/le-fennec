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
  onSelectWilaya, selectedWilaya, className = '', compact = false, showLegend = false,
}) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const navigate  = useNavigate();
  const { language } = useLanguage();

  const getName = useCallback((code: string) => {
    const w = WILAYA_PATHS[code];
    if (!w) return code;
    return language === 'ar' ? w.nameAr : language === 'en' ? w.nameEn : w.nameFr;
  }, [language]);

  const handleClick = useCallback((code: string) => {
    const name = getName(code);
    if (onSelectWilaya) onSelectWilaya(code, name);
    else navigate(`/search?wilaya=${code}`);
  }, [getName, navigate, onSelectWilaya]);

  return (
    <div className={`relative select-none ${className}`}>
      <svg
        viewBox="0 0 480 560"
        className="w-full h-full"
        style={{ filter: 'drop-shadow(0 6px 20px rgba(0,0,0,0.15))' }}
      >
        <defs>
          <filter id="wglow">
            <feGaussianBlur stdDeviation="2.5" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
          <filter id="wselected">
            <feGaussianBlur stdDeviation="1.5" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>

        {/* Sea hint */}
        <text x="240" y="16" textAnchor="middle" fontSize="7" fontFamily="Inter,sans-serif"
          fontWeight="500" fill="currentColor" opacity="0.25">
          {language === 'ar' ? 'البحر الأبيض المتوسط' : 'MÉDITERRANÉE'}
        </text>

        {Object.entries(WILAYA_PATHS).map(([code, data]) => {
          if (!data.path) return null;
          const isHovered  = hovered  === code;
          const isSelected = selectedWilaya === code;

          return (
            <g key={code}
              onClick={() => handleClick(code)}
              onMouseEnter={() => setHovered(code)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Shadow layer on hover */}
              {(isHovered || isSelected) && (
                <path d={data.path} fill="rgba(0,0,0,0.18)" transform="translate(2,3)" />
              )}

              {/* Main shape */}
              <path
                d={data.path}
                style={{
                  fill:        isSelected ? 'var(--dz-red)' : isHovered ? 'var(--dz-green2)' : 'var(--dz-green)',
                  stroke:      'hsl(var(--background))',
                  strokeWidth: isSelected ? 1.5 : isHovered ? 1.2 : 0.7,
                  opacity:     isSelected ? 1 : isHovered ? 1 : 0.72,
                  filter:      isSelected ? 'url(#wselected)' : isHovered ? 'url(#wglow)' : undefined,
                  transform:   isHovered || isSelected ? 'translateY(-1.5px)' : undefined,
                  transition:  'all 0.18s ease',
                }}
              />

              {/* Wilaya code label (skip compact) */}
              {!compact && data.cx > 0 && (
                <text
                  x={data.cx} y={data.cy}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={isHovered || isSelected ? 7 : 5.5}
                  fontWeight={isHovered || isSelected ? 700 : 600}
                  fontFamily="Inter,sans-serif"
                  fill={isSelected ? '#fff' : isHovered ? '#fff' : 'rgba(255,255,255,0.8)'}
                  style={{ pointerEvents: 'none', transition: 'all 0.15s' }}
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
        <div
          className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none z-20 animate-fade-up"
          style={{ whiteSpace: 'nowrap' }}
        >
          <div className="bg-card/95 backdrop-blur-sm border border-border text-foreground px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
            📍 {getName(hovered)}
          </div>
        </div>
      )}

      {/* Legend */}
      {showLegend && (
        <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: 'var(--dz-green)' }} />
            {language === 'ar' ? 'الولاية' : language === 'en' ? 'Wilaya' : 'Wilaya'}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: 'var(--dz-red)' }} />
            {language === 'ar' ? 'محدد' : language === 'en' ? 'Selected' : 'Sélectionné'}
          </span>
        </div>
      )}
    </div>
  );
};

export default AlgeriaMap;
