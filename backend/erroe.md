[nodemon] starting `node src/server.js`
2025-07-06 12:59:57 [info]: ✅ Database connection established successfully {
  "service": "swarmfill-backend"
}
info: ✅ Database connection established successfully {"service":"swarmfill-backend","timestamp":"2025-07-06 12:59:57"}
2025-07-06 12:59:57 [info]: Database connected successfully {
  "service": "swarmfill-backend"
}
info: Database connected successfully {"service":"swarmfill-backend","timestamp":"2025-07-06 12:59:57"}
📊 Database models synchronized with associations
2025-07-06 12:59:59 [info]: Database models synchronized {
  "service": "swarmfill-backend"
}
info: Database models synchronized {"service":"swarmfill-backend","timestamp":"2025-07-06 12:59:59"}
2025-07-06 12:59:59 [info]: 🔌 Attempting to connect to Redis for Socket.IO adapter... {
  "service": "swarmfill-backend"
}
info: 🔌 Attempting to connect to Redis for Socket.IO adapter... {"service":"swarmfill-backend","timestamp":"2025-07-06 12:59:59"}
node:events:496
      throw er; // Unhandled 'error' event
      ^

Error: listen EADDRINUSE: address already in use :::3001
    at Server.setupListenHandle [as _listen2] (node:net:1937:16)
    at listenInCluster (node:net:1994:12)
    at Server.listen (node:net:2099:7)
    at Function.listen (D:\swarmFill-network\Sparkathon_swarm\node_modules\express\lib\application.js:635:24)
    at startServer (D:\swarmFill-network\Sparkathon_swarm\backend\src\server.js:112:24)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
Emitted 'error' event on Server instance at:
    at emitErrorNT (node:net:1973:8)
    at process.processTicksAndRejections (node:internal/process/task_queues:90:21) {
  code: 'EADDRINUSE',
  errno: -4091,
  syscall: 'listen',
  address: '::',
  port: 3001
}

Node.js v22.14.0
[nodemon] app crashed - waiting for file changes before starting...
