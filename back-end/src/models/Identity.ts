import { Schema, model, Document, Types } from "mongoose";

export interface IIdentity extends Document {
  userId: Types.ObjectId;
  provider: "github" | "gitlab";
  providerUserId: string;
  username: string;
  email?: string;
  avatarUrl?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenScope?: string;
  rawProfile: any;
  createdAt: Date;
  updatedAt: Date;
}

const IdentitySchema = new Schema<IIdentity>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    provider: { type: String, enum: ["github", "gitlab"], required: true },
    providerUserId: { type: String, required: true },
    username: String,
    email: String,
    avatarUrl: String,
    accessToken: { type: String, select: false },
    refreshToken: { type: String, select: false },
    tokenScope: String,
    rawProfile: {},
  },
  { timestamps: true }
);

IdentitySchema.index({ provider: 1, providerUserId: 1 }, { unique: true });

export const Identity = model<IIdentity>("Identity", IdentitySchema);
