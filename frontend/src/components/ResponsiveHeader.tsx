import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { useScreenSize } from './ResponsiveLayout';
import { Button } from './ui';

interface ResponsiveHeaderProps {
  title: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  showMenuButton?: boolean;
  onMenuClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const ResponsiveHeader: React.FC<ResponsiveHeaderProps> = ({
  title,
  showBackButton = true,
  showHomeButton = true,
  showMenuButton = false,
  onMenuClick,
  className,
  children
}) => {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useScreenSize();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
    onMenuClick?.();
  };

  return (
    <>
      <header className={cn(
        'bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40',
        className
      )}>
        <div className={cn(
          'mx-auto px-4 py-3',
          isMobile ? 'max-w-full' : isTablet ? 'max-w-4xl' : 'max-w-6xl'
        )}>
          <div className="flex items-center justify-between">
            {/* 왼쪽 네비게이션 */}
            <div className="flex items-center space-x-2">
              {showBackButton && (
                <Button
                  variant="ghost"
                  size={isMobile ? "sm" : "sm"}
                  onClick={handleBackClick}
                  className={cn(
                    'flex items-center space-x-1',
                    isMobile && 'touch-target'
                  )}
                >
                  <ArrowLeft className="w-4 h-4" />
                  {!isMobile && <span>뒤로</span>}
                </Button>
              )}
              
              {showHomeButton && (
                <Button
                  variant="ghost"
                  size={isMobile ? "sm" : "sm"}
                  onClick={handleHomeClick}
                  className={cn(
                    'flex items-center space-x-1',
                    isMobile && 'touch-target'
                  )}
                >
                  <Home className="w-4 h-4" />
                  {!isMobile && <span>홈</span>}
                </Button>
              )}
            </div>

            {/* 중앙 제목 */}
            <h1 className={cn(
              'font-bold text-gray-800 truncate mx-4',
              isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-2xl'
            )}>
              {title}
            </h1>

            {/* 오른쪽 액션 */}
            <div className="flex items-center space-x-2">
              {children}
              
              {showMenuButton && (
                <Button
                  variant="ghost"
                  size={isMobile ? "sm" : "sm"}
                  onClick={handleMenuClick}
                  className={cn(
                    'flex items-center',
                    isMobile && 'touch-target'
                  )}
                >
                  {isMenuOpen ? (
                    <X className="w-4 h-4" />
                  ) : (
                    <Menu className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* 모바일 메뉴 드롭다운 */}
        {isMenuOpen && isMobile && (
          <div className="border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-2">
              <Button
                variant="ghost"
                onClick={() => {
                  navigate('/realtime');
                  setIsMenuOpen(false);
                }}
                className="w-full justify-start touch-target"
              >
                실시간 혼잡도
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  navigate('/comparison');
                  setIsMenuOpen(false);
                }}
                className="w-full justify-start touch-target"
              >
                혼잡도 비교
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  navigate('/prediction');
                  setIsMenuOpen(false);
                }}
                className="w-full justify-start touch-target"
              >
                혼잡도 예측
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* 모바일에서 하단 네비게이션을 위한 여백 */}
      {isMobile && <div className="h-20" />}
    </>
  );
};

export default ResponsiveHeader;