import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, versionKey: false }) 
export class BaseDocument extends Document {
  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ select: false, default: 1 })  
  version: number;
}
