import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('App', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('renders the main title', () => {
    mockFetch.mockResolvedValueOnce({
      text: () => Promise.resolve('# Test README\n\nThis is a test.')
    })

    render(<App />)

    expect(screen.getByText('🏔️ Fjell Registry')).toBeInTheDocument()
  })

  it('renders the subtitle', () => {
    mockFetch.mockResolvedValueOnce({
      text: () => Promise.resolve('# Test README\n\nThis is a test.')
    })

    render(<App />)

    expect(screen.getByText('Common Registry for Fjell - A powerful TypeScript registry system')).toBeInTheDocument()
  })

  it('shows loading state initially', () => {
    mockFetch.mockImplementationOnce(() => new Promise(() => { })) // Never resolves

    render(<App />)

    expect(screen.getByText('Loading documentation...')).toBeInTheDocument()
  })

  it('shows error message when fetch fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'))

    render(<App />)

    // Wait for the error state
    await screen.findByText(/Error loading documentation/)
  })
})
