import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { z } from 'zod';

type Attachment = {
  url: string;
  size: number;
};

@Schema({
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

  @Prop()
  attachments?: string[];

  @Prop({
    name: 'created_at',
    default: () => new Date(),
  })
  createdAt: Date;

  @Prop({
    name: 'updated_at',
    default: () => new Date(),
  })
  updatedAt: Date;
}

export type MessageDocument = HydratedDocument<Message> & {
  createdAt: Date;
  updatedAt: Date;
};
export const MessageSchema = SchemaFactory.createForClass(Message);
