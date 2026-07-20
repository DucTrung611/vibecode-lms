import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PaginatedResult } from '../types/paginated-result.type';

export interface SuccessEnvelope<T> {
  success: true;
  data: T;
  meta?: PaginatedResult<unknown>['meta'];
}

function isPaginatedResult(value: unknown): value is PaginatedResult<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'items' in value &&
    'meta' in value
  );
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  SuccessEnvelope<T>
> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<SuccessEnvelope<T>> {
    return next.handle().pipe(
      map((payload: T) => {
        if (isPaginatedResult(payload)) {
          return {
            success: true,
            data: payload.items,
            meta: payload.meta,
          } as SuccessEnvelope<T>;
        }
        return { success: true, data: payload };
      }),
    );
  }
}
