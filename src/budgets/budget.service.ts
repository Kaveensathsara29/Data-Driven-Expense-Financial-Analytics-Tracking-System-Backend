import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Budget, BudgetDocument } from './budget.schema';
import { Transaction, TransactionDocument } from '../transactions/transaction.schema';
import { SetBudgetInput, BudgetType } from './dto/budget.dto';

@Injectable()
export class BudgetService {
  constructor(
    @InjectModel(Budget.name) private budgetModel: Model<BudgetDocument>,
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
  ) {}

  async setBudget(input: SetBudgetInput, userId: string): Promise<BudgetType> {
    const userObjectId = new Types.ObjectId(userId);

    const budget = await this.budgetModel.findOneAndUpdate(
      { userId: userObjectId, category: input.category },
      { monthlyLimit: input.monthlyLimit },
      { new: true, upsert: true },
    );

    const statusList = await this.getBudgets(userId);
    const found = statusList.find((b) => b.category === input.category);
    return found || this.mapDefault(budget);
  }

  async deleteBudget(id: string, userId: string): Promise<boolean> {
    const result = await this.budgetModel.deleteOne({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    });
    return result.deletedCount > 0;
  }

  async getBudgets(userId: string): Promise<BudgetType[]> {
    const userObjectId = new Types.ObjectId(userId);
    const budgets = await this.budgetModel.find({ userId: userObjectId }).sort({ category: 1 }).exec();

    // Calculate current month date range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Aggregate expenses for current month by category
    const spendAgg = await this.transactionModel.aggregate([
      {
        $match: {
          userId: userObjectId,
          type: 'EXPENSE',
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: '$category',
          totalSpent: { $sum: '$amount' },
        },
      },
    ]);

    const spendMap = new Map<string, number>();
    for (const item of spendAgg) {
      spendMap.set(item._id, item.totalSpent);
    }

    return budgets.map((b) => {
      const spent = spendMap.get(b.category) || 0;
      const remaining = Math.max(0, b.monthlyLimit - spent);
      const percentage = b.monthlyLimit > 0 ? Math.round((spent / b.monthlyLimit) * 1000) / 10 : 0;

      let status = 'HEALTHY';
      if (percentage >= 100) {
        status = 'EXCEEDED';
      } else if (percentage >= 75) {
        status = 'WARNING';
      }

      return {
        id: b._id.toString(),
        category: b.category,
        monthlyLimit: b.monthlyLimit,
        currentSpent: Math.round(spent * 100) / 100,
        remaining: Math.round(remaining * 100) / 100,
        percentage,
        status,
      };
    });
  }

  private mapDefault(b: BudgetDocument): BudgetType {
    return {
      id: b._id.toString(),
      category: b.category,
      monthlyLimit: b.monthlyLimit,
      currentSpent: 0,
      remaining: b.monthlyLimit,
      percentage: 0,
      status: 'HEALTHY',
    };
  }
}
