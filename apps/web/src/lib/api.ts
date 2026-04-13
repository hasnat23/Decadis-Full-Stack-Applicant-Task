const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = {
  baseUrl: API_URL,

  async request<T>(path: string, options?: RequestInit): Promise<T> {
    const { headers, ...rest } = options ?? {};
    const res = await fetch(`${API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...headers },
      ...rest,
    });

    // 204 No Content
    if (res.status === 204) return undefined as T;

    const data = await res.json();

    if (!res.ok) {
      throw new ApiError(data.error || 'Something went wrong', res.status, data);
    }

    return data as T;
  },
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
