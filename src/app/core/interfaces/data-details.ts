export interface DataDetails<T> {
  data: T[];
  count: number;
  currentPage: number;
  totalPages: number;
}