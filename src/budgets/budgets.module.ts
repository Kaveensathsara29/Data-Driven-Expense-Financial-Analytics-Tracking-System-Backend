import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Budget, BudgetSchema } from './budget.schema';
import { User, UserSchema } from '../auth/user.schema';
import { BudgetService } from './budget.service';
import { BudgetResolver } from './budget.resolver';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Budget.name, schema: BudgetSchema },
      { name: User.name, schema: UserSchema },
    ]),
    TransactionsModule,
  ],
  providers: [BudgetService, BudgetResolver],
  exports: [BudgetService],
})
export class BudgetsModule {}
