import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Recurring, RecurringDocument } from './recurring.schema';
import { CreateRecurringInput, RecurringType } from './dto/recurring.dto';

@Injectable()
export class RecurringService {
  constructor(
    @InjectModel(Recurring.name)
    private recurringModel: Model<RecurringDocument>,
  ) {}

  async findAll(userId: string): Promise<RecurringType[]> {
    const list = await this.recurringModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ nextDueDate: 1 })
      .exec();
    return list.map((r) => this.mapRecurring(r));
  }

  async create(input: CreateRecurringInput, userId: string): Promise<RecurringType> {
    const item = new this.recurringModel({
      ...input,
      userId: new Types.ObjectId(userId),
      status: 'ACTIVE',
    });
    const saved = await item.save();
    return this.mapRecurring(saved);
  }

  async toggleStatus(id: string, userId: string): Promise<RecurringType> {
    const item = await this.recurringModel.findOne({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    });
    if (!item) throw new Error('Subscription not found');

    item.status = item.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    const saved = await item.save();
    return this.mapRecurring(saved);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const res = await this.recurringModel.deleteOne({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    });
    return res.deletedCount > 0;
  }

  mapRecurring(doc: RecurringDocument): RecurringType {
    return {
      id: doc._id.toString(),
      title: doc.title,
      amount: doc.amount,
      type: doc.type,
      category: doc.category,
      frequency: doc.frequency,
      nextDueDate: doc.nextDueDate,
      paymentMethod: doc.paymentMethod,
      status: doc.status,
    };
  }
}
