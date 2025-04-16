import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const AddUserRequestSchema = z.object({
  userId: z.string().nonempty('User ID is required'),
  // Might have role and other properties in the future
});

export class AddUserRequestDto extends createZodDto(AddUserRequestSchema) {}
