export class SuccessResponse<T> {
  message: string;

  data: T;

  constructor(message: string, data?: any) {
    this.message = message;
    this.data = data;
  }
}
