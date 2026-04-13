import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { App } from '../App';

// Mock the API module
vi.mock('../lib/api', () => ({
  api: {
    baseUrl: 'http://localhost:3001',
    request: vi.fn(),
  },
  ApiError: class ApiError extends Error {
    status: number;
    data: unknown;
    constructor(message: string, status: number, data: unknown) {
      super(message);
      this.status = status;
      this.data = data;
    }
  },
}));

describe('App routing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the layout with navigation', () => {
    render(
      <MemoryRouter initialEntries={['/users']}>
        <QueryClientProvider
          client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
        >
          <App />
        </QueryClientProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText(/UserHub/)).toBeInTheDocument();
    expect(screen.getByText('All Users')).toBeInTheDocument();
    expect(screen.getByText('+ New User')).toBeInTheDocument();
  });

  it('navigates to create user page', () => {
    render(
      <MemoryRouter initialEntries={['/users/new']}>
        <QueryClientProvider
          client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
        >
          <App />
        </QueryClientProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText('Create New User')).toBeInTheDocument();
  });

  it('shows 404 for unknown routes', () => {
    render(
      <MemoryRouter initialEntries={['/something-random']}>
        <QueryClientProvider
          client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
        >
          <App />
        </QueryClientProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page not found')).toBeInTheDocument();
  });
});
