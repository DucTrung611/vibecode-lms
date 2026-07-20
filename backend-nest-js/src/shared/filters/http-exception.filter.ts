import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiException } from '../types/api-error-code.type';

const STATUS_TO_DEFAULT_CODE: Record<number, string> = {
  400: 'VALIDATION_001',
  401: 'AUTH_001',
  403: 'AUTH_003',
  404: 'COMMON_404',
  409: 'COMMON_409',
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof ApiException) {
      response.status(exception.httpStatus).json({
        success: false,
        error: {
          code: exception.code,
          message: exception.message,
          details: exception.details,
        },
      });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const message =
        typeof body === 'string'
          ? body
          : ((body as { message?: string | string[] }).message ??
            exception.message);
      const details =
        typeof body === 'object' && 'message' in body
          ? (body as { message?: string[] }).message
          : null;

      response.status(status).json({
        success: false,
        error: {
          code: STATUS_TO_DEFAULT_CODE[status] ?? 'COMMON_500',
          message: Array.isArray(message) ? message.join(', ') : message,
          details: Array.isArray(details) ? details : null,
        },
      });
      return;
    }

    this.logger.error(
      'Unhandled exception',
      exception instanceof Error ? exception.stack : String(exception),
    );
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'COMMON_500',
        message: 'Internal server error',
        details: null,
      },
    });
  }
}
