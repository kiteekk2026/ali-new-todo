import { createHash, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { apiData, DataError, type Input, type Resource } from './api-data';

type Context = { params: Promise<{ id?: string }> };
type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';
const idSchema = z.string().uuid();
const paging = z.object({
  page: z.coerce.number().int().min(1).max(1000000).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  q: z.string().max(200).default(''),
});
const invoice = z.object({
  customerId: idSchema,
  amountCents: z.number().int().min(1).max(2147483647),
  status: z.enum(['pending', 'paid']),
}).strict();
const customer = z.object({
  name: z.string().trim().min(1).max(255),
  email: z.string().email().max(255),
}).strict();
const headers = { 'Cache-Control': 'no-store' };
const codes: Record<number, string> = {
  400: 'INVALID_PARAMETER', 401: 'UNAUTHORIZED', 404: 'NOT_FOUND',
  409: 'CONFLICT', 422: 'VALIDATION_ERROR', 500: 'INTERNAL_ERROR',
};

function failure(status: number, message: string) {
  return Response.json({ error: { code: codes[status], message } }, { status, headers });
}

function authorized(request: Request) {
  const key = process.env.DASHBOARD_API_KEY;
  const candidate = request.headers.get('x-api-key');
  if (!key || !candidate) return false;
  const hash = (value: string) => createHash('sha256').update(value).digest();
  return timingSafeEqual(hash(key), hash(candidate));
}

async function readInput(request: Request, resource: Resource): Promise<Input | null> {
  try {
    const raw: unknown = await request.json();
    const input = (resource === 'invoices' ? invoice : customer).safeParse(raw);
    return input.success ? input.data : null;
  } catch {
    return null;
  }
}

export function handler(resource: Resource, method: Method, item = false) {
  return async (request: Request, context?: Context) => {
    if (!authorized(request)) return failure(401, 'Missing or invalid API key.');
    try {
      const id = item ? idSchema.safeParse((await context?.params)?.id) : undefined;
      if (id && !id.success) return failure(400, 'Invalid record ID.');

      if (method === 'GET' && !id) {
        const filters = paging.safeParse(Object.fromEntries(new URL(request.url).searchParams));
        if (!filters.success) return failure(400, 'Invalid pagination or search parameters.');
        return Response.json(await apiData.list(resource, filters.data), { headers });
      }
      if (method === 'GET' && id) {
        const record = await apiData.get(resource, id.data);
        return record ? Response.json(record, { headers }) : failure(404, 'Record not found.');
      }
      if (method === 'DELETE' && id) {
        return await apiData.remove(resource, id.data)
          ? new Response(null, { status: 204, headers })
          : failure(404, 'Record not found.');
      }

      const input = await readInput(request, resource);
      if (!input) return failure(422, 'Request body failed validation.');
      const record = await apiData.save(resource, input, id?.data);
      return record
        ? Response.json(record, { status: method === 'POST' ? 201 : 200, headers })
        : failure(404, 'Record not found.');
    } catch (error) {
      if (error instanceof DataError) return failure(error.status, error.message);
      return failure(500, 'Unexpected server error.');
    }
  };
}
