import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { handler } from '../app/lib/api-handlers';
import { apiData, DataError } from '../app/lib/api-data';

vi.mock('../app/lib/api-data', async importOriginal => {
  const original = await importOriginal<typeof import('../app/lib/api-data')>();
  return { ...original, apiData: { list: vi.fn(), get: vi.fn(), save: vi.fn(), remove: vi.fn() } };
});

const id = '5e2e4430-3944-4b5c-9cca-91498af685b8';
const context = { params: Promise.resolve({ id }) };
const fixtures = {
  customers: { name: 'Test customer', email: 'customer@example.test' },
  invoices: { customerId: id, amountCents: 1250, status: 'pending' },
};
function request(method: string, path = '', body?: object, key = 'local-test-key') {
  return new Request('http://localhost/api/v1' + path, {
    method,
    headers: { 'x-api-key': key, 'content-type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

beforeEach(() => vi.stubEnv('DASHBOARD_API_KEY', 'local-test-key'));
afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetAllMocks();
});

describe.each(['customers', 'invoices'] as const)('%s API contract', resource => {
  it.each([['GET', false], ['POST', false], ['GET', true], ['PUT', true], ['DELETE', true]] as const)(
    'rejects unauthorized %s (item=%s)', async (method, item) => {
      const response = await handler(resource, method, item)(request(method, '', undefined, ''), context);
      expect(response.status).toBe(401);
      expect(await response.json()).toMatchObject({ error: { code: 'UNAUTHORIZED' } });
      expect(apiData.list).not.toHaveBeenCalled();
      expect(apiData.get).not.toHaveBeenCalled();
      expect(apiData.save).not.toHaveBeenCalled();
      expect(apiData.remove).not.toHaveBeenCalled();
    },
  );

  it('validates pagination and forwards valid search', async () => {
    const list = handler(resource, 'GET');
    expect((await list(request('GET', '?pageSize=51'))).status).toBe(400);
    vi.mocked(apiData.list).mockResolvedValue({ items: [], page: 2, pageSize: 10, total: 0 });
    expect((await list(request('GET', '?page=2&q=demo'))).status).toBe(200);
    expect(apiData.list).toHaveBeenCalledWith(resource, { page: 2, pageSize: 10, q: 'demo' });
  });

  it('returns 201 for valid create and 422 for invalid body', async () => {
    const create = handler(resource, 'POST');
    expect((await create(request('POST', '', {}))).status).toBe(422);
    vi.mocked(apiData.save).mockResolvedValue({ id, ...fixtures[resource] });
    const result = await create(request('POST', '', fixtures[resource]));
    expect(result.status).toBe(201);
    expect(await result.json()).toMatchObject({ id });
  });

  it('returns 404 for missing records and rejects invalid IDs', async () => {
    const get = handler(resource, 'GET', true);
    expect((await get(request('GET'), { params: Promise.resolve({ id: 'invalid' }) })).status).toBe(400);
    expect((await get(request('GET'), context)).status).toBe(404);
    expect((await handler(resource, 'PUT', true)(request('PUT', '', fixtures[resource]), context)).status).toBe(404);
    expect((await handler(resource, 'DELETE', true)(request('DELETE'), context)).status).toBe(404);
  });

  it('reads, updates and deletes an existing record', async () => {
    const record = { id, ...fixtures[resource] };
    vi.mocked(apiData.get).mockResolvedValue(record);
    vi.mocked(apiData.save).mockResolvedValue(record);
    vi.mocked(apiData.remove).mockResolvedValue(true);
    expect((await handler(resource, 'GET', true)(request('GET'), context)).status).toBe(200);
    expect((await handler(resource, 'PUT', true)(request('PUT', '', {}), context)).status).toBe(422);
    expect((await handler(resource, 'PUT', true)(request('PUT', '', fixtures[resource]), context)).status).toBe(200);
    const deletion = await handler(resource, 'DELETE', true)(request('DELETE'), context);
    expect(deletion.status).toBe(204);
    expect(await deletion.text()).toBe('');
  });
});

it('returns a conflict for linked customers', async () => {
  vi.mocked(apiData.remove).mockRejectedValue(new DataError(409, 'Linked invoices.'));
  const response = await handler('customers', 'DELETE', true)(request('DELETE'), context);
  expect(response.status).toBe(409);
  expect(await response.json()).toEqual({ error: { code: 'CONFLICT', message: 'Linked invoices.' } });
});

it('fails closed when no server key is configured and on a wrong key', async () => {
  const list = handler('customers', 'GET');
  expect((await list(request('GET', '', undefined, 'wrong'))).status).toBe(401);
  vi.stubEnv('DASHBOARD_API_KEY', '');
  expect((await list(request('GET'))).status).toBe(401);
});
