import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: { type: String, required: true, enum: ["student", "teacher", "admin"] },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

const recordSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    resource: { type: String, required: true, maxlength: 64 },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

recordSchema.index({ ownerId: 1, resource: 1, createdAt: -1 });

const passwordResetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, expires: 0 },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model("User", userSchema);
export const Record = mongoose.models.Record || mongoose.model("Record", recordSchema);
export const PasswordReset =
  mongoose.models.PasswordReset || mongoose.model("PasswordReset", passwordResetSchema);
