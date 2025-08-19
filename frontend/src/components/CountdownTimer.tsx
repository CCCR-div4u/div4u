import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownTimerProps {
  targetDate: Date;
  onComplete?: () => void;
  size?: 'sm' | 'md' | 'lg';
  theme?: 'default' | 'gradient' | 'minimal';
  className?: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  onComplete,
  size = 'md',
  theme = 'default',
  className
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } else {
        setIsComplete(true);
        onComplete?.();
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onComplete]);

  const sizeClasses = {
    sm: {
      container: 'gap-2',
      number: 'text-lg md:text-xl',
      label: 'text-xs',
      box: 'p-2'
    },
    md: {
      container: 'gap-4',
      number: 'text-2xl md:text-3xl',
      label: 'text-sm',
      box: 'p-4'
    },
    lg: {
      container: 'gap-6',
      number: 'text-3xl md:text-4xl',
      label: 'text-base',
      box: 'p-6'
    }
  };

  const themeClasses = {
    default: [
      'bg-blue-500 text-white',
      'bg-purple-500 text-white',
      'bg-pink-500 text-white',
      'bg-indigo-500 text-white'
    ],
    gradient: [
      'bg-gradient-to-br from-blue-400 to-blue-600 text-white',
      'bg-gradient-to-br from-purple-400 to-purple-600 text-white',
      'bg-gradient-to-br from-pink-400 to-pink-600 text-white',
      'bg-gradient-to-br from-indigo-400 to-indigo-600 text-white'
    ],
    minimal: [
      'bg-gray-100 text-gray-800 border border-gray-300',
      'bg-gray-100 text-gray-800 border border-gray-300',
      'bg-gray-100 text-gray-800 border border-gray-300',
      'bg-gray-100 text-gray-800 border border-gray-300'
    ]
  };

  const timeUnits = [
    { value: timeLeft.days, label: '일', key: 'days' },
    { value: timeLeft.hours, label: '시간', key: 'hours' },
    { value: timeLeft.minutes, label: '분', key: 'minutes' },
    { value: timeLeft.seconds, label: '초', key: 'seconds' }
  ];

  if (isComplete) {
    return (
      <div className={cn('text-center', className)}>
        <div className="text-4xl mb-4">🎉</div>
        <div className="text-2xl font-bold text-green-600">출시되었습니다!</div>
        <div className="text-gray-600 mt-2">새로운 서비스를 이용해보세요!</div>
      </div>
    );
  }

  return (
    <div className={cn('text-center', className)}>
      <div className={cn('grid grid-cols-4', sizeClasses[size].container)}>
        {timeUnits.map((unit, index) => (
          <div
            key={unit.key}
            className={cn(
              'rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105',
              themeClasses[theme][index],
              sizeClasses[size].box
            )}
          >
            <div className={cn('font-bold', sizeClasses[size].number)}>
              {unit.value.toString().padStart(2, '0')}
            </div>
            <div className={cn('opacity-90', sizeClasses[size].label)}>
              {unit.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountdownTimer;