import mongoose, { Schema, Document, Model } from "mongoose";

interface IUser extends Document {
    email: string;
    passwordHash: string;
}

const userSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
});

const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
