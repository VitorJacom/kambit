import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  email?: string | null;
  name: string;
  avatarUrl?: string;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, index: true },
    name: { type: String, required: true },
    avatarUrl: String,
    roles: { type: [String], default: [] },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true, sparse: true });

export const User = model<IUser>("User", UserSchema);
