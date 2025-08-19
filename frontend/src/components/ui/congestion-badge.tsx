import * as React from "react"
import { Badge } from "./badge"
import { cn } from "@/lib/utils"

interface CongestionBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  level: string
  size?: "sm" | "md" | "lg"
}

const CongestionBadge = React.forwardRef<HTMLDivElement, CongestionBadgeProps>(
  ({ className, level, size = "md", ...props }, ref) => {
    // 혼잡도 레벨에 따른 variant 매핑
    const getVariant = (level: string) => {
      switch (level) {
        case '붐빔':
        case '매우붐빔':
          return 'congestion_busy'
        case '약간 붐빔':
        case '조금붐빔':
          return 'congestion_somewhat_busy'
        case '보통':
          return 'congestion_normal'
        case '여유':
        case '한산함':
          return 'congestion_relaxed'
        default:
          return 'congestion_unknown'
      }
    }

    // 혼잡도 레벨에 따른 이모지
    const getEmoji = (level: string) => {
      switch (level) {
        case '붐빔':
        case '매우붐빔':
          return '🔴'
        case '약간 붐빔':
        case '조금붐빔':
          return '🟠'
        case '보통':
          return '🟡'
        case '여유':
        case '한산함':
          return '🟢'
        default:
          return '⚪'
      }
    }

    const sizeClasses = {
      sm: "text-xs px-2 py-0.5",
      md: "text-sm px-2.5 py-0.5", 
      lg: "text-base px-3 py-1"
    }

    return (
      <Badge
        ref={ref}
        variant={getVariant(level)}
        className={cn(sizeClasses[size], className)}
        {...props}
      >
        <span className="mr-1">{getEmoji(level)}</span>
        {level}
      </Badge>
    )
  }
)
CongestionBadge.displayName = "CongestionBadge"

export { CongestionBadge }