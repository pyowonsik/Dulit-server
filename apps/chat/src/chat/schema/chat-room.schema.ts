import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Chat, ChatSchema } from './chat.schema';
import { BaseDocument } from '@app/common';

@Schema()
export class ChatRoom extends BaseDocument {
  @Prop({
    required: true,
  })
  user1Id: string;

  @Prop({
    required: true,
  })
  user2Id: string;

  @Prop({
    required: true,
  })
  coupleId: string;

  // 같은 마이크로 서비스에 있기 때문에 참조 가능하므로 자식쪽에서만 부모 id값 들고 있으면 됨.
  // 특히 msa 같은 경우 느슨한 결합 (Loose Coupling)을 강조 하는 것으로 보임.

  // @Prop({ type: [String], required: true })
  // chatIds: string[];
}

export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);
