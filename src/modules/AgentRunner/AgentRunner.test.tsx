import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import AgentRunner from './index';
import { useAppStore } from '@/store/app-store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Helper to create a QueryClient for tests
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

function renderWithQueryClient(ui: React.ReactElement) {
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      {ui}
    </QueryClientProvider>
  );
}

// Mock Zustand store
vi.mock('@/store/app-store', async () => {
  const actual = await vi.importActual<any>('@/store/app-store');
  return {
    ...actual,
    useAppStore: vi.fn(),
  };
});

// Mock aiService
vi.mock('@/services/ai-service', () => ({
  aiService: {
    runDeepResearch: vi.fn(async () => ({
      responseId: 'resp-123',
      stream: {
        getReader: () => ({
          read: vi.fn()
            // First call: running, Second call: completed
            .mockResolvedValueOnce({ value: JSON.stringify({ status: 'running' }), done: false })
            .mockResolvedValueOnce({ value: JSON.stringify({ status: 'completed' }), done: false })
            .mockResolvedValue({ done: true }),
          cancel: vi.fn(),
        }),
      },
    })),
    createProgressStream: vi.fn(() => ({
      getReader: () => ({
        read: vi.fn().mockResolvedValue({ done: true }),
        cancel: vi.fn(),
      }),
    })),
    getResearchResult: vi.fn(async () => 'Final report'),
  },
}));

describe('AgentRunner', () => {
  let updateResearch: any, setUI: any;
  beforeEach(() => {
    updateResearch = vi.fn();
    setUI = vi.fn();
    (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      currentResearch: {
        id: '1',
        prompt: '{"userPrompt":"Test prompt","model":"o3-deep-research","maxTokens":1000}',
        status: 'pending',
        responseId: undefined,
        result: undefined,
      },
      updateResearch,
      setUI,
    });
  });

  it('renders prompt and idle state', () => {
    renderWithQueryClient(<AgentRunner />);
    expect(screen.getByText('Agent Runner')).toBeInTheDocument();
    expect(screen.getByText('Prompt:')).toBeInTheDocument();
    expect(screen.getByText(
      /\{"userPrompt":"Test prompt","model":"o3-deep-research","maxTokens":1000\}/
    )).toBeInTheDocument();
    expect(screen.getByText('Starting research...')).toBeInTheDocument();
  });

  it('shows progress and completes research', async () => {
    await act(async () => {
      renderWithQueryClient(<AgentRunner />);
    });
    await waitFor(() => expect(screen.getByText('Research complete!')).toBeInTheDocument());
    await waitFor(() => expect(updateResearch).toHaveBeenCalledWith('1', expect.objectContaining({ status: 'completed' })), { timeout: 2000 });
    await waitFor(() => expect(setUI).toHaveBeenCalledWith({ currentTab: 'results' }), { timeout: 2000 });
  });

  it('handles error and allows retry', async () => {
    // Simulate error in aiService
    const { aiService } = await import('@/services/ai-service');
    const spy = vi.spyOn(aiService, 'runDeepResearch').mockImplementationOnce(() => { throw new Error('API error'); });
    await act(async () => {
      renderWithQueryClient(<AgentRunner />);
    });
    await waitFor(() => expect(screen.getByText('API error')).toBeInTheDocument());
    // Click Retry
    fireEvent.click(screen.getByText('Retry'));
    expect(updateResearch).toHaveBeenCalledWith('1', { status: 'pending' });
    spy.mockRestore();
  });

  it('shows message if no research task is selected', () => {
    (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      currentResearch: null,
      updateResearch,
      setUI,
    });
    renderWithQueryClient(<AgentRunner />);
    expect(screen.getByText('No research task selected.')).toBeInTheDocument();
  });
}); 