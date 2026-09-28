import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TransactionService } from './transaction.service';
import {
  TransactionType,
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFilterInput,
  PaginationInput,
  PaginatedTransactions,
  TransactionStats,
} from './dto/transaction.dto';
import { GqlAuthGuard } from '../common/gql-auth.guard';
import { OptionalGqlAuthGuard } from '../common/optional-gql-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { User, UserDocument } from '../auth/user.schema';

@Resolver(() => TransactionType)
export class TransactionResolver {
  constructor(
    private transactionService: TransactionService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  private async resolveUserId(user?: UserDocument): Promise<string> {
    if (user && user._id) {
      return user._id.toString();
    }
  }

  @Query(() => PaginatedTransactions)
  @UseGuards(OptionalGqlAuthGuard)
  async transactions(
    @CurrentUser() user: UserDocument,
    @Args('filter', { nullable: true }) filter?: TransactionFilterInput,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<PaginatedTransactions> {
    const userId = await this.resolveUserId(user);
    return this.transactionService.findAll(userId, filter, pagination);
  }

  @Query(() => TransactionStats)
  @UseGuards(OptionalGqlAuthGuard)
  async transactionStats(@CurrentUser() user: UserDocument): Promise<TransactionStats> {
    const userId = await this.resolveUserId(user);
    return this.transactionService.getStats(userId);
  }

  // MUTATIONS REQUIRE LOGIN - ONLY AUTHENTICATED USERS HAVE ACCESS TO PUT/EDIT TRANSACTIONS
  @Mutation(() => TransactionType)
  @UseGuards(GqlAuthGuard)
  async createTransaction(
    @Args('input') input: CreateTransactionInput,
    @CurrentUser() user: UserDocument,
  ): Promise<TransactionType> {
    return this.transactionService.create(input, user._id.toString());
  }

  @Mutation(() => TransactionType)
  @UseGuards(GqlAuthGuard)
  async updateTransaction(
    @Args('input') input: UpdateTransactionInput,
    @CurrentUser() user: UserDocument,
  ): Promise<TransactionType> {
    return this.transactionService.update(input, user._id.toString());
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteTransaction(
    @Args('id') id: string,
    @CurrentUser() user: UserDocument,
  ): Promise<boolean> {
    return this.transactionService.delete(id, user._id.toString());
  }
}
