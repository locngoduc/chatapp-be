import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateMessageRequestSchema = z.object({
  groupId: z.string().nonempty('Group ID is required'),
  content: z.string().nonempty('Content is required'),
});

export class CreateMessageRequestDto extends createZodDto(
  CreateMessageRequestSchema,
) {}
