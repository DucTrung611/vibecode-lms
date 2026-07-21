export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorPayload {
  success: false;
  error: {
    code: string;
    message: string;
    details: unknown;
  };
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
