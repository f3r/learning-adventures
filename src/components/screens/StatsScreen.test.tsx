import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { StatsScreen } from './StatsScreen'
import * as storage from '../../utils/storage'

vi.mock('../../utils/storage', async () => {
  const actual = await vi.importActual('../../utils/storage')
  return {
    ...actual,
    getPerformance: vi.fn(),
  }
})

const mockGetPerformance = vi.mocked(storage.getPerformance)

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('StatsScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetPerformance.mockReturnValue({})
  })

  it('renders 12x12 grid with headers', () => {
    render(<MemoryRouter><StatsScreen /></MemoryRouter>)

    expect(screen.getByText('Times Table Stats')).toBeInTheDocument()
    expect(screen.getByRole('grid')).toBeInTheDocument()

    const columnHeaders = screen.getAllByRole('columnheader')
    expect(columnHeaders).toHaveLength(12)

    const rowHeaders = screen.getAllByRole('rowheader')
    expect(rowHeaders).toHaveLength(12)
  })

  it('renders 144 grid cells', () => {
    render(<MemoryRouter><StatsScreen /></MemoryRouter>)

    const cells = screen.getAllByRole('gridcell')
    expect(cells).toHaveLength(144)
  })

  it('shows dash for unseen pairs', () => {
    render(<MemoryRouter><StatsScreen /></MemoryRouter>)

    const cells = screen.getAllByRole('gridcell')
    const unseenCell = cells[0]
    expect(unseenCell).toHaveTextContent('—')
    expect(unseenCell).toHaveClass('bg-white/5')
  })

  it('shows green for pairs with >= 75% correct rate', () => {
    mockGetPerformance.mockReturnValue({
      '3x4': { correct: 8, incorrect: 2, lastSeen: Date.now() },
    })

    render(<MemoryRouter><StatsScreen /></MemoryRouter>)

    const cell = screen.getByLabelText('3 times 4: 8 of 10 correct')
    expect(cell).toHaveTextContent('8/10')
    expect(cell).toHaveClass('bg-emerald-500/80')
  })

  it('shows red for pairs with < 75% correct rate', () => {
    mockGetPerformance.mockReturnValue({
      '2x5': { correct: 1, incorrect: 3, lastSeen: Date.now() },
    })

    render(<MemoryRouter><StatsScreen /></MemoryRouter>)

    const cell = screen.getByLabelText('2 times 5: 1 of 4 correct')
    expect(cell).toHaveTextContent('1/4')
    expect(cell).toHaveClass('bg-rose-500/80')
  })

  it('shows symmetric data for both orderings of a pair', () => {
    mockGetPerformance.mockReturnValue({
      '3x7': { correct: 5, incorrect: 1, lastSeen: Date.now() },
    })

    render(<MemoryRouter><StatsScreen /></MemoryRouter>)

    const cell3x7 = screen.getByLabelText('3 times 7: 5 of 6 correct')
    const cell7x3 = screen.getByLabelText('7 times 3: 5 of 6 correct')
    expect(cell3x7).toHaveTextContent('5/6')
    expect(cell7x3).toHaveTextContent('5/6')
  })

  it('navigates to home when Back button is clicked', async () => {
    render(<MemoryRouter><StatsScreen /></MemoryRouter>)

    const backButton = screen.getByText('Back')
    await userEvent.click(backButton)

    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('renders legend with color indicators', () => {
    render(<MemoryRouter><StatsScreen /></MemoryRouter>)

    expect(screen.getByText('mastered')).toBeInTheDocument()
    expect(screen.getByText('needs work')).toBeInTheDocument()
    expect(screen.getByText('unseen')).toBeInTheDocument()
  })
})
