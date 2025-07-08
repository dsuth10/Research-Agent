import { render, screen, act } from '@testing-library/react';
import { ResultsViewer } from './index';
import { useAppStore } from '@/store/app-store';
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@/store/app-store', async () => {
  const actual = await vi.importActual<any>('@/store/app-store');
  let currentResearch: any = null;
  let listeners: Function[] = [];
  return {
    ...actual,
    useAppStore: vi.fn(() => ({
      get currentResearch() { return currentResearch; },
      set currentResearch(val: any) { currentResearch = val; listeners.forEach(fn => fn()); },
      setUI: vi.fn(),
      updateResearch: (id: string, updates: any) => {
        currentResearch = { ...currentResearch, ...updates };
        listeners.forEach(fn => fn());
      },
      subscribe: (fn: Function) => { listeners.push(fn); return () => { listeners = listeners.filter(f => f !== fn); }; },
    })),
  };
});

describe('ResultsViewer integration', () => {
  let mockResearch: any;
  beforeEach(() => {
    mockResearch = {
      id: '1',
      title: 'Test Research',
      prompt: 'Prompt',
      status: 'running',
      createdAt: new Date().toISOString(),
      result: {
        report: 'Initial report',
        thoughtProcess: '',
        sources: [],
      },
      cost: { inputTokens: 0, outputTokens: 0, totalCost: 0 },
    };
    (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      currentResearch: mockResearch,
      setUI: vi.fn(),
      updateResearch: vi.fn(),
      subscribe: vi.fn(),
    });
  });

  it('updates ResultsViewer when research result changes', async () => {
    render(<ResultsViewer />);
    expect(screen.getByText('Initial report')).toBeInTheDocument();
    // Simulate AgentRunner updating result
    act(() => {
      (useAppStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        currentResearch: {
          ...mockResearch,
          status: 'completed',
          result: { ...mockResearch.result, report: 'Updated report' },
        },
        setUI: vi.fn(),
        updateResearch: vi.fn(),
        subscribe: vi.fn(),
      });
    });
    // Rerender
    render(<ResultsViewer />);
    expect(screen.getByText('Updated report')).toBeInTheDocument();
  });
}); 