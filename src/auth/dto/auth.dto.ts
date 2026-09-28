import { Field, InputType, ObjectType, ID } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

@ObjectType()
export class UserType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  currency: string;

  @Field({ nullable: true })
  avatarUrl?: string;

  @Field()
  role: string;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class AuthPayload {
  @Field()
  accessToken: string;

  @Field(() => UserType)
  user: UserType;
}

@InputType()
export class RegisterInput {
  @Field()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @Field()
  @IsEmail({}, { message: 'Must be a valid email' })
  email: string;

  @Field()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @Field({ defaultValue: 'USD' })
  currency?: string;
}

@InputType()
export class LoginInput {
  @Field()
  @IsEmail({}, { message: 'Must be a valid email' })
  email: string;

  @Field()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
