import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const RabbitMQMessageSchema = z.object({
  messageId: z.string().nonempty('Message is required'),
  targetIds: z.array(z.string()).nonempty('Target IDs are required'),
});

export class RabbitMQMessageDto extends createZodDto(RabbitMQMessageSchema) {}
