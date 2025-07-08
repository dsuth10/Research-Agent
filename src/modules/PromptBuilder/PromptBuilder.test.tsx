import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import PromptBuilder from './index';
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

// Mock fetchOpenRouterModels
vi.mock('@/services/openrouter-service', () => ({
  fetchOpenRouterModels: vi.fn(() => Promise.resolve([
    { id: 'o3-deep-research', name: 'O3 Deep Research' },
    { id: 'gpt-4.1', name: 'GPT-4.1' },
  ])),
}));

describe('PromptBuilder', () => {
  let addResearch: any, setCurrentResearch: any, setUI: any;
  beforeEach(() => {
    addResearch = vi.fn();
    setCurrentResearch = vi.fn();
    setUI = vi.fn();
    (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      addResearch,
      setCurrentResearch,
      setUI,
      settings: { researchModel: 'o3-deep-research', openrouterApiKey: 'test-key' },
    });
  });

  it('renders the first step and validates prompt input', () => {
    renderWithQueryClient(<PromptBuilder />);
    expect(screen.getByText('User Prompt *')).toBeInTheDocument();
    const textarea = screen.getByPlaceholderText('What do you want to research?');
    fireEvent.change(textarea, { target: { value: 'short' } });
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('User prompt is required (min 10 chars)')).toBeInTheDocument();
    fireEvent.change(textarea, { target: { value: 'A valid research prompt.' } });
    expect(textarea).toHaveValue('A valid research prompt.');
  });

  it('navigates steps and validates model and tokens', async () => {
    renderWithQueryClient(<PromptBuilder />);
    // Fill prompt and go to next step
    fireEvent.change(screen.getByPlaceholderText('What do you want to research?'), { target: { value: 'A valid research prompt.' } });
    fireEvent.click(screen.getByText('Next'));
    // Model step
    expect(screen.getByText('Model *')).toBeInTheDocument();
    // Try to go next without selecting model (should show error)
    fireEvent.change(screen.getByLabelText('Model *'), { target: { value: '' } });
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Model is required')).toBeInTheDocument();
    // Select model and set tokens
    fireEvent.change(screen.getByLabelText('Model *'), { target: { value: 'o3-deep-research' } });
    fireEvent.change(screen.getByLabelText('Max Output Tokens *'), { target: { value: '1500' } });
    expect(screen.getByLabelText('Max Output Tokens *')).toHaveValue(1500);
  });

  it('shows JSON preview and allows copying', async () => {
    renderWithQueryClient(<PromptBuilder />);
    // Wait for textarea to appear
    const textarea = await waitFor(() => screen.getByPlaceholderText('What do you want to research?'));
    fireEvent.change(textarea, { target: { value: 'A valid research prompt.' } });
    fireEvent.click(screen.getByText('Next'));
    fireEvent.change(screen.getByLabelText('Model *'), { target: { value: 'o3-deep-research' } });
    fireEvent.change(screen.getByLabelText('Max Output Tokens *'), { target: { value: '1500' } });
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Preview JSON')).toBeInTheDocument();
    // Simulate copy
    if (!navigator.clipboard) {
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: vi.fn() },
        writable: true,
      });
    } else {
      vi.spyOn(navigator.clipboard, 'writeText').mockImplementation(() => Promise.resolve());
    }
    fireEvent.click(screen.getByText('Copy'));
    await waitFor(() => expect(screen.getByText('Copied!')).toBeInTheDocument());
  });

  it('runs research when all steps are valid', async () => {
    renderWithQueryClient(<PromptBuilder />);
    // Wait for textarea to appear
    const textarea = await waitFor(() => screen.getByPlaceholderText('What do you want to research?'));
    fireEvent.change(textarea, { target: { value: 'A valid research prompt.' } });
    fireEvent.click(screen.getByText('Next'));
    fireEvent.change(screen.getByLabelText('Model *'), { target: { value: 'o3-deep-research' } });
    fireEvent.change(screen.getByLabelText('Max Output Tokens *'), { target: { value: '1500' } });
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next'));
    // Click Run
    fireEvent.click(screen.getByText('Run ▶'));
    await waitFor(() => expect(addResearch).toHaveBeenCalled());
    expect(setCurrentResearch).toHaveBeenCalled();
    expect(setUI).toHaveBeenCalledWith({ currentTab: 'research' });
  });
}); 