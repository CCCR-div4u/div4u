import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';

// 혼잡도 레벨 타입
type CongestionLevel = '붐빔' | '약간 붐빔' | '보통' | '여유' | '정보없음';

// 캐릭터 상태 타입
interface CharacterState {
  expression: 'stressed' | 'worried' | 'normal' | 'happy' | 'unknown';
  animation: 'shake' | 'pulse' | 'bounce' | 'float' | 'wiggle' | 'none';
  aura: 'red' | 'orange' | 'blue' | 'green' | 'gray';
  particles: 'sweat' | 'sparkles' | 'hearts' | 'stress' | 'none';
  message: string;
}

// 전환 상태 타입
interface TransitionState {
  isTransitioning: boolean;
  transitionType: 'smooth' | 'bounce' | 'elastic' | 'none';
  previousState?: CharacterState;
}

// 캐릭터 가이드 컴포넌트 Props
interface CharacterGuideProps {
  congestionLevel?: CongestionLevel;
  location?: string;
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showMessage?: boolean;
  className?: string;
}

const CharacterGuide: React.FC<CharacterGuideProps> = ({
  congestionLevel = '정보없음',
  location,
  message,
  size = 'md',
  showMessage = true,
  className
}) => {
  const [characterState, setCharacterState] = useState<CharacterState>({
    expression: 'normal',
    animation: 'float',
    aura: 'blue',
    particles: 'none',
    message: '안녕하세요! 어디로 가고 싶으신가요? 🌟'
  });

  const [transitionState, setTransitionState] = useState<TransitionState>({
    isTransitioning: false,
    transitionType: 'none'
  });

  const [isMessageTransitioning, setIsMessageTransitioning] = useState(false);
  const previousStateRef = useRef<CharacterState | null>(null);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 크기별 스타일
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40'
  };

  const imageSizeClasses = {
    sm: 'w-14 h-14',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
    xl: 'w-36 h-36'
  };

  // 전환 타입 결정 함수
  const getTransitionType = (from: CharacterState, to: CharacterState): 'smooth' | 'bounce' | 'elastic' => {
    // 여유 상태로 변경될 때는 bounce 전환
    if (to.expression === 'happy') return 'bounce';
    // 스트레스 상태로 변경될 때는 elastic 전환
    if (to.expression === 'stressed') return 'elastic';
    // 그 외에는 smooth 전환
    return 'smooth';
  };

  // 혼잡도에 따른 고급 캐릭터 상태 설정 및 전환 애니메이션
  useEffect(() => {
    const getCharacterState = (level: CongestionLevel): CharacterState => {
      switch (level) {
        case '붐빔':
          return {
            expression: 'stressed',
            animation: 'shake',
            aura: 'red',
            particles: 'stress',
            message: message || `${location ? location + '은(는) ' : ''}정말 붐비네요! 😰 다른 시간에 방문하는 것을 추천해요. 사람이 너무 많아서 이동이 어려울 수 있어요!`
          };
        case '약간 붐빔':
          return {
            expression: 'worried',
            animation: 'wiggle',
            aura: 'orange',
            particles: 'sweat',
            message: message || `${location ? location + '은(는) ' : ''}조금 붐비고 있어요. 😅 조심해서 이동하시고, 여유시간을 두고 출발하세요!`
          };
        case '보통':
          return {
            expression: 'normal',
            animation: 'pulse',
            aura: 'blue',
            particles: 'none',
            message: message || `${location ? location + '은(는) ' : ''}적당한 수준이에요. 😊 평소와 비슷한 혼잡도로 무난하게 이용할 수 있어요!`
          };
        case '여유':
          return {
            expression: 'happy',
            animation: 'bounce',
            aura: 'green',
            particles: 'hearts',
            message: message || `${location ? location + '은(는) ' : ''}여유로워요! 🎉 지금이 방문하기 완벽한 시간이에요! 편안하게 둘러보세요~`
          };
        default:
          return {
            expression: 'unknown',
            animation: 'float',
            aura: 'gray',
            particles: 'none',
            message: message || '혼잡도 정보를 가져오는 중이에요... 🤔 잠시만 기다려주세요!'
          };
      }
    };

    const newState = getCharacterState(congestionLevel);
    
    // 상태가 실제로 변경되었는지 확인
    const hasStateChanged = previousStateRef.current && (
      previousStateRef.current.expression !== newState.expression ||
      previousStateRef.current.aura !== newState.aura ||
      previousStateRef.current.particles !== newState.particles
    );

    if (hasStateChanged && previousStateRef.current) {
      // 전환 애니메이션 시작
      const transitionType = getTransitionType(previousStateRef.current, newState);
      
      setTransitionState({
        isTransitioning: true,
        transitionType,
        previousState: previousStateRef.current
      });

      // 메시지 전환 시작
      if (previousStateRef.current.message !== newState.message) {
        setIsMessageTransitioning(true);
      }

      // 전환 애니메이션 완료 후 새 상태 적용
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }

      transitionTimeoutRef.current = setTimeout(() => {
        setCharacterState(newState);
        setTransitionState({
          isTransitioning: false,
          transitionType: 'none'
        });
        setIsMessageTransitioning(false);
      }, transitionType === 'bounce' ? 1000 : transitionType === 'elastic' ? 1200 : 800);
    } else {
      // 첫 로드이거나 상태 변경이 없는 경우
      setCharacterState(newState);
    }

    previousStateRef.current = newState;

    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [congestionLevel, location, message]);

  // 고급 애니메이션 클래스 매핑 (전환 상태 고려)
  const getCharacterClasses = (state: CharacterState, transition: TransitionState) => {
    const baseClasses = 'will-change-transform gpu-accelerated';
    
    // 전환 중인 경우
    if (transition.isTransitioning) {
      const transitionClass = 
        transition.transitionType === 'bounce' ? 'animate-bounce-transition' :
        transition.transitionType === 'elastic' ? 'animate-elastic-transition' :
        'animate-state-transition-in';
      
      return `${baseClasses} ${transitionClass}`;
    }
    
    // 일반 상태
    switch (state.expression) {
      case 'stressed':
        return `${baseClasses} character-sequence-stressed aura-red`;
      case 'worried':
        return `${baseClasses} character-worried aura-orange`;
      case 'happy':
        return `${baseClasses} character-sequence-happy aura-green`;
      case 'normal':
        return `${baseClasses} character-sequence-normal aura-blue`;
      case 'unknown':
        return `${baseClasses} character-unknown aura-gray`;
      default:
        return `${baseClasses} animate-float aura-blue`;
    }
  };

  // 표정 오버레이 클래스
  const getExpressionOverlay = (expression: string) => {
    switch (expression) {
      case 'stressed':
        return 'expression-stressed';
      case 'worried':
        return 'expression-worried';
      case 'happy':
        return 'expression-happy';
      case 'normal':
        return 'expression-normal';
      default:
        return '';
    }
  };

  // 고급 파티클 효과 렌더링 (전환 애니메이션 포함)
  const renderParticles = () => {
    const currentParticles = transitionState.isTransitioning && transitionState.previousState 
      ? transitionState.previousState.particles 
      : characterState.particles;
      
    if (currentParticles === 'none') return null;

    const particleConfig = {
      sweat: { 
        emoji: '💧', 
        count: 4, 
        positions: ['top-2 right-2', 'top-4 right-6', 'top-6 right-4', 'top-3 right-8'],
        animation: 'particle-sweat',
        size: 'text-sm'
      },
      sparkles: { 
        emoji: '✨', 
        count: 6, 
        positions: ['top-1 right-1', 'top-3 left-1', 'bottom-3 right-1', 'bottom-1 left-3', 'top-2 left-6', 'bottom-4 right-6'],
        animation: 'particle-sparkles',
        size: 'text-base'
      },
      hearts: { 
        emoji: '💖', 
        count: 4, 
        positions: ['top-2 right-2', 'top-4 left-2', 'bottom-2 right-4', 'top-1 left-4'],
        animation: 'particle-hearts',
        size: 'text-lg'
      },
      stress: { 
        emoji: '💥', 
        count: 3, 
        positions: ['top-1 right-1', 'top-1 left-1', 'top-3 right-3'],
        animation: 'particle-stress',
        size: 'text-xl'
      }
    };

    const config = particleConfig[currentParticles as keyof typeof particleConfig];
    if (!config) return null;

    const transitionClass = transitionState.isTransitioning 
      ? (characterState.particles !== 'none' ? 'animate-particle-transition-in' : 'animate-particle-transition-out')
      : '';

    return (
      <>
        {config.positions.map((position, index) => (
          <div
            key={`${currentParticles}-${index}`}
            className={cn(
              'absolute pointer-events-none z-10 will-change-transform',
              config.size,
              transitionClass || config.animation,
              position
            )}
            style={{ 
              animationDelay: `${index * 0.3}s`,
              animationDuration: currentParticles === 'sparkles' ? '1.5s' : '1s'
            }}
          >
            {config.emoji}
          </div>
        ))}
      </>
    );
  };

  // 배경 오라 효과 렌더링 (전환 애니메이션 포함)
  const renderBackgroundAura = () => {
    const currentAura = transitionState.isTransitioning && transitionState.previousState 
      ? transitionState.previousState.aura 
      : characterState.aura;
      
    if (characterState.expression === 'unknown' && !transitionState.isTransitioning) return null;

    const transitionClass = transitionState.isTransitioning ? 'animate-aura-transition' : 'animate-aura-pulse';

    return (
      <div className={cn(
        'absolute inset-0 rounded-full pointer-events-none will-change-transform',
        transitionClass,
        currentAura === 'red' && 'aura-red',
        currentAura === 'orange' && 'aura-orange',
        currentAura === 'green' && 'aura-green',
        currentAura === 'blue' && 'aura-blue',
        currentAura === 'gray' && 'aura-gray'
      )} />
    );
  };

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {/* 캐릭터 컨테이너 */}
      <div className="relative">
        {/* 배경 오라 효과 */}
        {renderBackgroundAura()}

        {/* 메인 캐릭터 */}
        <div className={cn(
          'bg-white rounded-full shadow-2xl flex items-center justify-center relative overflow-hidden z-20',
          sizeClasses[size],
          getCharacterClasses(characterState, transitionState),
          // 부드러운 모핑 효과 추가
          !transitionState.isTransitioning && characterState.expression === 'happy' && 'animate-smooth-morph'
        )}>
          {/* 캐릭터 이미지 */}
          <img 
            src="/images/character.png"
            alt="서울 혼잡도 서비스 캐릭터" 
            className={cn(
              'object-contain transition-all duration-700 z-10',
              imageSizeClasses[size],
              // 고급 표정 필터 효과
              characterState.expression === 'stressed' && 'hue-rotate-15 saturate-150 contrast-110 brightness-95',
              characterState.expression === 'worried' && 'hue-rotate-30 saturate-125 contrast-105',
              characterState.expression === 'happy' && 'hue-rotate-90 saturate-125 brightness-110 contrast-105',
              characterState.expression === 'normal' && 'saturate-110 brightness-105',
              characterState.expression === 'unknown' && 'grayscale-30 opacity-75 saturate-75'
            )}
            onError={(e) => {
              // 이미지 로드 실패 시 SVG로 대체
              e.currentTarget.src = '/images/character.svg';
              // 그것도 실패하면 이모지로 대체
              e.currentTarget.onerror = () => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'block';
              };
            }}
          />
          
          {/* 폴백 이모지 */}
          <div className={cn(
            'hidden transition-all duration-500 z-10',
            size === 'sm' && 'text-2xl',
            size === 'md' && 'text-3xl',
            size === 'lg' && 'text-5xl',
            size === 'xl' && 'text-6xl',
            // 이모지도 애니메이션 적용
            characterState.expression === 'stressed' && 'animate-stressed-shake',
            characterState.expression === 'worried' && 'animate-worried-sway',
            characterState.expression === 'happy' && 'animate-happy-bounce',
            characterState.expression === 'normal' && 'animate-float'
          )}>
            {characterState.expression === 'stressed' ? '😰' :
             characterState.expression === 'worried' ? '😅' :
             characterState.expression === 'happy' ? '🎉' :
             characterState.expression === 'unknown' ? '🤔' : '😊'}
          </div>

          {/* 고급 표정 오버레이 */}
          <div className={cn(
            'absolute inset-0 rounded-full transition-all duration-700 z-5',
            getExpressionOverlay(characterState.expression)
          )} />

          {/* 추가 시각 효과 레이어 */}
          {characterState.expression === 'happy' && (
            <div className="absolute inset-0 rounded-full animate-rainbow-shift opacity-20 z-0" 
                 style={{ background: 'conic-gradient(from 0deg, #ff0000, #ff8000, #ffff00, #80ff00, #00ff00, #00ff80, #00ffff, #0080ff, #0000ff, #8000ff, #ff00ff, #ff0080, #ff0000)' }} />
          )}
          
          {characterState.expression === 'stressed' && (
            <div className="absolute inset-0 rounded-full animate-pulse bg-red-500/5 z-0" />
          )}
        </div>

        {/* 고급 파티클 효과 */}
        {renderParticles()}
      </div>

      {/* 고급 말풍선 메시지 (전환 애니메이션 포함) */}
      {showMessage && (
        <div className={cn(
          'mt-6 relative max-w-sm will-change-transform',
          isMessageTransitioning ? 'animate-speech-bubble-out' : 'animate-speech-bubble-in'
        )} 
        style={{ animationDelay: isMessageTransitioning ? '0s' : '0.3s' }}>
          <div className={cn(
            'bg-white rounded-2xl shadow-xl px-5 py-4 relative border-2 transition-all duration-700',
            // 혼잡도별 테두리 색상 (전환 상태 고려)
            (transitionState.isTransitioning && transitionState.previousState 
              ? transitionState.previousState.aura 
              : characterState.aura) === 'red' && 'border-red-200 bg-red-50/30',
            (transitionState.isTransitioning && transitionState.previousState 
              ? transitionState.previousState.aura 
              : characterState.aura) === 'orange' && 'border-orange-200 bg-orange-50/30',
            (transitionState.isTransitioning && transitionState.previousState 
              ? transitionState.previousState.aura 
              : characterState.aura) === 'green' && 'border-green-200 bg-green-50/30',
            (transitionState.isTransitioning && transitionState.previousState 
              ? transitionState.previousState.aura 
              : characterState.aura) === 'blue' && 'border-blue-200 bg-blue-50/30',
            (transitionState.isTransitioning && transitionState.previousState 
              ? transitionState.previousState.aura 
              : characterState.aura) === 'gray' && 'border-gray-200 bg-gray-50/30'
          )}>
            {/* 메시지 텍스트 */}
            <div className={cn(
              'text-gray-700 leading-relaxed text-center font-medium transition-all duration-500',
              size === 'sm' && 'text-xs',
              size === 'md' && 'text-sm',
              size === 'lg' && 'text-base',
              size === 'xl' && 'text-lg',
              // 혼잡도별 텍스트 색상
              characterState.aura === 'red' && 'text-red-800',
              characterState.aura === 'orange' && 'text-orange-800',
              characterState.aura === 'green' && 'text-green-800',
              characterState.aura === 'blue' && 'text-blue-800',
              characterState.aura === 'gray' && 'text-gray-600',
              // 전환 중 투명도 조절
              isMessageTransitioning && 'opacity-50'
            )}>
              {isMessageTransitioning && transitionState.previousState 
                ? transitionState.previousState.message 
                : characterState.message}
            </div>
            
            {/* 말풍선 꼬리 (더 부드럽게) */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className={cn(
                'w-0 h-0 border-l-6 border-r-6 border-t-8 border-transparent transition-colors duration-500',
                characterState.aura === 'red' && 'border-t-red-50',
                characterState.aura === 'orange' && 'border-t-orange-50',
                characterState.aura === 'green' && 'border-t-green-50',
                characterState.aura === 'blue' && 'border-t-blue-50',
                characterState.aura === 'gray' && 'border-t-gray-50',
                !characterState.aura && 'border-t-white'
              )} />
              <div className={cn(
                'absolute top-[-1px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-8 border-transparent transition-colors duration-500',
                characterState.aura === 'red' && 'border-t-red-200',
                characterState.aura === 'orange' && 'border-t-orange-200',
                characterState.aura === 'green' && 'border-t-green-200',
                characterState.aura === 'blue' && 'border-t-blue-200',
                characterState.aura === 'gray' && 'border-t-gray-200',
                !characterState.aura && 'border-t-gray-100'
              )} />
            </div>

            {/* 말풍선 내부 장식 효과 */}
            {characterState.expression === 'happy' && (
              <div className="absolute top-2 right-2 text-yellow-400 animate-pulse">✨</div>
            )}
            {characterState.expression === 'stressed' && (
              <div className="absolute top-2 right-2 text-red-400 animate-bounce">💦</div>
            )}
            {characterState.expression === 'worried' && (
              <div className="absolute top-2 right-2 text-orange-400 animate-pulse">😅</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterGuide;