export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}
