import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CategoryService } from './category.service';
import { CategoryType, CreateCategoryInput } from './dto/category.dto';
import { GqlAuthGuard } from '../common/gql-auth.guard';
import { OptionalGqlAuthGuard } from '../common/optional-gql-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { User, UserDocument } from '../auth/user.schema';

@Resolver(() => CategoryType)
export class CategoryResolver {
  constructor(
    private categoryService: CategoryService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  private async resolveUserId(user?: UserDocument): Promise<string> {
    if (user && user._id) {
      return user._id.toString();
    }
  }

  @Query(() => [CategoryType])
  @UseGuards(OptionalGqlAuthGuard)
  async categories(@CurrentUser() user: UserDocument): Promise<CategoryType[]> {
    const userId = await this.resolveUserId(user);
    return this.categoryService.findAllForUser(userId);
  }

  @Mutation(() => CategoryType)
  @UseGuards(GqlAuthGuard)
  async createCategory(
    @Args('input') input: CreateCategoryInput,
    @CurrentUser() user: UserDocument,
  ): Promise<CategoryType> {
    return this.categoryService.create(input, user._id.toString());
  }
}
