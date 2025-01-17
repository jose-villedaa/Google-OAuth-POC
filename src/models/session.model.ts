import mongoose from 'mongoose';
import { SessionDocument } from 'src/documents';

// This is the schema used to validate the session data
const sessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    valid: { type: Boolean, default: true },
    userAgent: { type: String },
  },
  {
    timestamps: true,
  },
);

const SessionModel = mongoose.model<SessionDocument>('Session', sessionSchema);

export default SessionModel;
