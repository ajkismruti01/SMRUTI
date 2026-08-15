const timestamp = () => new Date().toISOString();

export const logger = {
  info: (msg, meta = '') => console.log(`[INFO] [${timestamp()}] ${msg}`, meta),
  warn: (msg, meta = '') => console.warn(`[WARN] [${timestamp()}] ${msg}`, meta),
  error: (msg, meta = '') => console.error(`[ERROR] [${timestamp()}] ${msg}`, meta),
  debug: (msg, meta = '') => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] [${timestamp()}] ${msg}`, meta);
    }
  },
};
