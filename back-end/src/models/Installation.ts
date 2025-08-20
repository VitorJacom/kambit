import { Schema, model, Document } from "mongoose";

export interface IInstallation extends Document {
  installationId: number;
  accountLogin: string;
  accountType: "Organization" | "User";
  targetType: "Organization" | "User";
  // opcional: lista de repos sincronizados pelo Kambit
  repositories?: { id: number; name: string; full_name: string }[];
}

const InstallationSchema = new Schema<IInstallation>(
  {
    installationId: { type: Number, unique: true, index: true, required: true },
    accountLogin: { type: String, index: true },
    accountType: { type: String, enum: ["Organization", "User"] },
    targetType: { type: String, enum: ["Organization", "User"] },
    repositories: [{ id: Number, name: String, full_name: String }],
  },
  { timestamps: true }
);

export const Installation = model<IInstallation>(
  "Installation",
  InstallationSchema
);
