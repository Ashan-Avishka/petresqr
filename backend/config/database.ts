// src/config/database.ts
import mongoose from 'mongoose';
import dns from 'dns';

// Windows system DNS fails to resolve Atlas hostnames reliably.
// This lookup override uses c-ares (which respects dns.setServers) instead of getaddrinfo.
function customLookup(hostname: string, options: dns.LookupOptions, callback: (err: NodeJS.ErrnoException | null, address: any, family: number) => void): void {
  dns.resolve4(hostname, (err, addresses) => {
    if (err) return callback(err, null, 4);
    const address = addresses[0];
    if (options.all) {
      callback(null, addresses.map(a => ({ address: a, family: 4 })), 4);
    } else {
      callback(null, address, 4);
    }
  });
}

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || '';

    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      heartbeatFrequencyMS: 5000,
      bufferCommands: true,
      lookup: customLookup,
    });

    console.log(`Connected to MongoDB: ${mongoUri}`);
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

// Handle connection events
mongoose.connection.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
});

// Ping every 30s to keep Atlas M0 from dropping idle connections
setInterval(() => {
  if (mongoose.connection.readyState === 1) {
    mongoose.connection.db?.admin().ping().catch(() => {});
  }
}, 30000);