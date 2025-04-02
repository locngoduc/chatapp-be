import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { z } from 'zod';

type Attachment = {
  url: string;
  size: number;
};

@Schema({
  timestamps: {
    createdAt: 'create_at',
    updatedAt: 'updated_at',
  },
  collection: 'messages',
})
export class Message {
  @Prop({
    name: 'author_id',
  })
  authorId: string;

  @Prop({
    name: 'group_id',
  })
  groupId: string;

  @Prop()
  content: string;

  @Prop({ type: [Object] })
  attachments?: Attachment[];
}

export type MessageDocument = HydratedDocument<Message> & {
  createdAt: Date;
  updatedAt: Date;
};
export const MessageSchema = SchemaFactory.createForClass(Message);

export const MessageZodSchema = z.object({
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
    .default(() => new Date())
    .transform((date) => date.toISOString()),
  updatedAt: z
    .date()
    .optional()
    .default(() => new Date())
    .transform((date) => date.toISOString()),
});
