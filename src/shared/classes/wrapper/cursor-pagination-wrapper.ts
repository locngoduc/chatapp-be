import { SuccessResponse } from './success-response-wrapper';

export class CursorPaginationWrapper<T> extends SuccessResponse<T> {
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
