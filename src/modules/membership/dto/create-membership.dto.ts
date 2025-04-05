import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const CreateMembershipRequestSchema = z.object({
  userId: z.string().nonempty('User ID is required'),
  groupId: z.string().nonempty('Group ID is required'),
});

export class CreateMembershipRequestDto extends createZodDto(
  CreateMembershipRequestSchema,
) {}
