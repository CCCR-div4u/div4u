import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, BarChart3, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import { useScreenSize } from './ResponsiveLayout';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  badge?: number;
}

const MobileNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile } = useScreenSize();

  // 모바일이 아니면 렌더링하지 않음
  if (!isMobile) return null;

  const navItems: NavItem[] = [
    {
      icon: <Home className="w-5 h-5" />,
      label: '홈',
      path: '/'
    },
    {
      icon: <Search className="w-5 h-5" />,
      label: '실시간',
      path: '/realtime'
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      label: '비교',
      path: '/comparison'
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: '더보기',
      path: '/other'
    }
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  return (
    <nav className="mobile-nav">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={cn(
                'flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200',
                'touch-target min-w-[60px]',
                isActive 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50',
                'active:scale-95 active:opacity-80'
              )}
            >
              <div className="relative">
                {item.icon}
                {item.badge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={cn(
                'text-xs mt-1 font-medium',
                isActive ? 'text-blue-600' : 'text-gray-600'
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavigation;