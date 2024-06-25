import logger from 'pino';
import dayjs from 'dayjs';

const log = logger({

  // Pretty print the logs
  prettyPrint: true,
  base: {
    pid: false,
  },

  // Add a timestamp to each log entry
  timestamp: () => `,"time":"${dayjs().format()}"`,
});

export default log;
