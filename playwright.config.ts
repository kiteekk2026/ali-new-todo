import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { defineConfig, devices } from '@playwright/test';

const envFile = '.env.test.local';
let testEnv: NodeJS.ProcessEnv;
try {
  testEnv = parseEnv(readFileSync(envFile, 'utf8')) as NodeJS.ProcessEnv;
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  throw new Error('Create .env.test.local from .env.test.example. See docs/test-environment.md.');
}

const databaseUrl = URL.parse(testEnv.POSTGRES_URL ?? '');
const supabaseUrl = testEnv.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  testEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || testEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (
  databaseUrl?.protocol !== 'postgresql:' ||
  databaseUrl.hostname !== '127.0.0.1' ||
  databaseUrl.port !== '54322' ||
  databaseUrl.pathname !== '/postgres' ||
  databaseUrl.search ||
  databaseUrl.hash ||
  supabaseUrl !== 'http://127.0.0.1:54321' ||
  !supabaseKey
) {
  throw new Error('Use the dedicated local Supabase test stack on ports 54321 and 54322.');
}

const email = testEnv.TEST_USER_EMAIL;
const password = testEnv.TEST_USER_PASSWORD;
if (!email?.endsWith('@example.test') || !password) {
  throw new Error('Set the seeded example.test user credentials in .env.test.local.');
}
process.env.TEST_USER_EMAIL = email;
process.env.TEST_USER_PASSWORD = password;

const baseURL = 'http://127.0.0.1:3107';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.e2e.ts',
  use: { baseURL, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'pnpm dev --hostname 127.0.0.1 --port 3107',
    url: baseURL + '/login',
    timeout: 120_000,
    reuseExistingServer: false,
    env: {
      POSTGRES_URL: databaseUrl.href,
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseKey,
    },
  },
});
