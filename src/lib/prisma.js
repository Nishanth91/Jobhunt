import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

let prismaInstance = globalForPrisma.prisma ?? null;

async function initPrisma() {
  if (prismaInstance) return prismaInstance;

  if (process.env.TURSO_DATABASE_URL) {
    try {
      const adapterMod = await import('@prisma/adapter-libsql');
      const clientMod = await import('@libsql/client');
      const PrismaAdapter = adapterMod.PrismaLibSql || adapterMod.PrismaLibSQL || adapterMod.default;
      const libsql = clientMod.createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
      });
      prismaInstance = new PrismaClient({ adapter: new PrismaAdapter(libsql) });
    } catch (e) {
      console.warn('Turso adapter init failed, using default PrismaClient:', e.message);
      prismaInstance = new PrismaClient();
    }
  } else {
    prismaInstance = new PrismaClient();
  }

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaInstance;
  }
  return prismaInstance;
}

// Pre-initialize at module load (non-blocking)
const ready = initPrisma();

// Export a proxy that waits for initialization on first use.
// Handles chained access like prisma.user.findMany() and direct calls like prisma.$disconnect()
export const prisma = new Proxy({}, {
  get(_, prop) {
    if (prop === 'then') return undefined; // Prevent treating as thenable

    // For $ methods like $disconnect, $connect, $transaction — callable directly
    if (typeof prop === 'string' && prop.startsWith('$')) {
      return (...args) => ready.then((client) => client[prop](...args));
    }

    // For model accessors like .user, .resume, .savedJob etc.
    // Return a nested proxy so that prisma.user.findMany(...) works correctly
    return new Proxy({}, {
      get(_, method) {
        if (method === 'then') return undefined;
        return (...args) => ready.then((client) => client[prop][method](...args));
      },
    });
  },
});
