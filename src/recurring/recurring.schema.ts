import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RecurringDocument = Recurring & Document;

@Schema({ timestamps: true })
export class Recurring {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, enum: ['INCOME', 'EXPENSE'], default: 'EXPENSE' })
  type: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true, enum: ['MONTHLY', 'YEARLY', 'WEEKLY'], default: 'MONTHLY' })
  frequency: string;

  @Prop({ required: true })
  nextDueDate: Date;

  @Prop({ default: 'Credit Card' })
  paymentMethod: string;

  @Prop({ required: true, enum: ['ACTIVE', 'PAUSED'], default: 'ACTIVE' })
  status: string;
}

export const RecurringSchema = SchemaFactory.createForClass(Recurring);
