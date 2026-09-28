import { Field, InputType, ObjectType, ID, Float, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsEnum, IsNumber, Min, IsOptional } from 'class-validator';

@ObjectType()
export class TransactionType {
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
  date: Date;

  @Field()
  paymentMethod: string;

  @Field({ nullable: true })
  notes?: string;

  @Field(() => [String])
  tags: string[];

  @Field()
  isRecurring: boolean;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class PaginatedTransactions {
  @Field(() => [TransactionType])
  items: TransactionType[];

  @Field(() => Int)
  totalCount: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Int)
  currentPage: number;
}

@ObjectType()
export class CategorySpendBreakdown {
  @Field()
  category: string;

  @Field(() => Float)
  totalAmount: number;

  @Field(() => Int)
  count: number;

  @Field(() => Float)
  percentage: number;
}

@ObjectType()
export class MonthlyTrend {
  @Field()
  month: string; // e.g. "2026-03" or "Mar 2026"

  @Field(() => Float)
  income: number;

  @Field(() => Float)
  expense: number;

  @Field(() => Float)
  netSavings: number;
}

@ObjectType()
export class TransactionStats {
  @Field(() => Float)
  totalIncome: number;

  @Field(() => Float)
  totalExpense: number;

  @Field(() => Float)
  netBalance: number;

  @Field(() => Float)
  savingsRate: number; // percentage

  @Field(() => Float)
  monthlyBurnRate: number;

  @Field(() => [CategorySpendBreakdown])
  categoryBreakdown: CategorySpendBreakdown[];

  @Field(() => [MonthlyTrend])
  monthlyTrends: MonthlyTrend[];
}

@InputType()
export class CreateTransactionInput {
  @Field()
  @IsNotEmpty()
  title: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0.01)
  amount: number;

  @Field()
  @IsEnum(['INCOME', 'EXPENSE'])
  type: string;

  @Field()
  @IsNotEmpty()
  category: string;

  @Field()
  date: Date;

  @Field({ defaultValue: 'Credit Card' })
  @IsOptional()
  paymentMethod?: string;

  @Field({ defaultValue: '' })
  @IsOptional()
  notes?: string;

  @Field(() => [String], { defaultValue: [] })
  @IsOptional()
  tags?: string[];

  @Field({ defaultValue: false })
  @IsOptional()
  isRecurring?: boolean;
}

@InputType()
export class UpdateTransactionInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  title?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @Min(0.01)
  amount?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(['INCOME', 'EXPENSE'])
  type?: string;

  @Field({ nullable: true })
  @IsOptional()
  category?: string;

  @Field({ nullable: true })
  @IsOptional()
  date?: Date;

  @Field({ nullable: true })
  @IsOptional()
  paymentMethod?: string;

  @Field({ nullable: true })
  @IsOptional()
  notes?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  tags?: string[];
}

@InputType()
export class TransactionFilterInput {
  @Field({ nullable: true })
  search?: string;

  @Field({ nullable: true })
  type?: string; // INCOME or EXPENSE

  @Field({ nullable: true })
  category?: string;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field({ nullable: true })
  paymentMethod?: string;
}

@InputType()
export class PaginationInput {
  @Field(() => Int, { defaultValue: 1 })
  page: number;

  @Field(() => Int, { defaultValue: 15 })
  limit: number;
}
