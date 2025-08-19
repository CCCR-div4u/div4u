import React from 'react';
import { cn } from '../../lib/utils';
import { FORU_IMAGES, getForuImageByCongestionLevel } from '../../constants/foruImages';

interface CharacterGuideProps {
  congestionLevel?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showMessage?: boolean;
  message?: string;
  className?: string;
  animate?: boolean;
}

const CharacterGuide: React.FC<CharacterGuideProps> = ({
  congestionLevel = 'main',
  size = 'md',
  showMessage = false,
  message,
  className,
  animate = false
}) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32', 
    lg: 'w-48 h-48',
    xl: 'w-64 h-64'
  };

  const containerSizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-36 h-36',
    lg: 'w-52 h-52', 
    xl: 'w-72 h-72'
  };

  const imageSrc = getForuImageByCongestionLevel(congestionLevel);

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {/* 캐릭터 컨테이너 */}
      <div className={cn(
        'bg-gradient-to-r from-orange-200 via-amber-200 to-yellow-200 rounded-full flex items-center justify-center shadow-lg border-4 border-orange-300/30 relative overflow-hidden',
        containerSizeClasses[size],
        animate && 'animate-pulse'
      )}>
        <img
          src={imageSrc}
          alt="포유 캐릭터"
          className={cn(
            'object-contain drop-shadow-lg',
            sizeClasses[size],
            animate && 'animate-bounce'
          )}
          onError={(e) => {
            e.currentTarget.src = FORU_IMAGES.default;
          }}
        />
        
        {/* 장식 효과 */}
        <div className="absolute top-4 right-4 w-3 h-3 bg-orange-400 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute bottom-6 left-4 w-2 h-2 bg-yellow-400 rounded-full opacity-70 animate-pulse delay-300"></div>
        <div className="absolute top-6 left-6 w-1.5 h-1.5 bg-amber-400 rounded-full opacity-50 animate-pulse delay-700"></div>
      </div>

      {/* 메시지 */}
      {showMessage && message && (
        <div className="mt-4 p-3 bg-white/80 backdrop-blur-sm rounded-lg border border-orange-200 shadow-sm max-w-xs">
          <p className="text-sm text-amber-800 text-center leading-relaxed">
            {message}
          </p>
        </div>
      )}
    </div>
  );
};

export default CharacterGuide;