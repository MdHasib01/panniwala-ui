import React from 'react';
import Image from 'next/image';
import defaultLogo from '@/src/assets/logo.png';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  inverse?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  className = '',
  inverse = false,
}) => {
  const logoSrc = defaultLogo;

  const imageSizes = {
    sm: 'h-8 min-w-8 w-auto max-w-[120px]',
    md: 'h-11 min-w-11 w-auto max-w-[160px]',
    lg: 'h-14 min-w-14 w-auto max-w-[200px]',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <Image
        src={logoSrc}
        width={112}
        height={112}
        alt="পানি ওয়ালা লোগো"
        className={`object-cover rounded-xl drop-shadow-xs transition-transform hover:scale-105 shrink-0 ${imageSizes[size]}`}
        style={{ objectFit: 'cover', objectPosition: 'center' }}
      />
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-bold tracking-tight leading-none ${inverse ? 'text-white' : 'text-slate-900'} ${textSizes[size]}`}
          >
            পানি <span className={inverse ? 'text-cyan-300' : 'text-cyan-600'}>ওয়ালা</span>
          </span>
          <span className={`inline-block px-1.5 py-0.5 text-[9px] font-semibold rounded-md ${inverse ? 'bg-cyan-400/10 text-cyan-200 ring-1 ring-cyan-300/20' : 'bg-cyan-100 text-cyan-800'}`}>
            BD
          </span>
        </div>
      </div>
    </div>
  );
};
