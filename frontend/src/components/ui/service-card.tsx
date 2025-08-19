import * as React from "react"
import { Card, CardContent } from "./card"
import { cn } from "@/lib/utils"

interface ServiceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  icon: string
  description?: string
  available?: boolean
  onClick?: () => void
}

const ServiceCard = React.forwardRef<HTMLDivElement, ServiceCardProps>(
  ({ className, title, icon, description, available = true, onClick, ...props }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false);

    return (
      <Card
        ref={ref}
        className={cn(
          "cursor-pointer transition-all duration-300 group relative overflow-hidden",
          "hover:shadow-2xl hover:scale-105 hover:-translate-y-2",
          "bg-gradient-to-br from-white to-gray-50",
          !available && "opacity-60 cursor-not-allowed hover:scale-100 hover:translate-y-0",
          className
        )}
        onClick={available ? onClick : undefined}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {/* 배경 그라데이션 효과 */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300",
          available && "group-hover:opacity-10",
          title.includes('실시간') && "from-blue-400 to-blue-600",
          title.includes('예측') && "from-purple-400 to-purple-600",
          title.includes('비교') && "from-green-400 to-green-600",
          title.includes('기타') && "from-gray-400 to-gray-600"
        )} />
        
        <CardContent className="flex flex-col items-center justify-center p-8 text-center relative z-10">
          {/* 아이콘 */}
          <div className={cn(
            "text-5xl mb-4 transition-all duration-300",
            available && isHovered && "animate-bounce"
          )}>
            {icon}
          </div>
          
          {/* 제목 */}
          <h3 className={cn(
            "font-bold text-xl mb-3 transition-colors duration-300",
            available && "group-hover:text-primary"
          )}>
            {title}
          </h3>
          
          {/* 설명 */}
          {description && (
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              {description}
            </p>
          )}
          
          {/* 상태 표시 */}
          {!available ? (
            <div className="mt-2">
              <span className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-medium">
                🚧 준비 중
              </span>
            </div>
          ) : (
            <div className={cn(
              "mt-2 opacity-0 transition-opacity duration-300",
              "group-hover:opacity-100"
            )}>
              <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                ✨ 이용 가능
              </span>
            </div>
          )}
        </CardContent>
        
        {/* 호버 시 테두리 효과 */}
        <div className={cn(
          "absolute inset-0 border-2 border-transparent rounded-lg transition-colors duration-300",
          available && "group-hover:border-primary/20"
        )} />
      </Card>
    )
  }
)
ServiceCard.displayName = "ServiceCard"

export { ServiceCard }