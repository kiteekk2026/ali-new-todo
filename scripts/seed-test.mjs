import postgres from 'postgres';
import { createClient } from '@supabase/supabase-js';

const env = process.env;
const db = new URL(env.POSTGRES_URL);
const api = new URL(env.NEXT_PUBLIC_SUPABASE_URL);
if (db.hostname !== '127.0.0.1' || db.port !== '54322' ||
    db.pathname !== '/postgres' || api.origin !== 'http://127.0.0.1:54321' ||
    db.search || db.hash) {
  throw new Error('Use a disposable local Supabase stack on ports 54321 and 54322.');
}
if (!env.SUPABASE_SERVICE_ROLE_KEY || !env.TEST_USER_EMAIL?.endsWith('@example.test') || !env.TEST_USER_PASSWORD) {
  throw new Error('Set the local service role key and a dedicated example.test account.');
}

const auth = createClient(api.origin, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const { data, error } = await auth.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (error) throw error;
const existing = data.users.find(({ email }) => email === env.TEST_USER_EMAIL);
const credentials = { password: env.TEST_USER_PASSWORD, email_confirm: true };
const result = existing
  ? await auth.auth.admin.updateUserById(existing.id, credentials)
  : await auth.auth.admin.createUser({ email: env.TEST_USER_EMAIL, ...credentials });
if (result.error) throw result.error;

const sql = postgres(db.toString(), { max: 1 });
try {
  await sql.begin(async (tx) => {
    await tx`CREATE TABLE IF NOT EXISTS customers (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL,
      email text UNIQUE NOT NULL, image_url text NOT NULL
    )`;
    await tx`CREATE TABLE IF NOT EXISTS invoices (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_id uuid NOT NULL REFERENCES customers(id),
      amount integer NOT NULL, status text NOT NULL, date date NOT NULL
    )`;
    await tx`CREATE TABLE IF NOT EXISTS revenue (month text NOT NULL, revenue integer NOT NULL)`;
    await tx`TRUNCATE invoices, customers, revenue`;
    const [linked] = await tx`INSERT INTO customers (name, email, image_url)
      VALUES ('Linked customer', 'linked@example.test', '/customers/amy-burns.png') RETURNING id`;
    await tx`INSERT INTO customers (name, email, image_url)
      VALUES ('Unlinked customer', 'unlinked@example.test', '/customers/lee-robinson.png')`;
    await tx`INSERT INTO invoices (customer_id, amount, status, date)
      SELECT ${linked.id}, n * 100, 'pending', DATE '2026-01-01' + n
      FROM generate_series(1, 14) AS n`;
    await tx`INSERT INTO revenue (month, revenue) VALUES ('Jan', 10500)`;
  });
  console.log('Seeded the local test account and dashboard fixtures.');
} finally {
  await sql.end();
}
