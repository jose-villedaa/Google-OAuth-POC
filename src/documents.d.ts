import mongoose from 'mongoose';

// This is the schema used to validate the user data
export interface SessionDocument extends mongoose.Document {
  user: UserDocument['_id'];
  valid: boolean;
  userAgent: string;
  createdAt: Date;
  updatedAt: Date;
}

// This is the schema used to validate the user data
export interface UserDocument extends mongoose.Document {
  email: string;
  name: string;
  password: string;
  picture?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}
