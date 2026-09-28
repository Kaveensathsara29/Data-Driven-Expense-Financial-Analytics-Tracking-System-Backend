import { Field, InputType, ObjectType, ID, Float } from '@nestjs/graphql';
import { IsNotEmpty, IsEnum, IsNumber, Min } from 'class-validator';

@ObjectType()
export class RecurringType {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field(() => Float)
  amount: number;

  @Field()
  type: string;

  @Field()
  category: string;

  @Field()
  frequency: string;

  @Field()
  nextDueDate: Date;

  @Field()
  paymentMethod: string;

  @Field()
  status: string;
}

@InputType()
export class CreateRecurringInput {
  @Field()
  @IsNotEmpty()
  title: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0.01)
  amount: number;

  @Field({ defaultValue: 'EXPENSE' })
  @IsEnum(['INCOME', 'EXPENSE'])
  type: string;

  @Field()
  @IsNotEmpty()
  category: string;

  @Field({ defaultValue: 'MONTHLY' })
  @IsEnum(['MONTHLY', 'YEARLY', 'WEEKLY'])
  frequency: string;

  @Field()
  nextDueDate: Date;

  @Field({ defaultValue: 'Credit Card' })
  paymentMethod: string;
}
