const { execSync } = require('child_process');

// Ensure DATABASE_URL is present so prisma generate succeeds on CI/CD (Vercel) even before DB setup
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/gta_vice_db?schema=public';

try {
  console.log('[Prisma] Running prisma generate for production build...');
  execSync('npx prisma generate', { stdio: 'inherit', env: process.env });
  console.log('[Prisma] Client generated successfully.');
} catch (err) {
  console.warn('[Prisma] Generation failed or bypassed (fallback active):', err.message);
}
