import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, enum: ['INCOME', 'EXPENSE'], index: true })
  type: string;

  @Prop({ required: true, index: true })
  category: string;

  @Prop({ required: true, default: Date.now, index: true })
  date: Date;

  @Prop({ default: 'Credit Card' })
  paymentMethod: string;

  @Prop({ default: '' })
  notes: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: false })
  isRecurring: boolean;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
TransactionSchema.index({ userId: 1, date: -1 });
TransactionSchema.index({ userId: 1, type: 1, category: 1 });
