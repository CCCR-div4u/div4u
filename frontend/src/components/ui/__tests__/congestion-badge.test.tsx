import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CongestionBadge } from '../congestion-badge'

// Mock the utils
vi.mock('../../../lib/utils', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' ')
}))

describe('CongestionBadge', () => {
  it('renders crowded level correctly', () => {
    render(<CongestionBadge level="붐빔" />)
    
    expect(screen.getByText('붐빔')).toBeInTheDocument()
    const badge = screen.getByText('붐빔')
    expect(badge).toHaveClass('bg-red-500', 'text-white')
  })

  it('renders somewhat crowded level correctly', () => {
    render(<CongestionBadge level="약간 붐빔" />)
    
    expect(screen.getByText('약간 붐빔')).toBeInTheDocument()
    const badge = screen.getByText('약간 붐빔')
    expect(badge).toHaveClass('bg-orange-500', 'text-white')
  })

  it('renders normal level correctly', () => {
    render(<CongestionBadge level="보통" />)
    
    expect(screen.getByText('보통')).toBeInTheDocument()
    const badge = screen.getByText('보통')
    expect(badge).toHaveClass('bg-yellow-500', 'text-white')
  })

  it('renders relaxed level correctly', () => {
    render(<CongestionBadge level="여유" />)
    
    expect(screen.getByText('여유')).toBeInTheDocument()
    const badge = screen.getByText('여유')
    expect(badge).toHaveClass('bg-green-500', 'text-white')
  })

  it('renders unknown level correctly', () => {
    render(<CongestionBadge level="정보없음" />)
    
    expect(screen.getByText('정보없음')).toBeInTheDocument()
    const badge = screen.getByText('정보없음')
    expect(badge).toHaveClass('bg-gray-500', 'text-white')
  })

  it('applies different sizes correctly', () => {
    const { rerender } = render(<CongestionBadge level="보통" size="sm" />)
    
    let badge = screen.getByText('보통')
    expect(badge).toHaveClass('text-xs', 'px-2', 'py-0.5')
    
    rerender(<CongestionBadge level="보통" size="lg" />)
    badge = screen.getByText('보통')
    expect(badge).toHaveClass('text-base', 'px-3', 'py-1')
  })

  it('applies custom className', () => {
    render(<CongestionBadge level="보통" className="custom-class" />)
    
    const badge = screen.getByText('보통')
    expect(badge).toHaveClass('custom-class')
  })

  it('handles invalid level gracefully', () => {
    // @ts-ignore - Testing invalid input
    render(<CongestionBadge level="invalid" />)
    
    expect(screen.getByText('invalid')).toBeInTheDocument()
    const badge = screen.getByText('invalid')
    expect(badge).toHaveClass('bg-gray-500', 'text-white')
  })
})