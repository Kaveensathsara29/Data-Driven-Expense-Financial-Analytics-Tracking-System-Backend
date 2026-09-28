import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['INCOME', 'EXPENSE'], default: 'EXPENSE' })
  type: string;

  @Prop({ default: 'tag' })
  icon: string;

  @Prop({ default: '#E11D48' })
  color: string;

  @Prop({ default: false })
  isDefault: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false, default: null })
  userId?: Types.ObjectId;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
