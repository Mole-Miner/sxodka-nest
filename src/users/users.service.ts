import { from, Observable } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { User, UserDocument } from './user.schema';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private readonly _userModel: Model<UserDocument>) { }

    findAll(): Observable<User[]> {
        return from(this._userModel.find().exec());
    }

    findById(id: string): Observable<User> {
        return from(this._userModel.findById(id));
    }

    findOneByEmail(email: string): Observable<User> {
        return from(this._userModel.findOne({ email }));
    }

    create(dto: any): Observable<User> {
        const createdUser = new this._userModel(dto);
        return from(createdUser.save());
    }

    findByIdAndUpdate(id: string, dto: any): Observable<User> {
        return from(this._userModel.findByIdAndUpdate(id, dto, { new: false }));
    }
    
    findByIdAndRemove(id: string): Observable<User> {
        return from(this._userModel.findByIdAndRemove(id))
    }
}
