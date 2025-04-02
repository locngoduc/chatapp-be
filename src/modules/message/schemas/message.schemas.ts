import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

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
