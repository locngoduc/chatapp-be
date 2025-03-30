export class SuccessResponse<T> {
  message: string;
  data?: T;
  constructor(message: string, data?: T) {
    this.message = message;
    this.data = data;
  }
}

export class PaginationWrapper<T> extends SuccessResponse<T> {
  meta: {
    nextCursor: string;
    hasMore: boolean;
  };

  constructor(message: string, data: T, cursor: string, hasMore: boolean) {
    super(message, data);

    this.meta = {
      nextCursor: cursor,
      hasMore: hasMore,
    };
  }
}
