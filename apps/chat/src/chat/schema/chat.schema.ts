import { BaseDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Chat extends BaseDocument{
  @Prop({
    required: true,
  })
  userId: string;

  @Prop({
    required: true,
  })
  message: string;

  @Prop({ type: String, required: true })
  chatRoomId: string; 
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
