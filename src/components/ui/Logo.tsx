import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'white' | 'dark';
  showTagline?: boolean;
}

/**
 * Le Fennec — Logotype wordmark uniquement.
 * Remplacez le SVG ci-dessous par le fichier logo du client
 * en important: import LogoFile from '../../assets/logo.svg'
 * puis: <img src={LogoFile} alt="Le Fennec" className={...} />
 */
const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'default',
  showTagline = false,
}) => {
  const { language } = useLanguage();

  const sizes = {
    sm: { text: 'text-lg', sub: 'text-[9px]', gap: 'gap-1' },
    md: { text: 'text-xl', sub: 'text-[10px]', gap: 'gap-1.5' },
    lg: { text: 'text-3xl', sub: 'text-xs', gap: 'gap-2' },
  };

  const colors = {
    default: { main: 'text-dz-green dark:text-dz-green', sub: 'text-muted-foreground' },
    white:   { main: 'text-white', sub: 'text-white/60' },
    dark:    { main: 'text-foreground', sub: 'text-muted-foreground' },
  };

  const taglines = {
    fr: 'Petites annonces en Algérie',
    ar: 'إعلانات مبوبة في الجزائر',
    en: 'Classifieds in Algeria',
  };

  return (
    <div className={`flex flex-col ${sizes[size].gap} select-none`}>
      <div className="flex items-baseline gap-0.5">
        {/* Wordmark — replace with your SVG/PNG logo here */}
        <span
          className={`font-black tracking-tight leading-none ${sizes[size].text} ${colors[variant].main}`}
          style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.04em' }}
        >
          Le
        </span>
        <span
          className={`font-black tracking-tight leading-none ${sizes[size].text} ${colors[variant].main}`}
          style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.04em', marginLeft: '0.2em' }}
        >
          Fennec
        </span>
        {/* Dot accent in Algerian red */}
        <span
          className="inline-block rounded-full ml-0.5"
          style={{
            width: size === 'sm' ? 5 : size === 'md' ? 6 : 8,
            height: size === 'sm' ? 5 : size === 'md' ? 6 : 8,
            background: 'var(--dz-red)',
            marginBottom: size === 'sm' ? 2 : 3,
            flexShrink: 0,
          }}
        />
      </div>
      {showTagline && (
        <span
          className={`${sizes[size].sub} font-medium tracking-wide uppercase ${colors[variant].sub}`}
          style={{ letterSpacing: '0.06em' }}
        >
          {taglines[language]}
        </span>
      )}
    </div>
  );
};

export default Logo;
