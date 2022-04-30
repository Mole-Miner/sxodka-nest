import { AbilityModule } from './../ability/ability.module';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';
import { User, UserSchema } from './user.schema';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [
    forwardRef(async () => AuthModule),
    AbilityModule,
    MongooseModule.forFeatureAsync([
      {
        name: User.name,
        useFactory: async () => UserSchema
      }
    ])
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule { }
