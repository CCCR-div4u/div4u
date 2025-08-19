import React from 'react';
import { Button } from './ui';
import { useNavigate, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="w-full bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/')}
              className="text-xl font-bold text-amber-900 flex items-center gap-2 hover:text-amber-800 transition-colors cursor-pointer"
            >
              🐿️ 서울 혼잡도 with 포유
            </button>
          </div>
          <nav className="hidden md:flex space-x-8">
            <button
              onClick={() => navigate('/realtime')}
              className={`font-medium transition-colors ${
                isActive('/services') || isActive('/realtime') || isActive('/prediction')
                  ? 'text-amber-900 font-bold'
                  : 'text-amber-700 hover:text-amber-900'
              }`}
            >
              실시간 혼잡도
            </button>
            <button
              onClick={() => alert('혼잡도 예측 서비스는 준비 중입니다! 🐿️')}
              className="text-amber-700 hover:text-amber-900 font-medium transition-colors"
            >
              혼잡도 예측
            </button>
            <button
              onClick={() => window.location.href = '/comparison'}
              className="text-amber-700 hover:text-amber-900 font-medium transition-colors"
            >
              혼잡도 비교
            </button>
            <button
              onClick={() => navigate('/about')}
              className={`font-medium transition-colors ${
                isActive('/about')
                  ? 'text-amber-900 font-bold'
                  : 'text-amber-700 hover:text-amber-900'
              }`}
            >
              About
            </button>
          </nav>
          
          {/* 모바일 메뉴 (간단한 버전) */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/realtime')}
              className="text-amber-700 hover:text-amber-900 hover:bg-orange-100"
            >
              메뉴
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;