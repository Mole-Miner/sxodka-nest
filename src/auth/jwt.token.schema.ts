import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type JwtTokenDocument = JwtToken & Document;

@Schema()
export class JwtToken {
  @Prop({ type: Types.ObjectId, ref: 'user' })
  userId: string;

  @Prop({ required: true })
  refreshToken: string;
}

export const JwtTokenSchema = SchemaFactory.createForClass(JwtToken);