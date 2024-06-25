import express from 'express';
import config from 'config';
import cors from 'cors';
import log from '@utils/logger';
import cookieParser from 'cookie-parser';
import connectDB from '@utils/connect';
import deserializeUser from '@middleware/deserialize-user';
import routes from './routes';

// Define the server port
const serverPort: number = config.get<number>('server.port');

// Create the express app
const app = express();

// Add the CORS middleware
app.use(cors({
  origin: config.get<string>('origin'),
  credentials: true,
}));

// Add the Cookie Parser middleware
app.use(cookieParser());

// Add the JSON middleware
app.use(express.json());

// Add the routes
app.use(deserializeUser);

// Start the server
app.listen(serverPort, async () => {
  log.info(`Server started on port ${serverPort}`);

  await connectDB();

  routes(app);
});
