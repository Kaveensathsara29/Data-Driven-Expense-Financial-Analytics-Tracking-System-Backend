import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthPayload, LoginInput, RegisterInput, UserType } from './dto/auth.dto';
import { GqlAuthGuard } from '../common/gql-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { UserDocument } from './user.schema';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => AuthPayload)
  async register(@Args('input') input: RegisterInput): Promise<AuthPayload> {
    return this.authService.register(input);
  }

  @Mutation(() => AuthPayload)
  async login(@Args('input') input: LoginInput): Promise<AuthPayload> {
    return this.authService.login(input);
  }

  @Query(() => UserType)
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUser() user: UserDocument): Promise<UserType> {
    return this.authService.mapUser(user);
  }
}
