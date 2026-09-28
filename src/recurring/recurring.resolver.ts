import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RecurringService } from './recurring.service';
import { RecurringType, CreateRecurringInput } from './dto/recurring.dto';
import { GqlAuthGuard } from '../common/gql-auth.guard';
import { OptionalGqlAuthGuard } from '../common/optional-gql-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { User, UserDocument } from '../auth/user.schema';

@Resolver(() => RecurringType)
export class RecurringResolver {
  constructor(
    private recurringService: RecurringService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  private async resolveUserId(user?: UserDocument): Promise<string> {
    if (user && user._id) {
      return user._id.toString();
    }
  }

  @Query(() => [RecurringType])
  @UseGuards(OptionalGqlAuthGuard)
  async recurringTransactions(@CurrentUser() user: UserDocument): Promise<RecurringType[]> {
    const userId = await this.resolveUserId(user);
    return this.recurringService.findAll(userId);
  }

  // MUTATIONS REQUIRE LOGIN
  @Mutation(() => RecurringType)
  @UseGuards(GqlAuthGuard)
  async createRecurringTransaction(
    @Args('input') input: CreateRecurringInput,
    @CurrentUser() user: UserDocument,
  ): Promise<RecurringType> {
    return this.recurringService.create(input, user._id.toString());
  }

  @Mutation(() => RecurringType)
  @UseGuards(GqlAuthGuard)
  async toggleRecurringStatus(
    @Args('id') id: string,
    @CurrentUser() user: UserDocument,
  ): Promise<RecurringType> {
    return this.recurringService.toggleStatus(id, user._id.toString());
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteRecurringTransaction(
    @Args('id') id: string,
    @CurrentUser() user: UserDocument,
  ): Promise<boolean> {
    return this.recurringService.delete(id, user._id.toString());
  }
}
