export class CursorPaginationWrapper<T> {
  meta: {
    nextCursor: string;
    hasMore: boolean;
    result: T[];
  };

  constructor(cursor: string, hasMore: boolean, data: T[]) {
    this.meta = {
      nextCursor: cursor,
      hasMore: hasMore,
      result: data,
    };
  }
}
