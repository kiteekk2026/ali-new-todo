import postgres from 'postgres';

let client: ReturnType<typeof postgres> | undefined;

export function getDatabase() {
  const url = process.env.POSTGRES_URL;
  if (!url) throw new Error('POSTGRES_URL is not defined');
  const host = new URL(url).hostname;
  const local = host === '127.0.0.1' || host === 'localhost' || host === '[::1]';
  client ??= postgres(url, { ssl: local ? false : 'require' });
  return client;
}
