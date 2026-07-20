export interface RequestUser {
  id: string;
  email: string;
  role: string;
}

export interface AuthenticatedRequest {
  user: RequestUser;
}
