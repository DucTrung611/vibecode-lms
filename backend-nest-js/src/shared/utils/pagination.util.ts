export interface PageQuery {
  page?: number;
  limit?: number;
}

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

export function normalizePagination(query: PageQuery) {
  const page = query.page && query.page > 0 ? query.page : DEFAULT_PAGE;
  const limit = query.limit ? Math.min(query.limit, MAX_LIMIT) : DEFAULT_LIMIT;
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}
