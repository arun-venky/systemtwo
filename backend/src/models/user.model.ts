import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { IRole } from './role.model.js';

// User document interface
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: mongoose.Types.ObjectId | IRole;
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  resetToken?: string;
  resetTokenExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateResetToken(): Promise<string>;
  generateVerificationToken(): Promise<string>;
}

// Create User schema
const UserSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: undefined,
    },
    verificationTokenExpiry: {
      type: Date,
      default: undefined,
    },
    resetToken: {
      type: String,
      default: undefined,
    },
    resetTokenExpiry: {
      type: Date,
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password as string, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate password reset token
UserSchema.methods.generateResetToken = async function (): Promise<string> {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetToken = resetToken;
  this.resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
  return resetToken;
};

// Method to generate email verification token
UserSchema.methods.generateVerificationToken = async function (): Promise<string> {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  this.verificationToken = verificationToken;
  this.verificationTokenExpiry = new Date(Date.now() + 24 * 3600000); // 24 hours
  return verificationToken;
};

// Create and export User model
export const User = mongoose.model<IUser>('User', UserSchema);