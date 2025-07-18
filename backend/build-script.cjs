const { execSync } = require('child_process');
require('dotenv').config({ path: __dirname + '/.env' });

try {
  console.log("DATABASE_URL from build-script:", process.env.DATABASE_URL);
  console.log('Running prisma migrate deploy...');
  execSync('npx prisma migrate deploy --schema=./backend/prisma/schema.prisma', { stdio: 'inherit' });

  console.log('Running next build...');
  execSync('next build', { stdio: 'inherit' });
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}