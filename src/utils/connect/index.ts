import mongoose from 'mongoose';
import log from '@utils/logger';
import config from 'config';

// Connect to the database
const connectDB = async (): Promise<void> => {
  // Get the database URL from the configuration
  const dbUri: string = config.get<string>('db.uri');

  try {
    await mongoose.connect(dbUri);
    log.info('Connected to the database');
  } catch (error) {
    log.error('Error connecting to the database', error);
    process.exit(1);
  }
};

export default connectDB;
