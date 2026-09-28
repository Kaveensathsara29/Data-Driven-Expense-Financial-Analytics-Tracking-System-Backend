import { Field, InputType, ObjectType, ID, Float } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

@ObjectType()
export class BudgetType {
  @Field(() => ID)
  id: string;

  @Field()
  category: string;

  @Field(() => Float)
  monthlyLimit: number;

  @Field(() => Float)
  currentSpent: number;

  @Field(() => Float)
  remaining: number;

  @Field(() => Float)
  percentage: number;

  @Field()
  status: string; // 'HEALTHY' | 'WARNING' | 'EXCEEDED'
}

@InputType()
export class SetBudgetInput {
  @Field()
  @IsNotEmpty()
  category: string;

  @Field(() => Float)
  @IsNumber()
  @Min(1)
  monthlyLimit: number;
}
