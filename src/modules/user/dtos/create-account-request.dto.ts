import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const createAccountRequestSchema = z.object({
  email: z.string().email('An email is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(64, 'Password must not exceed 64 characters'),
  firstName: z.string().nonempty('First name is required'),
  lastName: z.string().nonempty('Last name is required'),
  middleName: z.string().optional(),
});

export class CreateAccountRequestDto extends createZodDto(
  createAccountRequestSchema,
) {}
