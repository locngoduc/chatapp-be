import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateMessageRequestSchema = z.object({
  authorId: z.string().nonempty('Author ID is required'),
  groupId: z.string().nonempty('Group ID is required'),
  content: z.string().nonempty('Content is required'),
  attachments: z
    .array(
      z.object({
        url: z.string().url('Invalid URL').nonempty('URL is required'),
        size: z.number().positive('Size must be a positive number'),
      }),
    )
    .optional(),
  createdAt: z
    .date()
    .optional()
    .default(() => new Date()),
});

export class CreateMessageRequestDto extends createZodDto(
  CreateMessageRequestSchema,
) {}
