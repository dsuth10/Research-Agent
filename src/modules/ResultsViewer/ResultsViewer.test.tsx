import { render, screen, fireEvent } from '@testing-library/react';
import { ResultsViewer } from './index';
import { useAppStore } from '@/store/app-store';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Zustand store
vi.mock('@/store/app-store', async () => {
  const actual = await vi.importActual<any>('@/store/app-store');
  return {
    ...actual,
    useAppStore: vi.fn(),
  };
});

describe('ResultsViewer', () => {
  const mockResearch = {
    id: '1',
    title: 'Test Research',
    prompt: 'Prompt',
    status: 'completed',
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    result: {
      report: 'This is the report. [1]',
      thoughtProcess: 'Process',
      sources: [
        {
          id: 's1',
          title: 'Source 1',
          url: 'https://example.com',
          snippet: 'Snippet',
          citedAt: new Date().toISOString(),
        },
      ],
    },
    cost: { inputTokens: 100, outputTokens: 200, totalCost: 0.0123 },
  };

  beforeEach(() => {
    (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      currentResearch: mockResearch,
      setUI: vi.fn(),
      updateResearch: vi.fn(),
    });
  });

  it('renders tabs and report', () => {
    render(<ResultsViewer />);
    expect(screen.getByText('Report')).toBeInTheDocument();
    expect(screen.getByText('Thought Process')).toBeInTheDocument();
    expect(screen.getByText('Sources')).toBeInTheDocument();
    expect(screen.getByText('This is the report.')).toBeInTheDocument();
  });

  it('shows sources and cost', () => {
    render(<ResultsViewer />);
    fireEvent.click(screen.getByText('Sources'));
    expect(screen.getByText(/Source 1/)).toBeInTheDocument();
    expect(screen.getByText('Input Tokens:')).toBeInTheDocument();
    expect(screen.getByText('Output Tokens:')).toBeInTheDocument();
    expect(screen.getByText('Total Cost:')).toBeInTheDocument();
  });

  it('shows error and retry button', () => {
    (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      currentResearch: { ...mockResearch, status: 'error' },
      setUI: vi.fn(),
      updateResearch: vi.fn(),
    });
    render(<ResultsViewer />);
    expect(screen.getByText('An error occurred while running research.')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('shows export buttons', () => {
    render(<ResultsViewer />);
    expect(screen.getByText('Export Markdown')).toBeInTheDocument();
    expect(screen.getByText('Export PDF')).toBeInTheDocument();
    expect(screen.getByText('Export DOCX')).toBeInTheDocument();
  });
}); 