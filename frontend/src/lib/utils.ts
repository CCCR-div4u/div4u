import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 시간 포맷팅 유틸리티
export function formatTimeAgo(timestamp: string): string {
  const now = new Date()
  const time = new Date(timestamp)
  const diffMs = now.getTime() - time.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return '방금 전'
  if (diffMins < 60) return `${diffMins}분 전`
  if (diffHours < 24) return `${diffHours}시간 전`
  if (diffDays < 7) return `${diffDays}일 전`
  
  return time.toLocaleDateString('ko-KR')
}

// 혼잡도 레벨을 숫자로 변환
export function getCongestionScore(level: string): number {
  switch (level) {
    case '한산함':
    case '여유': return 1
    case '보통': return 2
    case '약간 붐빔':
    case '조금붐빔': return 3
    case '붐빔':
    case '매우붐빔': return 4
    default: return 0
  }
}

// 혼잡도 색상 정보 가져오기
export function getCongestionColor(level: string) {
  switch (level) {
    case '붐빔':
    case '매우붐빔':
      return {
        text: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
        badge: 'bg-red-500'
      }
    case '약간 붐빔':
    case '조금붐빔':
      return {
        text: 'text-orange-600',
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        badge: 'bg-orange-500'
      }
    case '보통':
      return {
        text: 'text-yellow-600',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        badge: 'bg-yellow-500'
      }
    case '여유':
    case '한산함':
      return {
        text: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200',
        badge: 'bg-green-500'
      }
    default:
      return {
        text: 'text-gray-600',
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        badge: 'bg-gray-500'
      }
  }
}