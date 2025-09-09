import mongoose, {Model, Schema} from "mongoose";

interface IAllowedUser extends Document {
    telegramId: number;
    username?: string;
    addedAt: Date;
}

const allowedUserSchema = new Schema<IAllowedUser>({
    telegramId: { type: Number, unique: true, required: true },
    username: { type: String },
    addedAt: { type: Date, default: Date.now }
});

const AllowedUser: Model<IAllowedUser> =
    mongoose.models.AllowedUser || mongoose.model<IAllowedUser>("AllowedUser", allowedUserSchema);

export default AllowedUser
