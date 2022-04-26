import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type UserDocument = User & Document;

@Schema()
export class User {
    readonly _id!: string;

    @Prop({ required: true })
    firstname!: string;

    @Prop({ required: true })
    lastname!: string;

    @Prop({ unique: true, required: true })
    email!: string;

    @Prop({ required: true })
    password!: string;
}

export const UserSchema = SchemaFactory.createForClass(User);