import http from 'http';
import { createApp } from './app';
import { config } from './core/config/env.config';
import { wsGateway } from './core/websocket/websocket.gateway';
import { db } from './data/db';

async function bootstrap() {
  // 1. Initialize Express Application
  const app = createApp();

  // 2. Create HTTP Server
  const server = http.createServer(app);

  // 3. Initialize Real-Time WebSocket Gateway
  wsGateway.initialize(server, config.wsPath);

  // 4. Start Listening
  server.listen(config.port, () => {
    console.log(`\n=============================================================`);
    console.log(`🚀 Quantum Personal AI OS Backend v3.0`);
    console.log(`📡 HTTP Server: http://localhost:${config.port}`);
    console.log(`⚡ WebSocket Gateway: ws://localhost:${config.port}${config.wsPath}`);
    console.log(`📚 REST API Base: http://localhost:${config.port}${config.apiPrefix}`);
    console.log(`=============================================================\n`);
  });
}

bootstrap().catch((err) => {
  console.error('Fatal Server Bootstrap Error:', err);
  process.exit(1);
});
