import { BaseDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Notification extends BaseDocument {
  @Prop({
    required: true,
  })
  userId: string;

  @Prop({
    required: true,
  })
  message: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
