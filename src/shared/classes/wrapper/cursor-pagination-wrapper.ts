export class CursorPaginationWrapper<T> {
  nextCursor: string;
  hasMore: boolean;
  result: T[];

  constructor(cursor: string, hasMore: boolean, data: T[]) {
    this.nextCursor = cursor;
    this.hasMore = hasMore;
    this.result = data;
  }
}
