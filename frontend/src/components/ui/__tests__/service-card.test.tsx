import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ServiceCard } from '../service-card'

// Mock the utils
vi.mock('../../../lib/utils', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' ')
}))

describe('ServiceCard', () => {
  const defaultProps = {
    title: '테스트 서비스',
    icon: '🧪',
    description: '테스트 설명입니다',
  }

  it('renders with required props', () => {
    render(<ServiceCard {...defaultProps} />)
    
    expect(screen.getByText('테스트 서비스')).toBeInTheDocument()
    expect(screen.getByText('🧪')).toBeInTheDocument()
    expect(screen.getByText('테스트 설명입니다')).toBeInTheDocument()
  })

  it('shows available status by default', () => {
    render(<ServiceCard {...defaultProps} />)
    
    expect(screen.getByText('✨ 이용 가능')).toBeInTheDocument()
  })

  it('shows unavailable status when available is false', () => {
    render(<ServiceCard {...defaultProps} available={false} />)
    
    expect(screen.getByText('🚧 준비 중')).toBeInTheDocument()
    expect(screen.queryByText('✨ 이용 가능')).not.toBeInTheDocument()
  })

  it('calls onClick when clicked and available', () => {
    const handleClick = vi.fn()
    render(<ServiceCard {...defaultProps} onClick={handleClick} />)
    
    fireEvent.click(screen.getByText('테스트 서비스'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when unavailable', () => {
    const handleClick = vi.fn()
    render(
      <ServiceCard 
        {...defaultProps} 
        available={false} 
        onClick={handleClick} 
      />
    )
    
    fireEvent.click(screen.getByText('테스트 서비스'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('applies correct cursor styles based on availability', () => {
    const { rerender } = render(<ServiceCard {...defaultProps} />)
    
    // Card 컴포넌트는 최상위 div에 cursor 클래스가 적용됨
    let cardElement = screen.getByText('테스트 서비스').closest('[class*="cursor"]')
    expect(cardElement).toHaveClass('cursor-pointer')
    
    rerender(<ServiceCard {...defaultProps} available={false} />)
    cardElement = screen.getByText('테스트 서비스').closest('[class*="cursor"]')
    expect(cardElement).toHaveClass('cursor-not-allowed')
  })

  it('renders without description', () => {
    render(<ServiceCard title="테스트" icon="🧪" />)
    
    expect(screen.getByText('테스트')).toBeInTheDocument()
    expect(screen.getByText('🧪')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<ServiceCard {...defaultProps} className="custom-class" />)
    
    // Card 컴포넌트의 최상위 요소에 custom-class가 적용됨
    const cardElement = screen.getByText('테스트 서비스').closest('[class*="custom-class"]')
    expect(cardElement).toHaveClass('custom-class')
  })
})