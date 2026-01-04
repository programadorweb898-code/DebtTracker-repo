// Wrapper para Next.js standalone que asegura el puerto correcto
const { spawn } = require('child_process');

const PORT = process.env.PORT || 3000;
const HOSTNAME = process.env.HOSTNAME || '0.0.0.0';

console.log('==================================');
console.log('🚀 DebtTracker Server Wrapper');
console.log('==================================');
console.log('📍 Hostname:', HOSTNAME);
console.log('🔌 Port:', PORT);
console.log('🔧 Node:', process.version);
console.log('📁 Working directory:', process.cwd());
console.log('==================================');

// Asegurar que las variables de entorno estén configuradas
process.env.PORT = PORT;
process.env.HOSTNAME = HOSTNAME;

// Iniciar el servidor Next.js
console.log('🚀 Starting Next.js server...');
console.log('==================================\n');

const server = spawn('node', ['server.js'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: PORT,
    HOSTNAME: HOSTNAME
  }
});

server.on('error', (err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log(`\n🛑 Server exited with code ${code}`);
  process.exit(code);
});

// Manejar señales de terminación
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM received, shutting down gracefully');
  server.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT received, shutting down gracefully');
  server.kill('SIGINT');
});
