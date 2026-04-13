import { env } from './config.js';
import { app } from './app.js';
import { closeDatabase } from './database/database.js';

const port = env.PORT;

const server = app.listen(port, () => {
  console.log(`🚀 API server running on http://localhost:${port}`);
});

// Graceful shutdown
function shutdown() {
  console.log('\n🛑 Shutting down gracefully…');
  server.close(() => {
    closeDatabase();
    console.log('👋 Server stopped');
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
