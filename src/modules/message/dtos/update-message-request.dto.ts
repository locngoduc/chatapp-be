import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const UpdateMessageRequestSchema = z.object({
  content: z.string().nonempty('Content is required'),
});

export class UpdateMessageRequestDto extends createZodDto(
  UpdateMessageRequestSchema,
) {}
