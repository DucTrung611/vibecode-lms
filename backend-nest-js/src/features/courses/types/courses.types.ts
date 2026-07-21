export interface CourseListFilters {
  page: number;
  limit: number;
  sortBy: string;
  order: 'asc' | 'desc';
  status?: string;
  categoryId?: string;
  level?: string;
}
