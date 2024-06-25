import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import config from 'config';
import log from '@utils/logger';
import { UserDocument } from 'src/documents';

// This is the schema used to validate the user data
const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    picture: { type: String },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

// This is a pre-save hook, which is called before the 'save' method is called on a model.
userSchema.pre('save', async function save(next) {
  const user = this as UserDocument;

  if (!user.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(config.get<number>('saltWorkFactor'));

  const hash = bcrypt.hashSync(user.password, salt);

  user.password = hash;

  return next();
});

// This is a method that is added to the user schema to compare the password
userSchema.methods.comparePassword = async function comparePassword(
  candidatePassword: string,
): Promise<boolean> {
  const user = this as UserDocument;

  return bcrypt.compare(candidatePassword, user.password).catch((e) => {
    log.error(e);
    return false;
  });
};

const UserModel = mongoose.model<UserDocument>('User', userSchema);

export default UserModel;
