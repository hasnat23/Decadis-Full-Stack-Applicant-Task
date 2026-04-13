import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateUserPage } from '../pages/CreateUserPage';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

// Mock the API
const mockRequest = vi.fn();
vi.mock('../lib/api', () => ({
  api: {
    baseUrl: 'http://localhost:3001',
    request: (...args: unknown[]) => mockRequest(...args),
  },
  ApiError: class extends Error {
    status: number;
    data: unknown;
    constructor(message: string, status: number, data: unknown) {
      super(message);
      this.status = status;
      this.data = data;
    }
  },
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('CreateUserPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form fields', () => {
    renderWithProviders(<CreateUserPage />);

    expect(screen.getByText('Create New User')).toBeInTheDocument();
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByText('Create Item')).toBeInTheDocument();
    expect(screen.getByText('Delete Item')).toBeInTheDocument();
    expect(screen.getByText('View Item')).toBeInTheDocument();
    expect(screen.getByText('Move Item')).toBeInTheDocument();
  });

  it('shows validation errors on empty submit', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateUserPage />);

    await user.click(screen.getByRole('button', { name: 'Create User' }));

    await waitFor(() => {
      expect(screen.getByText('First name is required')).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    mockRequest.mockResolvedValueOnce({
      id: '123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      actions: ['create-item'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    renderWithProviders(<CreateUserPage />);

    await user.type(screen.getByLabelText('First Name'), 'John');
    await user.type(screen.getByLabelText('Last Name'), 'Doe');
    await user.type(screen.getByLabelText('Email'), 'john@example.com');
    await user.click(screen.getByText('Create Item'));
    await user.click(screen.getByRole('button', { name: 'Create User' }));

    await waitFor(() => {
      expect(mockRequest).toHaveBeenCalledWith('/user', expect.objectContaining({
        method: 'POST',
      }));
    });
  });
});
