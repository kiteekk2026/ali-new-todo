import postgres from 'postgres';

let client: ReturnType<typeof postgres> | undefined;

export function getDatabase() {
  const url = process.env.POSTGRES_URL;
  if (!url) throw new Error('POSTGRES_URL is not defined');
  client ??= postgres(url, { ssl: 'require' });
  return client;
}
