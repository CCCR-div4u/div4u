import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import CharacterGuide from '../CharacterGuide'

// Mock the utils
vi.mock('../../lib/utils', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' ')
}))

describe('CharacterGuide', () => {
  it('renders with default props', () => {
    render(<CharacterGuide />)
    
    const characterContainer = screen.getByRole('img', { name: /서울 혼잡도 서비스 캐릭터/i })
    expect(characterContainer).toBeInTheDocument()
  })

  it('displays correct message for different congestion levels', async () => {
    const { rerender } = render(
      <CharacterGuide congestionLevel="붐빔" showMessage={true} />
    )
    
    expect(screen.getByText(/정말 붐비네요/)).toBeInTheDocument()
    
    rerender(<CharacterGuide congestionLevel="여유" showMessage={true} />)
    await waitFor(() => {
      expect(screen.getByText(/여유로워요! 🎉/)).toBeInTheDocument()
    })
    
    rerender(<CharacterGuide congestionLevel="보통" showMessage={true} />)
    await waitFor(() => {
      expect(screen.getByText(/적당한 수준이에요/)).toBeInTheDocument()
    })
    
    rerender(<CharacterGuide congestionLevel="약간 붐빔" showMessage={true} />)
    await waitFor(() => {
      expect(screen.getByText(/조금 붐비고 있어요/)).toBeInTheDocument()
    })
  })

  it('applies correct size classes', () => {
    const { rerender } = render(<CharacterGuide size="sm" />)
    expect(document.querySelector('.w-16')).toBeInTheDocument()
    
    rerender(<CharacterGuide size="lg" />)
    expect(document.querySelector('.w-32')).toBeInTheDocument()
    
    rerender(<CharacterGuide size="xl" />)
    expect(document.querySelector('.w-40')).toBeInTheDocument()
  })

  it('shows/hides message based on showMessage prop', () => {
    const { rerender } = render(
      <CharacterGuide showMessage={true} congestionLevel="보통" />
    )
    
    expect(screen.getByText(/적당한 수준이에요/)).toBeInTheDocument()
    
    rerender(<CharacterGuide showMessage={false} congestionLevel="보통" />)
    expect(screen.queryByText(/적당한 수준이에요/)).not.toBeInTheDocument()
  })

  it('includes location in message when provided', () => {
    render(
      <CharacterGuide 
        congestionLevel="보통" 
        location="홍대입구역" 
        showMessage={true} 
      />
    )
    
    expect(screen.getByText(/홍대입구역은\(는\)/)).toBeInTheDocument()
  })

  it('uses custom message when provided', () => {
    const customMessage = "커스텀 테스트 메시지입니다"
    render(
      <CharacterGuide 
        message={customMessage}
        showMessage={true} 
      />
    )
    
    expect(screen.getByText(customMessage)).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const customClass = "test-custom-class"
    render(<CharacterGuide className={customClass} />)
    
    expect(document.querySelector(`.${customClass}`)).toBeInTheDocument()
  })
})