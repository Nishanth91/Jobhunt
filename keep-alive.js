// Self-ping to prevent Render free tier from sleeping
// Pings the /api/health endpoint every 14 minutes

const APP_URL = process.env.NEXTAUTH_URL || process.env.RENDER_EXTERNAL_URL;

if (!APP_URL) {
  console.log('[keep-alive] No APP_URL found, skipping self-ping');
  process.exit(0);
}

const INTERVAL = 14 * 60 * 1000; // 14 minutes

async function ping() {
  try {
    const res = await fetch(`${APP_URL}/api/health`);
    const data = await res.json();
    console.log(`[keep-alive] Pinged at ${data.timestamp} — status: ${data.status}`);
  } catch (err) {
    console.log(`[keep-alive] Ping failed: ${err.message}`);
  }
}

// Initial ping after 60 seconds (wait for app to start)
setTimeout(() => {
  ping();
  setInterval(ping, INTERVAL);
}, 60000);

console.log(`[keep-alive] Will ping ${APP_URL} every 14 minutes`);
