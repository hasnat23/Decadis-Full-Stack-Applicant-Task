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

    if (!res.ok) {
      // Guard against non-JSON error responses (e.g. proxy timeouts, HTML 404)
      let data: Record<string, unknown>;
      try {
        data = await res.json();
      } catch {
        throw new ApiError(`Request failed with status ${res.status}`, res.status, null);
      }
      throw new ApiError((data.error as string) || 'Something went wrong', res.status, data);
    }

    return (await res.json()) as T;
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
