import { SuccessResponse } from './success-response-wrapper';

export class OffsetPaginationWrapper<T> extends SuccessResponse<T> {
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    nextPage?: number | null;
    prevPage?: number | null;
  };

  constructor(
    message: string,
    data: T,
    total: number,
    page: number,
    limit: number,
  ) {
    super(message, data);

    const totalPages = Math.ceil(total / limit);

    this.meta = {
      total,
      page,
      limit,
      totalPages,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
    };
  }
}
