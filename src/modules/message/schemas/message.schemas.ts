import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

type Attachment = {
  url: string;
  size: number;
};

@Schema({ timestamps: true })
export class Message {
  @Prop()
  authorId: string;

  @Prop()
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
