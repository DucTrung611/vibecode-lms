export interface ApiErrorPayload {
  code: string;
  message: string;
  details: unknown;
}

export class ApiException extends Error {
  constructor(
    public readonly httpStatus: number,
    public readonly code: string,
    message: string,
    public readonly details: unknown = null,
  ) {
    super(message);
  }
}
