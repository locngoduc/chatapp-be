export class OffsetPaginationWrapper<T> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  nextPage?: number | null;
  prevPage?: number | null;
  result: T[];

  constructor(total: number, page: number, limit: number, result: T[]) {
    const totalPages = Math.ceil(total / limit);

    this.totalPages = totalPages;
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.result = result;
    this.nextPage = page < totalPages ? page + 1 : null;
    this.prevPage = page > 1 ? page - 1 : null;
  }
}
