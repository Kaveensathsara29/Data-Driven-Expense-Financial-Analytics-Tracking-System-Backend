import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Transaction, TransactionDocument } from './transaction.schema';
import {
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFilterInput,
  PaginationInput,
  PaginatedTransactions,
  TransactionType,
  TransactionStats,
  CategorySpendBreakdown,
  MonthlyTrend,
} from './dto/transaction.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
  ) {}

  async create(input: CreateTransactionInput, userId: string): Promise<TransactionType> {
    const tx = new this.transactionModel({
      ...input,
      userId: new Types.ObjectId(userId),
    });
    const saved = await tx.save();
    return this.mapTransaction(saved);
  }

  async update(input: UpdateTransactionInput, userId: string): Promise<TransactionType> {
    const tx = await this.transactionModel.findOne({
      _id: new Types.ObjectId(input.id),
      userId: new Types.ObjectId(userId),
    });

    if (!tx) {
      throw new NotFoundException('Transaction not found or unauthorized.');
    }

    if (input.title !== undefined) tx.title = input.title;
    if (input.amount !== undefined) tx.amount = input.amount;
    if (input.type !== undefined) tx.type = input.type;
    if (input.category !== undefined) tx.category = input.category;
    if (input.date !== undefined) tx.date = input.date;
    if (input.paymentMethod !== undefined) tx.paymentMethod = input.paymentMethod;
    if (input.notes !== undefined) tx.notes = input.notes;
    if (input.tags !== undefined) tx.tags = input.tags;

    const updated = await tx.save();
    return this.mapTransaction(updated);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await this.transactionModel.deleteOne({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    });
    return result.deletedCount > 0;
  }

  async findAll(
    userId: string,
    filter?: TransactionFilterInput,
    pagination?: PaginationInput,
  ): Promise<PaginatedTransactions> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 15;
    const skip = (page - 1) * limit;

    const query: any = { userId: new Types.ObjectId(userId) };

    if (filter?.type) {
      query.type = filter.type;
    }
    if (filter?.category) {
      query.category = filter.category;
    }
    if (filter?.paymentMethod) {
      query.paymentMethod = filter.paymentMethod;
    }
    if (filter?.startDate || filter?.endDate) {
      query.date = {};
      if (filter.startDate) query.date.$gte = new Date(filter.startDate);
      if (filter.endDate) query.date.$lte = new Date(filter.endDate);
    }
    if (filter?.search) {
      const regex = new RegExp(filter.search, 'i');
      query.$or = [{ title: regex }, { notes: regex }, { tags: regex }];
    }

    const [items, totalCount] = await Promise.all([
      this.transactionModel
        .find(query)
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.transactionModel.countDocuments(query).exec(),
    ]);

    return {
      items: items.map((t) => this.mapTransaction(t)),
      totalCount,
      totalPages: Math.ceil(totalCount / limit) || 1,
      currentPage: page,
    };
  }

  async getStats(userId: string): Promise<TransactionStats> {
    const userObjectId = new Types.ObjectId(userId);

    // 1. Overall Income vs Expense
    const totals = await this.transactionModel.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpense = 0;
    for (const t of totals) {
      if (t._id === 'INCOME') totalIncome = t.total;
      if (t._id === 'EXPENSE') totalExpense = t.total;
    }

    const netBalance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

    // 2. Category Breakdown (for Expenses)
    const categoryAgg = await this.transactionModel.aggregate([
      { $match: { userId: userObjectId, type: 'EXPENSE' } },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    const categoryBreakdown: CategorySpendBreakdown[] = categoryAgg.map((c) => ({
      category: c._id,
      totalAmount: c.totalAmount,
      count: c.count,
      percentage: totalExpense > 0 ? Math.round((c.totalAmount / totalExpense) * 1000) / 10 : 0,
    }));

    // 3. Monthly Trends (last 6 months)
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const monthlyAgg = await this.transactionModel.aggregate([
      {
        $match: {
          userId: userObjectId,
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Build timeline for each of the last 6 months
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendMap = new Map<string, { income: number; expense: number }>();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      trendMap.set(key, { income: 0, expense: 0 });
    }

    for (const item of monthlyAgg) {
      const monthIdx = item._id.month - 1;
      const key = `${monthNames[monthIdx]} ${item._id.year}`;
      if (trendMap.has(key)) {
        const val = trendMap.get(key)!;
        if (item._id.type === 'INCOME') val.income = item.total;
        if (item._id.type === 'EXPENSE') val.expense = item.total;
      }
    }

    const monthlyTrends: MonthlyTrend[] = [];
    let recentExpensesSum = 0;
    let recentMonthsCount = 0;

    trendMap.forEach((val, month) => {
      monthlyTrends.push({
        month,
        income: val.income,
        expense: val.expense,
        netSavings: val.income - val.expense,
      });
      if (val.expense > 0) {
        recentExpensesSum += val.expense;
        recentMonthsCount++;
      }
    });

    const monthlyBurnRate = recentMonthsCount > 0 ? recentExpensesSum / recentMonthsCount : totalExpense;

    return {
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpense: Math.round(totalExpense * 100) / 100,
      netBalance: Math.round(netBalance * 100) / 100,
      savingsRate: Math.round(savingsRate * 10) / 10,
      monthlyBurnRate: Math.round(monthlyBurnRate * 100) / 100,
      categoryBreakdown,
      monthlyTrends,
    };
  }

  mapTransaction(tx: TransactionDocument): TransactionType {
    return {
      id: tx._id.toString(),
      title: tx.title,
      amount: tx.amount,
      type: tx.type,
      category: tx.category,
      date: tx.date,
      paymentMethod: tx.paymentMethod || 'Credit Card',
      notes: tx.notes || '',
      tags: tx.tags || [],
      isRecurring: !!tx.isRecurring,
      createdAt: (tx as any).createdAt || new Date(),
    };
  }
}
