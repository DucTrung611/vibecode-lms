import { AxiosError } from 'axios';
import { describe, expect, it } from 'vitest';
import { getErrorMessage } from '../get-error-message';

describe('getErrorMessage', () => {
  it('returns the API error message when present on an AxiosError', () => {
    const error = new AxiosError('Request failed');
    error.response = {
      data: { success: false, error: { code: 'AUTH_005', message: 'Invalid email or password', details: null } },
      status: 401,
      statusText: 'Unauthorized',
      headers: {},
      config: error.config!,
    };

    expect(getErrorMessage(error)).toBe('Invalid email or password');
  });

  it('falls back to the default message when the AxiosError has no response', () => {
    const error = new AxiosError('Network Error');

    expect(getErrorMessage(error)).toBe(
      'Something went wrong. Please try again.',
    );
  });

  it('uses a custom fallback when provided', () => {
    const error = new AxiosError('Network Error');

    expect(getErrorMessage(error, 'Could not log in')).toBe('Could not log in');
  });

  it('falls back for non-Axios errors', () => {
    expect(getErrorMessage(new Error('boom'))).toBe(
      'Something went wrong. Please try again.',
    );
    expect(getErrorMessage('a string')).toBe(
      'Something went wrong. Please try again.',
    );
  });
});
