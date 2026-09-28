import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Recurring, RecurringSchema } from './recurring.schema';
import { User, UserSchema } from '../auth/user.schema';
import { RecurringService } from './recurring.service';
import { RecurringResolver } from './recurring.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Recurring.name, schema: RecurringSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [RecurringService, RecurringResolver],
  exports: [RecurringService],
})
export class RecurringModule {}
