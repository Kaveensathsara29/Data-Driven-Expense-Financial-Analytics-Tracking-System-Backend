import { Field, InputType, ObjectType, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

@ObjectType()
export class CategoryType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  type: string;

  @Field()
  icon: string;

  @Field()
  color: string;

  @Field()
  isDefault: boolean;
}

@InputType()
export class CreateCategoryInput {
  @Field()
  @IsNotEmpty()
  name: string;

  @Field()
  @IsEnum(['INCOME', 'EXPENSE'])
  type: string;

  @Field({ defaultValue: 'tag' })
  @IsOptional()
  icon?: string;

  @Field({ defaultValue: '#E11D48' })
  @IsOptional()
  color?: string;
}
