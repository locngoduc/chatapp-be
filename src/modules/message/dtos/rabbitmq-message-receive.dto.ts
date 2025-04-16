import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const RabbitMQMessageSchema = z.object({
  messageId: z.string().nonempty('Message is required'),
  targetIds: z.array(z.string()).nonempty('Target IDs are required'),
  messageType: z.enum(['create', 'update', 'delete']),
});

export class RabbitMQMessageDto extends createZodDto(RabbitMQMessageSchema) {}
