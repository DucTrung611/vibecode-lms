export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface JwtAccessPayload {
  sub: string;
  email: string;
  role: string;
}

export interface JwtRefreshPayload {
  sub: string;
}
