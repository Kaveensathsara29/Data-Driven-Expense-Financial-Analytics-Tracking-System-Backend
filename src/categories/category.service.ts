import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument } from './category.schema';
import { CreateCategoryInput, CategoryType } from './dto/category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async findAllForUser(userId: string): Promise<CategoryType[]> {
    const categories = await this.categoryModel
      .find({
        $or: [{ isDefault: true }, { userId: new Types.ObjectId(userId) }],
      })
      .sort({ name: 1 })
      .exec();

    return categories.map((c) => this.mapCategory(c));
  }

  async create(input: CreateCategoryInput, userId: string): Promise<CategoryType> {
    const created = new this.categoryModel({
      ...input,
      userId: new Types.ObjectId(userId),
      isDefault: false,
    });
    const saved = await created.save();
    return this.mapCategory(saved);
  }

  mapCategory(cat: CategoryDocument): CategoryType {
    return {
      id: cat._id.toString(),
      name: cat.name,
      type: cat.type,
      icon: cat.icon || 'tag',
      color: cat.color || '#E11D48',
      isDefault: !!cat.isDefault,
    };
  }
}
