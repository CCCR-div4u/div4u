import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
}

// 화면 크기 감지 훅
export const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false,
    isTablet: typeof window !== 'undefined' ? window.innerWidth >= 768 && window.innerWidth < 1024 : false,
    isDesktop: typeof window !== 'undefined' ? window.innerWidth >= 1024 : false,
    isTouch: typeof window !== 'undefined' ? 'ontouchstart' in window : false,
    orientation: typeof window !== 'undefined' ? 
      (window.innerHeight > window.innerWidth ? 'portrait' : 'landscape') : 'portrait'
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({
        width,
        height,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        isTouch: 'ontouchstart' in window,
        orientation: height > width ? 'portrait' : 'landscape'
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // 초기 설정

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
};

// 반응형 컨테이너 컴포넌트
export const ResponsiveContainer: React.FC<ResponsiveLayoutProps> = ({ 
  children, 
  className 
}) => {
  const { isMobile, isTablet } = useScreenSize();

  return (
    <div className={cn(
      'w-full mx-auto',
      // 모바일
      isMobile && 'px-4 max-w-full',
      // 태블릿
      isTablet && 'px-6 max-w-4xl',
      // 데스크톱
      !isMobile && !isTablet && 'px-8 max-w-6xl',
      className
    )}>
      {children}
    </div>
  );
};

// 반응형 그리드 컴포넌트
interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = { mobile: '1rem', tablet: '1.5rem', desktop: '2rem' },
  className
}) => {
  const { isMobile, isTablet } = useScreenSize();

  const gridCols = isMobile ? cols.mobile : isTablet ? cols.tablet : cols.desktop;
  const gridGap = isMobile ? gap.mobile : isTablet ? gap.tablet : gap.desktop;

  return (
    <div 
      className={cn('grid w-full', className)}
      style={{
        gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
        gap: gridGap
      }}
    >
      {children}
    </div>
  );
};

// 반응형 텍스트 컴포넌트
interface ResponsiveTextProps {
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  className?: string;
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  size = 'base',
  className
}) => {
  const sizeClasses = {
    xs: 'text-xs sm:text-sm',
    sm: 'text-sm sm:text-base',
    base: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-xl lg:text-2xl',
    xl: 'text-xl sm:text-2xl lg:text-3xl',
    '2xl': 'text-2xl sm:text-3xl lg:text-4xl',
    '3xl': 'text-3xl sm:text-4xl lg:text-5xl',
    '4xl': 'text-4xl sm:text-5xl lg:text-6xl'
  };

  return (
    <div className={cn(sizeClasses[size], className)}>
      {children}
    </div>
  );
};

// 반응형 간격 컴포넌트
interface ResponsiveSpacingProps {
  children: React.ReactNode;
  padding?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
  margin?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
  className?: string;
}

export const ResponsiveSpacing: React.FC<ResponsiveSpacingProps> = ({
  children,
  padding = { mobile: 'p-4', tablet: 'p-6', desktop: 'p-8' },
  margin = { mobile: 'm-2', tablet: 'm-4', desktop: 'm-6' },
  className
}) => {
  const { isMobile, isTablet } = useScreenSize();

  const paddingClass = isMobile ? padding.mobile : isTablet ? padding.tablet : padding.desktop;
  const marginClass = isMobile ? margin.mobile : isTablet ? margin.tablet : margin.desktop;

  return (
    <div className={cn(paddingClass, marginClass, className)}>
      {children}
    </div>
  );
};

// 터치 친화적 버튼 컴포넌트
interface TouchFriendlyButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

export const TouchFriendlyButton: React.FC<TouchFriendlyButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className,
  disabled = false
}) => {
  const { isTouch } = useScreenSize();

  const baseClasses = cn(
    'inline-flex items-center justify-center rounded-md font-medium transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    // 터치 디바이스에서 더 큰 터치 영역
    isTouch && 'touch-target',
    disabled && 'opacity-50 cursor-not-allowed'
  );

  const variantClasses = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500'
  };

  const sizeClasses = {
    sm: isTouch ? 'px-4 py-3 text-sm min-h-[44px]' : 'px-3 py-2 text-sm',
    md: isTouch ? 'px-6 py-3 text-base min-h-[44px]' : 'px-4 py-2 text-base',
    lg: isTouch ? 'px-8 py-4 text-lg min-h-[48px]' : 'px-6 py-3 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        // 터치 피드백
        isTouch && 'active:scale-95 active:opacity-80',
        className
      )}
    >
      {children}
    </button>
  );
};

// 메인 반응형 레이아웃 컴포넌트
const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ 
  children, 
  className 
}) => {
  const { isMobile, isTablet, orientation } = useScreenSize();

  return (
    <div className={cn(
      'min-h-screen w-full',
      // 모바일 세로 모드에서 하단 여백 추가 (모바일 브라우저 UI 고려)
      isMobile && orientation === 'portrait' && 'pb-safe-bottom',
      // 가로 모드에서 컴팩트 레이아웃
      orientation === 'landscape' && 'landscape-compact',
      className
    )}>
      {children}
    </div>
  );
};

export default ResponsiveLayout;