import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BudgetService } from './budget.service';
import { BudgetType, SetBudgetInput } from './dto/budget.dto';
import { GqlAuthGuard } from '../common/gql-auth.guard';
import { OptionalGqlAuthGuard } from '../common/optional-gql-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { User, UserDocument } from '../auth/user.schema';

@Resolver(() => BudgetType)
export class BudgetResolver {
  constructor(
    private budgetService: BudgetService,
    @InjectModel(User.name) userModel:Model<UserDocument>
  ) {}

  private async resolveUserId(user?: UserDocument): Promise<string> {
    if (user && user._id) {
      return user._id.toString();
    }
  }

  @Query(() => [BudgetType])
  @UseGuards(OptionalGqlAuthGuard)
  async budgets(@CurrentUser() user: UserDocument): Promise<BudgetType[]> {
    const userId = await this.resolveUserId(user);
    return this.budgetService.getBudgets(userId);
  }

  // MUTATIONS REQUIRE LOGIN
  @Mutation(() => BudgetType)
  @UseGuards(GqlAuthGuard)
  async setBudget(
    @Args('input') input: SetBudgetInput,
    @CurrentUser() user: UserDocument,
  ): Promise<BudgetType> {
    return this.budgetService.setBudget(input, user._id.toString());
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteBudget(
    @Args('id') id: string,
    @CurrentUser() user: UserDocument,
  ): Promise<boolean> {
    return this.budgetService.deleteBudget(id, user._id.toString());
  }
}
