import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const CreateGroupRequestSchema = z.object({
  groupName: z.string().nonempty('A group name is required'),
  logoImage: z.string().optional(),
});

export class CreateGroupRequestDto extends createZodDto(
  CreateGroupRequestSchema,
) {}
